import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { UserModule } from "../user/user.module";

@Module({
	imports: [UserModule, JwtModule.register({})], // Would need to add to {} if using refresh tokens
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
