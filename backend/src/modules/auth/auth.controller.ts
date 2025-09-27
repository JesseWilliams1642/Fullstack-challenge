import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { JwtToken } from "./types";
import { cookieConfig } from "../../common/config";

@Controller('api/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK) // Http Code 200
    @Post('login')
    async login(
        @Body() dto: AuthDTO,
        @Res({ passthrough: true }) res: Response
    ): Promise<string> {

        const token: JwtToken = await this.authService.login(dto);

        res.cookie('JWT_fullstack', token.jwtToken, cookieConfig);

        return "Logged in successfully.";

    }

    @HttpCode(HttpStatus.OK) // Http Code 200
    @Post('logout')
    async logout(
        @Res({ passthrough: true }) res: Response
    ): Promise<string> {
        res.clearCookie('JWT_fullstack');
        return "Logged out successfully.";
    }

};