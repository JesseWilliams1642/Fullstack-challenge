import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";

import { User } from "../user/user.entity";
import { AuthDTO } from "./dto";
import { comparePassword } from "../../common/utils";
import { JwtToken } from "./types";

@Injectable()
export class AuthService {
	constructor(
		@Inject("USER_REPOSITORY") private userRespository: Repository<User>,
		private jwt: JwtService,
	) {}

	// Login, checking for user existence and comparing the password
	// Returns a token signed using the user ID and email

	async login(dto: AuthDTO): Promise<JwtToken> {
		const email: string = dto.email;
		const password: string = dto.password;

		const user: User | null = await this.userRespository.findOneBy({ email });
		if (!user) throw new Error("User was not found."); // NEEDS ERROR HANDLING

		const equalPasswords: boolean = await comparePassword(
			password,
			user.hashedPassword,
		);
		if (!equalPasswords) throw new Error("Password mismatch."); // NEEDS ERROR HANDLING

		return await this.signToken(user.id, user.email);
	}

	// Sign a token using the id, email and a secret
	// Set its expiration time to 1 hour

	async signToken(id: string, email: string): Promise<JwtToken> {
		const secret: string | undefined = process.env.JWT_SECRET;
		if (!secret) throw new Error("JWT_SECRET must be set."); // NEEDS ERROR HANDLING

		const jwtPayload = {
			sub: id,
			email,
		};

		const token: string = await this.jwt.signAsync(jwtPayload, {
			expiresIn: "1h",
			secret,
		});

		return { jwtToken: token };
	}
}
