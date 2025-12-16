import { AuthProvider } from "./providers/authProvider";
import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import router from "./routes";

function App() {
	return (
		<AntdApp>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</AntdApp>
	);
}

export default App;
