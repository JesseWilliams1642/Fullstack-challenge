import type { CreateAppointmentDTO, EditAppointmentDTO } from "../dtos/user";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { SafeAppointment } from "../types/safeAppointment";

export const getAppointments = async (): Promise<
	APIResponse<SafeAppointment[]>
> => {
	return axiosInstance.get("/api/user/appointments", { withCredentials: true });
};

export const getLimitedAppointments = async (
	id: number,
): Promise<APIResponse<SafeAppointment[]>> => {
	return axiosInstance.get(`/api/user/appointments/:${id}`, {
		withCredentials: true,
	});
};

export const createAppointment = async (
	dto: CreateAppointmentDTO,
): Promise<APIResponse<SafeAppointment>> => {
	return axiosInstance.post("/api/user/appointments", dto, {
		withCredentials: true,
	});
};

export const editAppointment = async (
	dto: EditAppointmentDTO,
): Promise<APIResponse<SafeAppointment>> => {
	return axiosInstance.patch("/api/user/appointments", dto, {
		withCredentials: true,
	});
};

export const deleteAppointment = async (
	id: number,
): Promise<APIResponse<string>> => {
	return axiosInstance.delete(`/api/user/appointments/:${id}`, {
		withCredentials: true,
	});
};
