import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPayload } from "../types";
import { User } from "src/modules/user/user.entity";
import { Repository } from "typeorm";
import { Inject } from "@nestjs/common";

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>
    ) {

        const secret: string | undefined = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET must be set.");

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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

        if (!users) throw new Error("Invalid JWT Token.");
        if (users.length > 1) throw new Error("You done F-d up Jesse.");

        // Good place to add roles to req if we were doing RBAC
        const user: Omit<User,"hashedPassword"> = users[0];
        return user;

    }
}