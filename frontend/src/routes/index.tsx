import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../components/HomePage";
import { LoginPage } from "../components/LoginPage";
import { RegisterPage } from "../components/RegisterPage";
import { ProfilePage } from "../components/ProfilePage";
import { Layout } from "../layouts/DefaultLayout";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: "/login",
				element: <LoginPage />,
			},
			{
				path: "/register",
				element: <RegisterPage />,
			},
			{
				path: "/profile",
				element: <ProfilePage />,
			},
			{
				path: "*",
				element: <HomePage />,
			},
		],
	},
]);

export default router;
