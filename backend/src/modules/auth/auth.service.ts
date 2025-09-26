import { Inject, Injectable } from "@nestjs/common";
import { User } from "../user/user.entity";
import { Repository } from "typeorm";
import { AuthDTO } from "./dto";
import { comparePassword } from "../../common/utils/hash";
import { JwtService } from "@nestjs/jwt";
import { JwtToken } from "./types";

@Injectable()
export class AuthService {

    constructor(
        @Inject('USER_REPOSITORY') private userRespository: Repository<User>,
        private jwt: JwtService
    ) {}

    async login(dto: AuthDTO): Promise<JwtToken> {

        const email: string = dto.email;
        const password: string = dto.password;

        const user: User | null = await this.userRespository.findOneBy({ email });
        if (!user) return { jwtToken: "" };                                                         // NEEDS ERROR HANDLING

        const equalPasswords: boolean = await comparePassword(password, user.hashedPassword);
        if (!equalPasswords) return { jwtToken: "" };                                               // NEEDS ERROR HANDLING

        return await this.signToken(user.id, user.email);

    }

    async logout(): Promise<JwtToken> {
        return { jwtToken: "" };
    }

    async signToken(id: string, email: string): Promise<JwtToken> {

        const secret: string | undefined = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET must be set.");                                       // NEEDS ERROR HANDLING

        const jwtPayload = {
            sub: id,
            email
        };

        const token: string = await this.jwt.signAsync(jwtPayload, {
            expiresIn: '15m',
            secret
        });

        return { jwtToken: token }

    }

};