import type { GetAppointmentAvailabilityDTO } from "../dtos/appointment";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { ErrorMessage } from "../types/errorMessage";

export const getAppointmentAvailability = async (
	dto: GetAppointmentAvailabilityDTO,
): Promise<APIResponse<string[]>> => {
	try {
		return axiosInstance.get(
			`/api/appointment?serviceID=${dto.serviceID}&date=${dto.date}&staffID=${dto.staffID}`,
			{ withCredentials: true },
		);
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};
