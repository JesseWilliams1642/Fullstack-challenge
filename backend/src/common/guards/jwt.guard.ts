import { AuthGuard } from "@nestjs/passport";

/**
 *  Calls the JWT strategy, which will:
 *      1. Extract the JWT token (located in the Authorization: Bearer header)
 *      2. If it is a valid token, calls validate()
 *      3. Passes what is returned from validate() to req.user
 */ 

export class JwtGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }
}
