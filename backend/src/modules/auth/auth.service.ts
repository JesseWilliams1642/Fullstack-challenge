import { Inject, Injectable } from "@nestjs/common";
import { User } from "../user/user.entity";
import { Repository } from "typeorm";
import { AuthDTO } from "./dto";
import { comparePassword } from "../../utils/hash";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {

    constructor(
        @Inject('USER_REPOSITORY') private userRespository: Repository<User>,
        private jwt: JwtService
    ) {}

    async login(dto: AuthDTO): Promise<Object> {

        const email: string = dto.email;
        const password: string = dto.password;

        const user: User | null = await this.userRespository.findOneBy({ email });
        if (!user) return "User not found.";

        const equalPasswords: boolean = await comparePassword(password, user.hashedPassword);
        if (!equalPasswords) return "Password mistmatch. Login unsuccessful."

        return await this.signToken(user.id, user.email);

    }

    async logout(): Promise<string> {
        return "Logged out successfully.";
    }

    async signToken(id: string, email: string): Promise<Object> {

        const secret: string | undefined = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET must be set.");

        const jwtPayload = {
            sub: id,
            email
        };

        const token: Promise<string> = this.jwt.signAsync(jwtPayload, {
            expiresIn: '15m',
            secret
        });

        return { jwtToken: token }

    }

};