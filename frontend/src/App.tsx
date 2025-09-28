import { useState } from "react";
import { AuthProvider } from "./providers/authProvider";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProfilePage } from "./components/ProfilePage";

type Page = "home" | "login" | "register" | "profile";

function App() {
	const [currentPage, setCurrentPage] = useState<Page>("home");

	const handleNavigate = (page: string) => {
		setCurrentPage(page as Page);
	};

	const renderPage = () => {
		switch (currentPage) {
			case "home":
				return <HomePage onNavigate={handleNavigate} />;
			case "login":
				return <LoginPage onNavigate={handleNavigate} />;
			case "register":
				return <RegisterPage onNavigate={handleNavigate} />;
			case "profile":
				return <ProfilePage onNavigate={handleNavigate} />;
			default:
				return <HomePage onNavigate={handleNavigate} />;
		}
	};

	return (
		<AuthProvider>
			<div className="min-h-screen bg-gray-50">
				<Header
					onNavigate={handleNavigate}
					currentPage={currentPage}
				/>
				{renderPage()}
			</div>
		</AuthProvider>
	);
}

export default App;
