import type { GetStaffDTO } from "../dtos/staff";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { ErrorMessage } from "../types/errorMessage";

export const getStaff = async (): Promise<APIResponse<GetStaffDTO[]>> => {
	try {
		return axiosInstance.get("/api/staff", { withCredentials: true });
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};
