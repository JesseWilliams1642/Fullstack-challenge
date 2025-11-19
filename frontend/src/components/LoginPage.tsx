import React, { useState } from "react";
import {
	ScissorOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
	MailOutlined,
	LockOutlined,
} from "@ant-design/icons";
import { Input, Button } from "antd";
import { login } from "../api/authAPI";
import { showError } from "../lib/showError";
import { useAuth } from "../hooks/useAuth";
import {
	useLocation,
	useNavigate,
	type Location,
	type NavigateFunction,
} from "react-router-dom";

export const LoginPage: React.FC = () => {
	const location: Location = useLocation();
	const registerSuccess: boolean = location.state?.registerSuccess ?? false;

	const { refetchUser } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [justRegistered, setRegistered] = useState(registerSuccess);

	const navigate: NavigateFunction = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) return;

		setLoading(true);
		setError("");
		setRegistered(false);

		try {
			const { data: _, error } = await login({ email, password });

			if (error)
				if (typeof error.message === "string") setError(error.message);
				else showError(error);
			else {
				await refetchUser(); // Get new User now that we are logged in
				navigate("/profile");
			}
		} catch (error: any) {
			if (error?.response?.data?.error?.message?.message)
				setError(error.response.data.error.message.message);
			else if (error?.response?.data?.error?.message)
				setError(error.response.data.error.message);
			else showError(error);
		}

		setLoading(false);
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "linear-gradient(to bottom right, #fff1f2, #faf5ff)",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				padding: "48px 16px",
			}}
		>
			<div style={{ maxWidth: "500px", width: "100%" }}>
				{/* Header */}
				<div style={{ textAlign: "center", marginBottom: "24px" }}>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<ScissorOutlined style={{ fontSize: "45px", color: "#EC003F" }} />
					</div>
					<h2
						style={{
							marginTop: "24px",
							fontSize: "1.875rem",
							fontWeight: 800,
							color: "#111827",
						}}
					>
						Welcome back
					</h2>
					<p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#4B5563" }}>
						Sign in to manage your appointments
					</p>
				</div>

				{/* Form */}
				<div
					style={{
						backgroundColor: "#ffffff",
						borderRadius: "16px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
						padding: "50px",
						paddingBottom: "40px",
					}}
				>
					<form
						onSubmit={handleSubmit}
						style={{ display: "flex", flexDirection: "column", gap: "16px" }}
					>
						{error && (
							<div
								style={{
									backgroundColor: "#FEF2F2",
									border: "1px solid #FECACA",
									borderRadius: "8px",
									padding: "12px",
								}}
							>
								<p style={{ color: "#B91C1C", fontSize: "0.875rem", margin: 0 }}>{error}</p>
							</div>
						)}

						{/* Email Input */}
						<div>
							<label
								htmlFor="email"
								style={{
									display: "block",
									fontSize: "0.875rem",
									fontWeight: 500,
									color: "#374151",
									marginBottom: "8px",
								}}
							>
								Email address
							</label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								prefix={<MailOutlined style={{ color: "#9CA3AF", paddingRight: "3px" }} />}
								style={{ padding: "12px", fontSize: "1rem", borderRadius: "8px" }}
								required
							/>
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor="password"
								style={{
									display: "block",
									fontSize: "0.875rem",
									fontWeight: 500,
									color: "#374151",
									marginBottom: "8px",
								}}
							>
								Password
							</label>
							<Input.Password
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								prefix={<LockOutlined style={{ color: "#9CA3AF", paddingRight: "3px" }} />}
								placeholder="Enter your password"
								iconRender={(visible) =>
									visible ? (
										<EyeInvisibleOutlined style={{ color: "#9CA3AF" }} />
									) : (
										<EyeOutlined style={{ color: "#9CA3AF" }} />
									)
								}
								style={{ padding: "12px", fontSize: "1rem", borderRadius: "8px" }}
								required
							/>
						</div>

						{/* Submit Button */}
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							style={{
								width: "100%",
								padding: "20px",
								fontSize: "1rem",
								fontWeight: 500,
								background: "linear-gradient(to right, #EC003F, #A78BFA)",
								border: "none",
								borderRadius: "8px",
							}}
						>
							{loading ? "Signing in..." : "Sign in"}
						</Button>

						{/* Register Link */}
						<div style={{ textAlign: "center" }}>
							<p style={{ fontSize: "0.875rem", color: "#4B5563" }}>
								Don't have an account?{" "}
								<Button
									type="text"
									onClick={() => navigate("/register")}
									style={{
										color: "#EC003F",
										fontWeight: 500,
										padding: 0,
									}}
								>
									Sign up now
								</Button>
							</p>
						</div>
					</form>
				</div>

				{/* Registration success message */}
				{justRegistered && (
					<div
						style={{
							color: "#059669",
							fontWeight: 500,
							fontSize: "0.875rem",
							textAlign: "center",
							marginTop: "16px",
						}}
					>
						Account registered successfully
					</div>
				)}
			</div>
		</div>
	);
};
