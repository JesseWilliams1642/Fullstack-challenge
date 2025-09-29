// frontend/src/providers/authProvider.tsx

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthenticatedUser } from "../types/authenticatedUser";

export interface AuthContextType {
	user: AuthenticatedUser | null;
	userLoaded: boolean;
	setUser: (user: AuthenticatedUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [userLoaded, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get("/api/auth/me", { withCredentials: true });

				const fetchedUser = res.data;

				if (fetchedUser) setUser(fetchedUser);
				else setUser(null);
			} catch (err) {
				console.error("AuthProvider error:", err);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	return (
		<AuthContext.Provider value={{ user, userLoaded, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
