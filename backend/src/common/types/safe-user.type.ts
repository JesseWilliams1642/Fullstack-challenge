import { NonFunctionProperties } from "src/common/types/strip-class";
import { User } from "../../modules/user/user.entity";

// Needed to override Express.User
// Will also be used for api/auth/me

export type SafeUser = NonFunctionProperties<
	Omit<Omit<User, "hashedPassword">, "appointments">
>;
