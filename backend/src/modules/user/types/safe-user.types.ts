import { NonFunctionProperties } from "src/utils/strip-class";
import { User } from "../user.entity";

// Needed to override Express.User

export type SafeUser = NonFunctionProperties<Omit<User,"hashedPassword">>