import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";

import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { Appointment } from "./appointment.entity";
import { dateToStrings, durationToMilliseconds } from "../../common/utils";
import { User } from "../user/user.entity";

@Injectable()
export class AppointmentService {
	constructor(
		@Inject("APPOINTMENT_REPOSITORY")
		private appointmentRepository: Repository<Appointment>,
		@Inject("STAFF_REPOSITORY") private staffRepository: Repository<Staff>,
		@Inject("SERVICE_REPOSITORY") private serviceRepository: Repository<Service>,
		@Inject("USER_REPOSITORY") private userRepository: Repository<User>,
	) {}

	// Get a list of available times for a specific service and staff member
	// for a specific day

	async getAvailabilities(
		day: Date,
		userID: string,
		serviceID: string,
		staffID: string,
		appointmentID: string | null,
	): Promise<string[]> {
		// Get required data
		const service: Service | null = await this.serviceRepository.findOneBy({
			id: serviceID,
		});
		if (!service)
			throw new NotFoundException(`Service could not be found for id ${serviceID}.`);

		const staff: Staff | null = await this.staffRepository.findOneBy({
			id: staffID,
		});
		if (!staff)
			throw new NotFoundException(`Staff could not be found for id ${staffID}.`);

		const user: User | null = await this.userRepository.findOneBy({
			id: userID,
		});
		if (!user)
			throw new NotFoundException(`User could not be found for id ${userID}.`);

		// Check if the staff member works on that day
		let dayOfWeek: number = day.getDay();
		dayOfWeek = (dayOfWeek - 1) % 7; // Convert from 0-6 Sun-Sat to 0-6 Mon-Sun

		if (!staff.daysWorking[dayOfWeek])
			// If not working that day, return no dates
			return [];

		// Get staff appointments ordered by soonest appointment to latest
		const nextDay: Date = new Date(day);
		nextDay.setDate(nextDay.getDate() + 1); // Gives us the upper bound for the search

		let staffAppointments: Appointment[] = await this.appointmentRepository
			.createQueryBuilder("appointment")
			.leftJoinAndSelect("appointment.service", "service")
			.where("appointment.staff = :staffID", { staffID: staff.id })
			.andWhere(
				"appointment.startTimestamp >= :day AND appointment.startTimestamp <= :nextDay",
				{
					day,
					nextDay,
				},
			)
			.getMany();

		// Get staff-related information in milliseconds

		const staffDayStart: number =
			durationToMilliseconds(staff.startTime) + day.getTime();
		const staffDayEnd: number =
			staffDayStart + durationToMilliseconds(staff.shiftDuration);

		const staffBuffer: number = durationToMilliseconds(staff.bufferPeriod);

		const staffBreakStart: number =
			durationToMilliseconds(staff.breakTime) + day.getTime();
		const staffBreakEnd: number =
			staffBreakStart + durationToMilliseconds(staff.breakDuration);

		// Service-related information in milliseconds
		const serviceDuration: number = durationToMilliseconds(service.serviceDuration);

		// Get user appointments to check for overlaps
		let userAppointments: Appointment[] = await this.appointmentRepository
			.createQueryBuilder("appointment")
			.leftJoinAndSelect("appointment.service", "service")
			.where("appointment.user = :userID", { userID: user.id })
			.andWhere(
				"appointment.startTimestamp >= :day AND appointment.startTimestamp <= :nextDay",
				{
					day,
					nextDay,
				},
			)
			.getMany();

		// Remove the to-be-edited appointment ID from the two appointment lists
		if (appointmentID) {
			staffAppointments = staffAppointments.filter(
				(appointment) => appointment.id !== appointmentID,
			);
			userAppointments = userAppointments.filter(
				(appointment) => appointment.id !== appointmentID,
			);
		}

		// Get initial list of possible times
		let possibleTimes: number[] = [staffDayStart]; // 300000 ms = 5 minutes
		while (possibleTimes.at(-1)! <= staffDayEnd - 300000 - serviceDuration)
			possibleTimes.push(possibleTimes.at(-1)! + 300000);

		// Remove conflicting user appointment times (overlaps)
		for (let appointment of userAppointments) {
			const appointmentStart: number = appointment.startTimestamp.getTime();
			const appointmentEnd: number =
				appointmentStart + durationToMilliseconds(appointment.service.serviceDuration);

			possibleTimes = possibleTimes.filter((time) => {
				if (
					time > appointmentStart - (serviceDuration + staffBuffer) &&
					time < appointmentEnd + staffBuffer
				)
					return false;

				return true;
			});
		}

		// Remove conflicting staff appointment times
		for (let appointment of staffAppointments) {
			const appointmentStart: number = appointment.startTimestamp.getTime();
			const appointmentEnd: number =
				appointmentStart + durationToMilliseconds(appointment.service.serviceDuration);

			possibleTimes = possibleTimes.filter((time) => {
				if (
					time > appointmentStart - (serviceDuration + staffBuffer) &&
					time < appointmentEnd + staffBuffer
				)
					return false;

				return true;
			});
		}

		// Remove times conflicting with the break time
		// Here, I am assuming we merge the break time with the staff buffer
		possibleTimes = possibleTimes.filter((time) => {
			if (
				time > staffBreakStart - serviceDuration &&
				time < staffBreakEnd + staffBuffer
			)
				return false;

			return true;
		});

		// Convert to time strings and return the array
		const timestamps: string[] = possibleTimes.map(
			(time) => dateToStrings(new Date(time))[1],
		);

		return timestamps;
	}

	// Check for if the addition or changing of an appointment is valid
	// by checking if its available and if there is personal appointment overlap

	async checkAppointmentAvailability(
		date: Date,
		user: User,
		service: Service,
		staff: Staff,
		appointment: Appointment | null,
	): Promise<boolean> {
		// Turn Appointment date into the specific day
		const day: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		// Check if the staff member works on that day
		let dayOfWeek: number = day.getDay();
		dayOfWeek = (dayOfWeek - 1) % 7; // Convert from 0-6 Sun-Sat to 0-6 Mon-Sun

		if (!staff.daysWorking[dayOfWeek])
			// If not working that day, unavailable
			throw new BadRequestException(
				"The chosen appointment is not within the chosen staff's operating days.",
			);

		// Get staff appointments ordered by soonest appointment to latest
		const nextDay: Date = new Date(day);
		nextDay.setDate(nextDay.getDate() + 1); // Gives us the upper bound for the search

		let staffAppointments: Appointment[] = await this.appointmentRepository
			.createQueryBuilder("appointment")
			.leftJoinAndSelect("appointment.service", "service")
			.where("appointment.staff = :staffID", { staffID: staff.id })
			.andWhere(
				"appointment.startTimestamp >= :day AND appointment.startTimestamp <= :nextDay",
				{
					day,
					nextDay,
				},
			)
			.getMany();

		// Get staff-related information in milliseconds

		const staffDayStart: number =
			durationToMilliseconds(staff.startTime) + day.getTime();
		const staffDayEnd: number =
			staffDayStart + durationToMilliseconds(staff.shiftDuration);

		const staffBuffer: number = durationToMilliseconds(staff.bufferPeriod);

		const staffBreakStart: number =
			durationToMilliseconds(staff.breakTime) + day.getTime();
		const staffBreakEnd: number =
			staffBreakStart + durationToMilliseconds(staff.breakDuration);

		// Service-related information in milliseconds
		const serviceDuration: number = durationToMilliseconds(service.serviceDuration);

		// Specific appointment start/end time
		const chosenAppointmentStart: number = date.getTime();
		const chosenAppointmentEnd: number = chosenAppointmentStart + serviceDuration;

		// Get user appointments to check for overlaps
		let userAppointments: Appointment[] = await this.appointmentRepository
			.createQueryBuilder("appointment")
			.leftJoinAndSelect("appointment.service", "service")
			.where("appointment.user = :userID", { userID: user.id })
			.andWhere(
				"appointment.startTimestamp >= :day AND appointment.startTimestamp <= :nextDay",
				{
					day,
					nextDay,
				},
			)
			.getMany();

		// Remove the to-be-edited appointment ID from the two appointment lists
		if (appointment) {
			staffAppointments = staffAppointments.filter(
				(staffAppointment) => staffAppointment.id !== appointment.id,
			);
			userAppointments = userAppointments.filter(
				(userAppointment) => userAppointment.id !== appointment.id,
			);
		}

		// Check that it is within operating hours
		if (
			!(
				chosenAppointmentStart >= staffDayStart && chosenAppointmentEnd <= staffDayEnd
			)
		)
			throw new BadRequestException(
				"The chosen appointment is not within the chosen staff's operating hours.",
			);

		// Check for conflicting user appointment times (overlaps)
		for (let appointment of userAppointments) {
			const appointmentStart: number = appointment.startTimestamp.getTime();
			const appointmentEnd: number =
				appointmentStart + durationToMilliseconds(appointment.service.serviceDuration);

			if (
				chosenAppointmentStart > appointmentStart - (serviceDuration + staffBuffer) &&
				chosenAppointmentStart < appointmentEnd + staffBuffer
			)
				throw new BadRequestException(
					"The chosen appointment overlaps with one of the user's existing appointments.",
				);
		}

		// Check for conflicting staff appointment times
		for (let appointment of staffAppointments) {
			const appointmentStart: number = appointment.startTimestamp.getTime();
			const appointmentEnd: number =
				appointmentStart + durationToMilliseconds(appointment.service.serviceDuration);

			if (
				chosenAppointmentStart > appointmentStart - (serviceDuration + staffBuffer) &&
				chosenAppointmentStart < appointmentEnd + staffBuffer
			)
				throw new BadRequestException(
					"The chosen appointment conflicts with one of the staff's existing appointments.",
				);
		}

		// Check for times conflicting with the break time
		// Here, I am assuming we merge the break time with the staff buffer
		if (
			chosenAppointmentStart > staffBreakStart - serviceDuration &&
			chosenAppointmentStart < staffBreakEnd + staffBuffer
		)
			throw new BadRequestException(
				"The chosen appointment conflicts with the staff's break time.",
			);

		return true;
	}
}
