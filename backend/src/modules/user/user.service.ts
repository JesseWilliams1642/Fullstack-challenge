import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";

import { User } from "./user.entity";
import { Appointment } from "../appointment/appointment.entity";
import { hashPassword } from "../../common/utils";
import { SafeUser } from "../../common/types";
import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { AppointmentService } from "../appointment/appointment.service";
import { EditAppointmentDTO } from "./dto";

@Injectable()
export class UserService {
	constructor(
		@Inject("USER_REPOSITORY") private userRepository: Repository<User>,
		@Inject("APPOINTMENT_REPOSITORY")
		private appointmentRepository: Repository<Appointment>,
		@Inject("STAFF_REPOSITORY") private staffRepository: Repository<Staff>,
		@Inject("SERVICE_REPOSITORY") private serviceRepository: Repository<Service>,

		private readonly appointmentService: AppointmentService,
	) {}

	// Create a new user and add it to the database
	async createUser(
		email: string,
		password: string,
		name: string,
		phoneNumber: string,
	): Promise<SafeUser> {
		const newUser: User = this.userRepository.create({
			email: email,
			hashedPassword: await hashPassword(password),
			name: name,
			phoneNumber: phoneNumber,
		});

		const savedUser: User = await this.userRepository.save(newUser);
		return {
			id: savedUser.id,
			name: savedUser.name,
			email: savedUser.email,
			phoneNumber: savedUser.phoneNumber,
		};
	}

	// Add a new appointment, making sure it is available (no double booking or overlapping)

	async addAppointment(
		email: string,
		serviceID: string,
		startDate: Date,
		staffID: string,
	): Promise<Appointment> {
		// Get entities from respective repositories
		const user: User | null = await this.userRepository.findOneBy({ email: email });
		if (!user) throw new Error(`User could not be found for email ${email}.`); // NEEDS ERROR HANDLING

		const service: Service | null = await this.serviceRepository.findOneBy({
			id: serviceID,
		});
		if (!service)
			throw new Error(`Service could not be found for id ${serviceID}.`); // NEEDS ERROR HANDLING

		const staff: Staff | null = await this.staffRepository.findOneBy({
			id: staffID,
		});
		if (!staff) throw new Error(`Staff could not be found for id ${staffID}.`); // NEEDS ERROR HANDLING

		// Check if the appointment is still available
		const appointmentAvailable: boolean =
			await this.appointmentService.checkAppointmentAvailability(
				startDate,
				serviceID,
				staffID,
			);

		// Check if there is overlap with the user's pre-existing appointments
		if (user.appointments) {
			const overlap: boolean = await this.appointmentService.checkAppointmentOverlap(
				user,
				service,
				startDate,
			);
			if (overlap)
				throw new Error("Appointment overlaps with pre-existing user appointment."); // NEEDS ERROR HANDLING
		}

		if (appointmentAvailable) {
			const newAppointment = new Appointment(startDate, service, user, staff);

			return this.appointmentRepository.save(newAppointment);
		} else throw new Error("Appointment is unavailable."); // NEEDS ERROR HANDLING
	}

	// Get user appointments for display
	async getAppointments(email: string): Promise<Appointment[]> {
		const user: User | null = await this.userRepository.findOne({
			where: { email: email },
			relations: ["appointments", "appointments.staff", "appointments.service"],
		});
		if (!user) throw new Error(`User could not be found for email ${email}.`); // NEEDS ERROR HANDLING

		user.appointments = user.appointments || [];
		const sortedAppointments: Appointment[] = user.appointments.sort(
			(a, b) =>
				new Date(a.startTimestamp).getTime() - new Date(b.startTimestamp).getTime(),
		);
		return sortedAppointments;
	}

	// Get a limited number of appointments for display
	async getLimitedAppointments(
		email: string,
		numAppointments: string,
	): Promise<Appointment[]> {
		// Don't need to check if returnSize is a number as ParseIntPipe checks
		// for us in user.controller.ts
		let returnSize: number = Number(numAppointments);
		if (returnSize < 0) throw new Error("Id should be a positive integer."); // NEEDS ERROR HANDLING

		const user: User | null = await this.userRepository.findOne({
			where: { email: email },
			relations: ["appointments", "appointments.staff", "appointments.service"],
		});
		if (!user) throw new Error(`User could not be found for email ${email}.`); // NEEDS ERROR HANDLING

		user.appointments = user.appointments || [];
		if (user.appointments.length < returnSize)
			returnSize = (user.appointments || []).length;

		const sortedAppointments: Appointment[] = user.appointments.sort(
			(a, b) =>
				new Date(a.startTimestamp).getTime() - new Date(b.startTimestamp).getTime(),
		);

		const appointmentList: Appointment[] = [];
		for (let i = 0; i < returnSize; i++)
			appointmentList.push(sortedAppointments[i]);

		return appointmentList;
	}

	// Edit details of the appointment, and check if the changes are possible

	async editAppointment(
		email: string,
		dto: EditAppointmentDTO,
	): Promise<Appointment> {
		// Get the appointment to be changed, check the user owns it

		const user: User | null = await this.userRepository.findOne({
			where: { email: email },
			relations: ["appointments", "appointments.staff", "appointments.service"],
		});
		if (!user) throw new Error(`User could not be found for email ${email}.`); // NEEDS ERROR HANDLING

		if (!user.appointments)
			throw new Error("User does not contain any appointments.");

		let appointment: Appointment | null = null;
		for (const _appointment of user.appointments)
			if (_appointment.id === dto.appointmentID) appointment = _appointment;

		if (!appointment) throw new Error("Appointment is not owned by the User");

		if (!dto.serviceID && !dto.staffID && !dto.startDate)
			throw new Error("Request needs at least one changed attribute.");

		// Get the new service/staff member if an ID is in the request
		// Else, use the old values

		let service: Service | null = null;
		if (dto.serviceID) {
			service = await this.serviceRepository.findOneBy({ id: dto.serviceID });
			if (!service)
				throw new Error(`Service could not be found for id ${dto.serviceID}.`); // NEEDS ERROR HANDLING
		} else service = appointment.service;

		let staff: Staff | null = null;
		if (dto.staffID) {
			staff = await this.staffRepository.findOneBy({ id: dto.staffID });
			if (!staff) throw new Error(`Staff could not be found for id ${dto.staffID}.`); // NEEDS ERROR HANDLING
		} else staff = appointment.staff;

		let startDate: Date = appointment.startTimestamp;
		if (dto.startDate) startDate = new Date(dto.startDate);

		// Check if the appointment is still available
		const appointmentAvailable: boolean =
			await this.appointmentService.checkAppointmentAvailability(
				startDate,
				dto.serviceID,
				dto.staffID,
				appointment,
			);

		// Check if there is overlap with the user's pre-existing appointments
		const appointmentOverlap: boolean =
			await this.appointmentService.checkAppointmentOverlap(
				user,
				service,
				startDate,
				appointment,
			);
		if (appointmentOverlap)
			throw new Error("Appointment overlaps with pre-existing user appointment."); // NEEDS ERROR HANDLING

		if (appointmentAvailable) {
			appointment.service = service;
			appointment.staff = staff;
			appointment.startTimestamp = startDate;

			return await this.appointmentRepository.save(appointment);
		} else throw new Error("Appointment is unavailable."); // NEEDS ERROR HANDLING
	}

	// Delete an appointment, update employee and staff appointment lists accordingly

	async deleteAppointment(email: string, appointmentID: string): Promise<void> {
		// Get user and to-be-deleted appointment
		const user: User | null = await this.userRepository.findOne({
			where: { email: email },
			relations: ["appointments", "appointments.staff"],
		});
		if (!user) throw new Error(`User could not be found for email ${email}.`); // NEEDS ERROR HANDLING

		if (!user.appointments)
			throw new Error("User does not contain any appointments.");

		let appointment: Appointment | null = null;
		for (const _appointment of user.appointments)
			if (_appointment.id === appointmentID) appointment = _appointment;

		if (!appointment) throw new Error("Appointment is not owned by the User");

		// Get staff member associated with the appointment
		const staff: Staff | null = await this.staffRepository.findOne({
			where: { id: appointment.staff.id },
			relations: ["appointments"],
		});
		if (!staff)
			throw new Error(`Staff could not be found for email ${appointment.staff.id}.`); // NEEDS ERROR HANDLING

		if (!staff.appointments)
			throw new Error("Staff does not contain any appointments.");

		// Remove appointment from user
		user.appointments = user.appointments.filter(
			(item) => item.id !== appointment.id,
		);
		await this.userRepository.save(user);

		// Remove appointment from staff
		staff.appointments = staff.appointments.filter(
			(item) => item.id !== appointment.id,
		);
		await this.staffRepository.save(staff);

		// Remove appointment
		await this.appointmentRepository.delete(appointment);
	}
}
