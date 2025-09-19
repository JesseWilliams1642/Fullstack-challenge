import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body('email') email: string, @Body('password') password: string): boolean {
        return this.authService.login(email,password);
    }

    @Post('/logout')
    logout(): boolean {
        return this.authService.logout();
    }

};