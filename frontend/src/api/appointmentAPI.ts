import type { GetAppointmentAvailabilityDTO } from "../dtos/appointment";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";

export const getAppointmentAvailability = async (
	dto: GetAppointmentAvailabilityDTO,
): Promise<APIResponse<Date[]>> => {
	return axiosInstance.get(
		`/api/appointment?serviceID=${dto.serviceID}&date=${dto.date}&staffID=${dto.staffID}`,
		{ withCredentials: true },
	);
};
