import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { JwtToken } from "./types";

@Controller('api/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK) // Http Code 200
    @Post('login')
    async login(
        @Body() dto: AuthDTO
    ): Promise<JwtToken> {
        return this.authService.login(dto);
    }

    @HttpCode(HttpStatus.OK) // Http Code 200
    @Post('logout')
    async logout(): Promise<JwtToken> {
        return this.authService.logout();
    }

};