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
import type { SafeUser } from "../../common/types";
import { JwtGuard } from "../../common/guards";
import { GetUser } from "../../common/decorators";
import {
	CreateAppointmentDTO,
	EditAppointmentDTO,
	DeleteAppointmentDTO,
	RegisterDTO,
} from "./dto";
import { SafeAppointment } from "../appointment/types";

@Controller("api/user")
export class UserController {
	constructor(private userService: UserService) {}

	/**
	 *
	 * USER APIS
	 *
	 */

	// Register for a new user account

	@HttpCode(HttpStatus.CREATED)
	@Post("register")
	async addUser(@Body() dto: RegisterDTO): Promise<SafeUser> {
		const createdUser = await this.userService.createUser(
			dto.email,
			dto.password,
			dto.name,
			dto.phoneNumber,
		);
		return createdUser;
	}

	/**
	 *
	 * USER APPOINTMENT APIS
	 *
	 */

	// Create an appointment

	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtGuard)
	@Post("appointments")
	async addAppointment(
		@GetUser() user: SafeUser,
		@Body() dto: CreateAppointmentDTO,
	): Promise<SafeAppointment> {
		if (!user) throw new Error("Request does not hold the JWT payload."); // NEEDS ERROR HANDLING. IS THIS NECESSARY??

		const appointment: Appointment = await this.userService.addAppointment(
			user.email,
			dto.serviceID,
			new Date(dto.startDate),
			dto.staffID,
		);

		const safeAppointment: SafeAppointment = {
			id: appointment.id,
			startTimestamp: appointment.startTimestamp,
			serviceID: appointment.service.id,
			serviceName: appointment.service.serviceName,
			serviceDuration: appointment.service.serviceDuration,
			serviceDescription: appointment.service.serviceDescription,
			staffID: appointment.staff.id,
			staffName: appointment.staff.name,
		};
		return safeAppointment;
	}

	// Get all appointments

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get("appointments")
	async getAppointments(@GetUser() user: SafeUser): Promise<SafeAppointment[]> {
		const appointments: Appointment[] = await this.userService.getAppointments(
			user.email,
		);

		const safeAppointments: SafeAppointment[] = appointments.map((item) => ({
			id: item.id,
			startTimestamp: item.startTimestamp,
			serviceID: item.service.id,
			serviceName: item.service.serviceName,
			serviceDuration: item.service.serviceDuration,
			serviceDescription: item.service.serviceDescription,
			staffID: item.staff.id,
			staffName: item.staff.name,
		}));

		return safeAppointments;
	}

	// Get a limited number (id) of appointments

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get("appointments/:id")
	async getLimitedAppointments(
		@GetUser() user: SafeUser,
		@Param("id", ParseIntPipe) numAppointments: string,
	): Promise<SafeAppointment[]> {
		const appointments: Appointment[] =
			await this.userService.getLimitedAppointments(user.email, numAppointments);

		const safeAppointments: SafeAppointment[] = appointments.map((item) => ({
			id: item.id,
			startTimestamp: item.startTimestamp,
			serviceID: item.service.id,
			serviceName: item.service.serviceName,
			serviceDuration: item.service.serviceDuration,
			serviceDescription: item.service.serviceDescription,
			staffID: item.staff.id,
			staffName: item.staff.name,
		}));
		return safeAppointments;
	}

	// Edit an appointment

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Patch("appointments")
	async editAppointment(
		@GetUser() _user: SafeUser,
		@Body() dto: EditAppointmentDTO,
	): Promise<SafeAppointment> {
		const appointment: Appointment = await this.userService.editAppointment(
			_user.email,
			dto,
		);

		const safeAppointment: SafeAppointment = {
			id: appointment.id,
			startTimestamp: appointment.startTimestamp,
			serviceID: appointment.service.id,
			serviceName: appointment.service.serviceName,
			serviceDuration: appointment.service.serviceDuration,
			serviceDescription: appointment.service.serviceDescription,
			staffID: appointment.staff.id,
			staffName: appointment.staff.name,
		};
		return safeAppointment;
	}

	// Delete an appointment

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Delete("appointments")
	async deleteAppointment(
		@GetUser() user: SafeUser,
		@Body() dto: DeleteAppointmentDTO,
	): Promise<string> {
		await this.userService.deleteAppointment(user.email, dto.appointmentID);
		return "Appointment deleted successfully.";
	}
}
