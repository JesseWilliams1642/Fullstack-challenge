import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";

@Controller()
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    async login(
        @Body() dto: AuthDTO
    ): Promise<Object> {
        return this.authService.login(dto);
    }

    @Post('/logout')
    async logout(): Promise<string> {
        return this.authService.logout();
    }

};