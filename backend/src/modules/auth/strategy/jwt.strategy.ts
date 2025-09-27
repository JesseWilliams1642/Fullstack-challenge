import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { Inject } from "@nestjs/common";
import { Request } from "express";

import { UserPayload } from "../types";
import { User } from "../../user/user.entity";
import { SafeUser } from "../../../common/types";

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>
    ) {

        const secret: string | undefined = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET must be set.");            // NEEDS ERROR HANDLING

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                return req?.cookies?.['JWT_fullstack']; 
                },
            ]),       
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    // Runs after the JWT is verified, but before the request reaches the controller
    // Payload is the data taken from the JWT token
    // What is returned will be attached to req.user

    async validate(payload: UserPayload) {

        const users: User[] = await this.userRepository.find({

            where: {id: payload.sub, email: payload.email}

        });

        if (!users) throw new Error("Invalid JWT Token.");                  // NEEDS ERROR HANDLING
        if (users.length > 1) throw new Error("You done F-d up Jesse.");

        // Good place to add roles to req if we were doing RBAC
        const user: SafeUser = users[0];
        return user;

    }
}