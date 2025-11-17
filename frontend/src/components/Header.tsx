import React from "react";
import {
	ScissorOutlined,
	UserOutlined,
	LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../api/authAPI";
import { showError } from "../lib/showError";
import {
	useLocation,
	useNavigate,
	type Location,
	type NavigateFunction,
} from "react-router-dom";

export const Header: React.FC = () => {
	const { user, userLoaded: _, setUser } = useAuth();

	const navigate: NavigateFunction = useNavigate();
	const location: Location = useLocation();
	const currentPage: string = location.pathname;

	const handleSignOut = async () => {
		try {
			await logout();
			setUser(null);
			navigate("/");
		} catch (error) {
			showError(error);
		}
	};

	return (
		<header className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div
						className="flex items-center cursor-pointer"
						onClick={() => navigate("/")}
					>
						<ScissorOutlined
							style={{ fontSize: "24px", color: "#EC003F" }}
							className="mr-2"
						/>
						<h1 className="text-2xl font-bold text-gray-900">Salon Elite</h1>
					</div>

					<div className="flex items-center space-x-4">
						{user ? (
							<>
								<button
									onClick={() => navigate("/profile")}
									className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
										currentPage === "profile"
											? "bg-rose-100 text-rose-700"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									<UserOutlined className="h-4 w-4 mr-2" />
									Profile
								</button>
								<button
									onClick={handleSignOut}
									className="flex items-center px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition-colors"
								>
									<LogoutOutlined className="h-4 w-4 mr-2" />
									Sign Out
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => navigate("/login")}
									className="px-4 py-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
								>
									Login
								</button>
								<button
									onClick={() => navigate("/register")}
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
