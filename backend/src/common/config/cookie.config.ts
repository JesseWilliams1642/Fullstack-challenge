import { CookieConfig } from "../types";

// Cookie security configs

export const cookieConfig: CookieConfig = {
	httpOnly: true,
	secure: false, // Set true if HTTPS set up
	sameSite: "strict",
	maxAge: 24 * 60 * 60 * 1000, // 1 day
};
