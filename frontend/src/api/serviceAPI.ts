import type { GetServiceDTO } from "../dtos/service";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";

export const getServices = async (): Promise<APIResponse<GetServiceDTO[]>> => {
	return axiosInstance.get("/api/service", { withCredentials: true });
};
