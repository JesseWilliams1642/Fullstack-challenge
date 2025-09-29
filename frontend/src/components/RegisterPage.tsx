import React, { useState } from "react";
import { Scissors, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { register } from "../api/authAPI";
import { showError } from "../lib/showError";

interface RegisterPageProps {
	onNavigate: (page: string, registerSuccess: boolean) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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
			} else onNavigate("login", true);
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
						<Scissors className="h-12 w-12 text-rose-600" />
					</div>
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">Join Salon Elite</h2>
					<p className="mt-2 text-sm text-gray-600">
						Create your account and book your first appointment
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
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Full name
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
									placeholder="Enter your full name"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Email address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Mail className="h-5 w-5 text-gray-400" />
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
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
									placeholder="Create a password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
									) : (
										<Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Confirm password
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
									placeholder="Confirm your password"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-rose-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating account..." : "Create account"}
						</button>

						<div className="text-center">
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => onNavigate("login", false)}
									className="text-rose-600 hover:text-rose-700 font-medium"
								>
									Sign in here
								</button>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
