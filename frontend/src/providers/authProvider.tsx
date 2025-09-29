// frontend/src/providers/authProvider.tsx

import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthenticatedUser } from "../types/authenticatedUser";
import { getMe } from "../api/authAPI";

export interface AuthContextType {
	user: AuthenticatedUser | null;
	userLoaded: boolean;
	setUser: (user: AuthenticatedUser | null) => void;
	refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [userLoaded, setLoading] = useState(true);

	const fetchUser = async () => {
		try {
			const res = await getMe();
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

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, userLoaded, setUser, refetchUser: fetchUser }}
		>
			{children}
		</AuthContext.Provider>
	);
};
