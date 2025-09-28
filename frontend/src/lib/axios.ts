import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

interface AxiosInstanceWithTypedResponse extends AxiosInstance {
	get<T = any, R = T>(url: string, config?: AxiosRequestConfig): Promise<R>;
	post<T = any, R = T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<R>;
}

const axiosInstance = axios.create({
	baseURL: "http://localhost:" + import.meta.env.VITE_BACKEND_PORT,
	withCredentials: true,
	timeout: 4000,
}) as AxiosInstanceWithTypedResponse;

axiosInstance.interceptors.response.use(
	(response) => response.data,
	(error: AxiosError) => {
		if (error.response) {
			console.error(
				`Backend returned error ${error.response.status}:`,
				error.response.data,
			);
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request setup error:", error.message);
		}
		return Promise.reject(error);
	},
);

export default axiosInstance;
