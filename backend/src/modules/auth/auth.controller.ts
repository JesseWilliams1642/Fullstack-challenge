import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
} from "@nestjs/common";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { JwtToken } from "./types";
import { cookieConfig } from "../../common/config";

@Controller("api/auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	// Login using email and password, retrieving JWT token

	@HttpCode(HttpStatus.OK)
	@Post("login")
	async login(
		@Body() dto: AuthDTO,
		@Res({ passthrough: true }) res: Response,
	): Promise<string> {
		const token: JwtToken = await this.authService.login(dto);

		res.cookie("JWT_fullstack", token.jwtToken, cookieConfig);

		return "Logged in successfully.";
	}

	// Logout, clearing the JWT token

	@HttpCode(HttpStatus.OK)
	@Post("logout")
	logout(@Res({ passthrough: true }) res: Response): string {
		res.clearCookie("JWT_fullstack");
		return "Logged out successfully.";
	}
}
