import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import {
	Inject,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

import { UserPayload } from "../types";
import { User } from "../../user/user.entity";
import { SafeUser } from "../../../common/types";

export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject("USER_REPOSITORY") private userRepository: Repository<User>,
	) {
		const secret: string | undefined = process.env.JWT_SECRET;
		if (!secret) throw new InternalServerErrorException("JWT_SECRET must be set.");

		// Use cookies to store the JWT tokens

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request): string | null => {
					const cookies = req.cookies as Record<string, string>;
					return cookies?.JWT_fullstack ?? null;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	// Runs after the JWT is verified, but before the request reaches the controller
	// Payload is the data taken from the JWT token
	// What is returned will be attached to req.user

	async validate(payload: UserPayload): Promise<SafeUser> {
		const users: User[] = await this.userRepository.find({
			where: { id: payload.sub, email: payload.email },
		});

		if (users.length === 0) throw new UnauthorizedException("Invalid JWT Token.");
		if (users.length > 1)
			throw new InternalServerErrorException("Duplicate users found.");

		// Good place to add roles to req if we were doing RBAC
		const user: SafeUser = users[0];

		return user;
	}
}
