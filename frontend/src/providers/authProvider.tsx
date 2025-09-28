// frontend/src/providers/authProvider.tsx

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthenticatedUser } from "../types/user";

export interface AuthContextType {
	user: AuthenticatedUser | null;
	loading: boolean;
	setUser: (user: AuthenticatedUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get("/api/auth/me", { withCredentials: true });

				const fetchedUser = res.data?.user;

				if (fetchedUser && typeof fetchedUser.role === "string") {
					setUser(fetchedUser);
				} else {
					setUser(null);
				}
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
		<AuthContext.Provider value={{ user, loading, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
