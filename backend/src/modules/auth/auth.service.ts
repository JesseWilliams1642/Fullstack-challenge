import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";

import { User } from "../user/user.entity";
import { AuthDTO } from "./dto";
import { comparePassword, hashPassword } from "../../common/utils";
import { JwtToken } from "./types";
import { SafeUser } from "src/common/types";

@Injectable()
export class AuthService {
	constructor(
		@Inject("USER_REPOSITORY") private userRepository: Repository<User>,
		private jwt: JwtService,
	) {}

	// Login, checking for user existence and comparing the password
	// Returns a token signed using the user ID and email

	async login(dto: AuthDTO): Promise<JwtToken> {
		const email: string = dto.email;
		const password: string = dto.password;

		const user: User | null = await this.userRepository.findOneBy({ email });
		if (!user) throw new NotFoundException("User was not found.");

		const equalPasswords: boolean = await comparePassword(
			password,
			user.hashedPassword,
		);
		if (!equalPasswords) throw new BadRequestException("Password mismatch.");

		return await this.signToken(user.id, user.email);
	}

	// Sign a token using the id, email and a secret
	// Set its expiration time to 1 hour

	async signToken(id: string, email: string): Promise<JwtToken> {
		const secret: string | undefined = process.env.JWT_SECRET;
		if (!secret) throw new InternalServerErrorException("JWT_SECRET must be set.");

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

	// Create a new user and add it to the database
	async createUser(
		email: string,
		password: string,
		name: string
	): Promise<SafeUser> {

		const user: User | null = await this.userRepository.findOneBy({ email });
		if (user) throw new BadRequestException("User is already registered.");

		const newUser: User = this.userRepository.create({
			email: email,
			hashedPassword: await hashPassword(password),
			name: name
		});

		const savedUser: User = await this.userRepository.save(newUser);
		return {
			id: savedUser.id,
			name: savedUser.name,
			email: savedUser.email
		};
	}
}
