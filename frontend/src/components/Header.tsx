import React from "react";
import {
	ScissorOutlined,
	UserOutlined,
	LogoutOutlined,
} from "@ant-design/icons";
import { App, Button } from "antd";
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
	const { message } = App.useApp();
	const navigate: NavigateFunction = useNavigate();
	const location: Location = useLocation();
	const currentPage: string = location.pathname;

	const handleSignOut = async () => {
		try {
			await logout();
			setUser(null);
			navigate("/");
		} catch (error) {
			showError(error, message);
		}
	};

	return (
		<header
			style={{ backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
		>
			<div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 16px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						height: "64px",
					}}
				>
					{/* Logo */}
					<div
						style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
						onClick={() => navigate("/")}
					>
						<ScissorOutlined
							style={{ fontSize: "24px", color: "#EC003F", marginRight: "8px" }}
						/>
						<h1
							style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}
						>
							Salon Elite
						</h1>
					</div>

					{/* Buttons */}
					<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
						{user ? (
							<>
								<Button
									type={currentPage === "/profile" ? "default" : "text"}
									onClick={() => navigate("/profile")}
									icon={<UserOutlined />}
									style={{
										display: "flex",
										alignItems: "center",
										padding: "8px 16px",
										fontWeight: 500,
										backgroundColor: currentPage === "/profile" ? "#FEE2E2" : undefined,
										color: currentPage === "/profile" ? "#BE123C" : "#374151",
										border: "none",
										fontSize: "15px",
									}}
								>
									Profile
								</Button>

								<Button
									onClick={handleSignOut}
									icon={<LogoutOutlined />}
									style={{
										display: "flex",
										alignItems: "center",
										padding: "8px 16px",
										fontWeight: 500,
										color: "#374151",
										border: "none",
										fontSize: "15px",
									}}
								>
									Sign Out
								</Button>
							</>
						) : (
							<>
								<Button
									type="text"
									onClick={() => navigate("/login")}
									style={{
										padding: "8px 16px",
										color: "#EC003F",
										fontWeight: 500,
										fontSize: "15px",
									}}
								>
									Login
								</Button>

								<Button
									type="primary"
									onClick={() => navigate("/register")}
									style={{
										backgroundColor: "#EC003F",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px 16px",
										fontWeight: 500,
										border: "none",
										fontSize: "15px",
									}}
								>
									Register
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};
