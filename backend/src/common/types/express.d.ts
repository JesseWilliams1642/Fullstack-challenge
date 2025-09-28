import { SafeUser } from "src/common/types/safe-user.type";

// Express type extension to redefine user type and define cookie type

declare global {
	namespace Express {
		// Required, else taking user from req.user becomes impossible
		interface User extends SafeUser {}

		interface Request {
			user?: User;
			cookies?: { [key: string]: string };
		}
	}
}

export {};
