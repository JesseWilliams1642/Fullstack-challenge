import { NonFunctionProperties } from "src/common/utils/strip-class";
import { User } from "../../modules/user/user.entity";

// Needed to override Express.User

export type SafeUser = NonFunctionProperties<Omit<User, "hashedPassword">>;
