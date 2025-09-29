import type { GetServiceDTO } from "../dtos/service";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { ErrorMessage } from "../types/errorMessage";

export const getServices = async (): Promise<APIResponse<GetServiceDTO[]>> => {
	try {
		return axiosInstance.get("/api/service", { withCredentials: true });
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};
