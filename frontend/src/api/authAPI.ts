import type { AuthDTO, RegisterDTO } from "../dtos/auth";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { AuthenticatedUser } from "../types/authenticatedUser";

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

export const getMe = async (): Promise<APIResponse<AuthenticatedUser>> => {
	return axiosInstance.get("/api/auth/me", { withCredentials: true });
};
