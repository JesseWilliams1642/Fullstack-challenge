import React from "react";
import { Scissors, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../api/authAPI";

interface HeaderProps {
	onNavigate: (page: string) => void;
	currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
	const { user, userLoaded: _ } = useAuth(); 

	const handleSignOut = async () => {
		await logout();
		onNavigate("home");
	};

	return (
		<header className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div
						className="flex items-center cursor-pointer"
						onClick={() => onNavigate("home")}
					>
						<Scissors className="h-8 w-8 text-rose-600 mr-2" />
						<h1 className="text-2xl font-bold text-gray-900">Salon Elite</h1>
					</div>

					<div className="flex items-center space-x-4">
						{user ? (
							<>
								<button
									onClick={() => onNavigate("profile")}
									className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
										currentPage === "profile"
											? "bg-rose-100 text-rose-700"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<User className="h-4 w-4 mr-2" />
									Profile
								</button>
								<button
									onClick={handleSignOut}
									className="flex items-center px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition-colors"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => onNavigate("login")}
									className="px-4 py-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
								>
									Login
								</button>
								<button
									onClick={() => onNavigate("register")}
									className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-medium transition-colors"
								>
									Register
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
