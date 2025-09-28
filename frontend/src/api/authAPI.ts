import type { AuthDTO, RegisterDTO } from "../dtos/auth";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";

export const login = async (dto: AuthDTO): Promise<APIResponse<string>> => {
	return axiosInstance.post("/api/auth/login", dto);
};

export const logout = async (): Promise<APIResponse<string>> => {
	return axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
};

export const register = async (
	dto: RegisterDTO,
): Promise<APIResponse<string>> => {
	return axiosInstance.post("/api/auth/register", dto);
};
