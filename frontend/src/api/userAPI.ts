import type { CreateAppointmentDTO, EditAppointmentDTO } from "../dtos/user";
import axiosInstance from "../lib/axios";
import type { APIResponse } from "../types/apiResponse";
import type { ErrorMessage } from "../types/errorMessage";
import type { SafeAppointment } from "../types/safeAppointment";

export const getAppointments = async (): Promise<
	APIResponse<SafeAppointment[]>
> => {
	return axiosInstance.get("/api/user/appointments", { withCredentials: true });
};

export const getLimitedAppointments = async (
	id: string,
): Promise<APIResponse<SafeAppointment[]>> => {
	try {
		return axiosInstance.get(`/api/user/appointments/:${id}`, {
			withCredentials: true,
		});
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};

export const createAppointment = async (
	dto: CreateAppointmentDTO,
): Promise<APIResponse<SafeAppointment>> => {
	try {
		return axiosInstance.post("/api/user/appointments", dto, {
			withCredentials: true,
		});
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};

export const editAppointment = async (
	dto: EditAppointmentDTO,
): Promise<APIResponse<SafeAppointment>> => {
	try {
		return axiosInstance.patch("/api/user/appointments", dto, {
			withCredentials: true,
		});
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};

export const deleteAppointment = async (
	id: string,
): Promise<APIResponse<string>> => {
	try {
		return axiosInstance.delete(`/api/user/appointments/:${id}`, {
			withCredentials: true,
		});
	} catch (error: any) {
		return { data: null, error: error.message as ErrorMessage };
	}
};
