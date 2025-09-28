import type { GetStaffDTO } from "../dtos/staff";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";

export const getStaff = async (): Promise<APIResponse<GetStaffDTO>> => {
	return axiosInstance.get("/api/staff", { withCredentials: true });
};
