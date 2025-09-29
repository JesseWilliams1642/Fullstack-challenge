import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	ParseIntPipe,
	UseGuards,
	HttpStatus,
	HttpCode,
	Patch,
	Delete,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { Appointment } from "../appointment/appointment.entity";
import type { APIResponse, SafeUser } from "../../common/types";
import { JwtGuard } from "../../common/guards";
import { GetUser } from "../../common/decorators";
import {
	CreateAppointmentDTO,
	EditAppointmentDTO,
	DeleteAppointmentDTO,
} from "./dto";
import { SafeAppointment } from "../appointment/types";
import { dateToStrings } from "src/common/utils";

@UseGuards(JwtGuard)
@Controller("api/user")
export class UserController {
	constructor(private userService: UserService) {}

	// Create an appointment

	@HttpCode(HttpStatus.CREATED)
	@Post("appointments")
	async addAppointment(
		@GetUser() user: SafeUser,
		@Body() dto: CreateAppointmentDTO,
	): Promise<APIResponse<SafeAppointment>> {
		const appointment: Appointment = await this.userService.addAppointment(
			user.email,
			dto.serviceID,
			new Date(dto.startDate),
			dto.staffID,
		);

		const safeAppointment: SafeAppointment = {
			id: appointment.id,
			startTimestamp: appointment.startTimestamp,
			dateString: dateToStrings(appointment.startTimestamp)[0],
			timeString: dateToStrings(appointment.startTimestamp)[1],
			serviceID: appointment.service.id,
			serviceName: appointment.service.serviceName,
			serviceDuration: appointment.service.serviceDuration,
			serviceDescription: appointment.service.serviceDescription,
			staffID: appointment.staff.id,
			staffName: appointment.staff.name,
			status: (appointment.startTimestamp > new Date()) ? "scheduled" : "completed"
		};
		return { data: safeAppointment, error: null };
	}

	// Get all appointments

	@HttpCode(HttpStatus.OK)
	@Get("appointments")
	async getAppointments(
		@GetUser() user: SafeUser
	): Promise<APIResponse<SafeAppointment[]>> {
		const appointments: Appointment[] = await this.userService.getAppointments(
			user.email,
		);

		const safeAppointments: SafeAppointment[] = appointments.map((item) => ({
			id: item.id,
			startTimestamp: item.startTimestamp,
			dateString: dateToStrings(item.startTimestamp)[0],
			timeString: dateToStrings(item.startTimestamp)[1],
			serviceID: item.service.id,
			serviceName: item.service.serviceName,
			serviceDuration: item.service.serviceDuration,
			serviceDescription: item.service.serviceDescription,
			staffID: item.staff.id,
			staffName: item.staff.name,
			status: (item.startTimestamp > new Date()) ? "scheduled" : "completed"
		}));

		return { data: safeAppointments, error: null };
	}

	// Get a limited number (id) of appointments

	@HttpCode(HttpStatus.OK)
	@Get("appointments/:id")
	async getLimitedAppointments(
		@GetUser() user: SafeUser,
		@Param("id", ParseIntPipe) numAppointments: string,
	): Promise<APIResponse<SafeAppointment[]>> {
		const appointments: Appointment[] =
			await this.userService.getLimitedAppointments(user.email, numAppointments);

		const safeAppointments: SafeAppointment[] = appointments.map((item) => ({
			id: item.id,
			startTimestamp: item.startTimestamp,
			dateString: dateToStrings(item.startTimestamp)[0],
			timeString: dateToStrings(item.startTimestamp)[1],
			serviceID: item.service.id,
			serviceName: item.service.serviceName,
			serviceDuration: item.service.serviceDuration,
			serviceDescription: item.service.serviceDescription,
			staffID: item.staff.id,
			staffName: item.staff.name,
			status: (item.startTimestamp > new Date()) ? "scheduled" : "completed"
		}));
		return { data: safeAppointments, error: null };
	}

	// Edit an appointment

	@HttpCode(HttpStatus.OK)
	@Patch("appointments")
	async editAppointment(
		@GetUser() user: SafeUser,
		@Body() dto: EditAppointmentDTO,
	): Promise<APIResponse<SafeAppointment>> {
		const appointment: Appointment = await this.userService.editAppointment(
			user.email,
			dto,
		);

		const safeAppointment: SafeAppointment = {
			id: appointment.id,
			startTimestamp: appointment.startTimestamp,
			dateString: dateToStrings(appointment.startTimestamp)[0],
			timeString: dateToStrings(appointment.startTimestamp)[1],
			serviceID: appointment.service.id,
			serviceName: appointment.service.serviceName,
			serviceDuration: appointment.service.serviceDuration,
			serviceDescription: appointment.service.serviceDescription,
			staffID: appointment.staff.id,
			staffName: appointment.staff.name,
			status: (appointment.startTimestamp > new Date()) ? "scheduled" : "completed"
		};
		return { data: safeAppointment, error: null };
	}

	// Delete an appointment

	@HttpCode(HttpStatus.OK)
	@Delete("appointments")
	async deleteAppointment(
		@GetUser() user: SafeUser,
		@Param("id", ParseIntPipe) dto: DeleteAppointmentDTO,
	): Promise<APIResponse<string>> {
		await this.userService.deleteAppointment(user.email, dto.appointmentID);
		return { data: "Appointment deleted successfully.", error: null };
	}
}
