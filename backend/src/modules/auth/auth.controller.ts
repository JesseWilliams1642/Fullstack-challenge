import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { JwtToken } from "./types";
import { cookieConfig } from "../../common/config";
import { RegisterDTO } from "./dto/register.dto";
import { type APIResponse, type SafeUser } from "../../common/types";
import { JwtGuard } from "../../common/guards";
import { GetUser } from "../../common/decorators";

@Controller("api/auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	// Login using email and password, retrieving JWT token

	@HttpCode(HttpStatus.OK)
	@Post("login")
	async login(
		@Body() dto: AuthDTO,
		@Res({ passthrough: true }) res: Response,
	): Promise<APIResponse<string>> {
		const token: JwtToken = await this.authService.login(dto);

		res.cookie("JWT_fullstack", token.jwtToken, cookieConfig);

		return { data: "Logged in successfully.", error: null };
	}

	// Logout, clearing the JWT token

	@HttpCode(HttpStatus.OK)
	@Post("logout")
	logout(@Res({ passthrough: true }) res: Response): APIResponse<string> {
		res.clearCookie("JWT_fullstack");
		return { data: "Logged out successfully.", error: null };
	}

	// Register for a new user account

	@HttpCode(HttpStatus.CREATED)
	@Post("register")
	async addUser(@Body() dto: RegisterDTO): Promise<APIResponse<SafeUser>> {
		const createdUser = await this.authService.createUser(
			dto.email,
			dto.password,
			dto.name
		);
		return { data: createdUser, error: null };
	}

	// Me API required for authentication

	@UseGuards(JwtGuard)
	@HttpCode(HttpStatus.OK)
	@Get("me")
	async getUser(
		@GetUser() user: SafeUser
	): Promise<APIResponse<SafeUser>> {
		const safeUser: SafeUser = {
			email: user.email,
			id: user.id,
			name: user.name
		};
		return { data: safeUser, error: null };
	}

}
