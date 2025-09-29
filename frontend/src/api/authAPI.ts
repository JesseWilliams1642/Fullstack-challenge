import type { AuthDTO, RegisterDTO } from "../dtos/auth";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { ErrorMessage } from "../types/errorMessage";

export const login = async (dto: AuthDTO): Promise<APIResponse<string>> => {
	try {
		return axiosInstance.post("/api/auth/login", dto);
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};

export const logout = async (): Promise<APIResponse<string>> => {
	try {
		return axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};

export const register = async (
	dto: RegisterDTO,
): Promise<APIResponse<string>> => {
	try {
		return axiosInstance.post("/api/auth/register", dto);
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};
