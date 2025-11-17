import React, { useState } from "react";
import {
	ScissorOutlined,
	EyeOutlined,
	EyeInvisibleOutlined,
	MailOutlined,
	LockOutlined,
} from "@ant-design/icons";
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
	const [showPassword, setShowPassword] = useState(false);
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
		<div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<div className="flex justify-center">
						<ScissorOutlined style={{ fontSize: "45px", color: "#EC003F" }} />
					</div>
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
					<p className="mt-2 text-sm text-gray-600">
						Sign in to manage your appointments
					</p>
				</div>

				<div className="bg-white rounded-xl shadow-lg p-8">
					<form
						className="space-y-6"
						onSubmit={handleSubmit}
					>
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-md p-4">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Email address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<MailOutlined className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
									placeholder="Enter your email"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<LockOutlined className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
								>
									{showPassword ? (
										<EyeInvisibleOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
									) : (
										<EyeOutlined className="h-5 w-5 text-gray-400 hover:text-gray-600" />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-rose-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>

						<div className="text-center">
							<p className="text-sm text-gray-600">
								Don't have an account?{" "}
								<button
									type="button"
									onClick={() => navigate("/register")}
									className="text-rose-600 hover:text-rose-700 font-medium"
								>
									Sign up now
								</button>
							</p>
						</div>
					</form>
				</div>

				<div className="text-green-600 font-medium text-sm text-center">
					{justRegistered ? "Account registered successfully" : ""}
				</div>
			</div>
		</div>
	);
};
