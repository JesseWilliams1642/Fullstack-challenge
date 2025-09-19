import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {

    login(email: string, password: string): boolean {

        return false;

    }

    logout() {
        return false;
    }

};