import React, { useState } from "react";
import {
	ScissorOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
	MailOutlined,
	LockOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Input, Button } from "antd";
import { register } from "../api/authAPI";
import { showError } from "../lib/showError";
import { useNavigate, type NavigateFunction } from "react-router-dom";

export const RegisterPage: React.FC = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const navigate: NavigateFunction = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email || !password || !confirmPassword) return;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const { data: _, error: serverError } = await register({
				email,
				password,
				name,
			});

			if (serverError) {
				if (typeof serverError.message === "string") setError(serverError.message);
				else showError(serverError);
			} else
				navigate("/login", {
					state: { registerSuccess: true },
				});
		} catch (err: any) {
			if (err?.response?.data?.error?.message?.message)
				setError(err.response.data.error.message.message);
			else if (err?.response?.data?.error?.message)
				setError(err.response.data.error.message);
			else showError(err);
		}

		setLoading(false);
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "linear-gradient(to bottom right, #fff1f2, #faf5ff)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "48px 16px",
			}}
		>
			<div style={{ maxWidth: "480px", width: "100%" }}>
				<div style={{ textAlign: "center", marginBottom: "32px" }}>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<ScissorOutlined style={{ fontSize: "45px", color: "#EC003F" }} />
					</div>
					<h2
						style={{
							marginTop: "24px",
							fontSize: "32px",
							fontWeight: 800,
							color: "#111827",
						}}
					>
						Join Salon Elite
					</h2>
					<p style={{ marginTop: "8px", fontSize: "14px", color: "#4b5563" }}>
						Create your account and book your first appointment
					</p>
				</div>

				<div
					style={{
						background: "#fff",
						borderRadius: "16px",
						boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
						padding: "32px",
					}}
				>
					<form
						onSubmit={handleSubmit}
						style={{ display: "flex", flexDirection: "column", gap: "20px" }}
					>
						{error && (
							<div
								style={{
									background: "#fef2f2",
									border: "1px solid #fecaca",
									borderRadius: "8px",
									padding: "12px",
								}}
							>
								<p style={{ color: "#b91c1c", fontSize: "14px", margin: 0 }}>{error}</p>
							</div>
						)}

						{/* Name */}
						<div style={{ display: "flex", flexDirection: "column" }}>
							<label
								htmlFor="name"
								style={{
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: 500,
									color: "#374151",
								}}
							>
								Full name
							</label>
							<Input
								id="name"
								placeholder="Enter your full name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								prefix={<UserOutlined style={{ color: "#9ca3af", paddingRight: "3px" }} />}
								style={{ padding: "12px", borderRadius: "8px" }}
							/>
						</div>

						{/* Email */}
						<div style={{ display: "flex", flexDirection: "column" }}>
							<label
								htmlFor="email"
								style={{
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: 500,
									color: "#374151",
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
								prefix={<MailOutlined style={{ color: "#9ca3af", paddingRight: "3px" }} />}
								style={{ padding: "12px", borderRadius: "8px" }}
							/>
						</div>

						{/* Password */}
						<div style={{ display: "flex", flexDirection: "column" }}>
							<label
								htmlFor="password"
								style={{
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: 500,
									color: "#374151",
								}}
							>
								Password
							</label>
							<Input.Password
								id="password"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								prefix={<LockOutlined style={{ color: "#9ca3af", paddingRight: "3px" }} />}
								iconRender={(visible) => (visible ? <EyeInvisibleOutlined /> : <EyeOutlined />)}
								style={{ padding: "12px", borderRadius: "8px" }}
							/>
						</div>

						{/* Confirm Password */}
						<div style={{ display: "flex", flexDirection: "column" }}>
							<label
								htmlFor="confirmPassword"
								style={{
									marginBottom: "8px",
									fontSize: "14px",
									fontWeight: 500,
									color: "#374151",
								}}
							>
								Confirm password
							</label>
							<Input.Password
								id="confirmPassword"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								prefix={<LockOutlined style={{ color: "#9ca3af", paddingRight: "3px" }} />}
								iconRender={(visible) => (visible ? <EyeInvisibleOutlined /> : <EyeOutlined />)}
								style={{ padding: "12px", borderRadius: "8px" }}
							/>
						</div>

						{/* Submit */}
						<Button
							htmlType="submit"
							type="primary"
							loading={loading}
							style={{
								width: "100%",
								padding: "20px",
								borderRadius: "8px",
								background: "linear-gradient(to right, #EC003F, #8B5CF6)",
								border: "none",
								fontWeight: 500,
								fontSize: "16px",
							}}
						>
							{loading ? "Creating account..." : "Create account"}
						</Button>

						<div style={{ textAlign: "center", fontSize: "14px", color: "#4b5563" }}>
							Already have an account?{" "}
							<Button
								type="link"
								onClick={() => navigate("/login")}
								style={{ color: "#EC003F", fontWeight: 500, padding: 0 }}
							>
								Sign in here
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
