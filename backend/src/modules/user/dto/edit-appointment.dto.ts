import { IsISO8601, IsNotEmpty, IsUUID } from "class-validator";

export class EditAppointmentDTO {
	@IsUUID(undefined, { message: "Appointment ID must be a valid UUID." })
	@IsNotEmpty({ message: "Appointment ID can not be empty." })
	appointmentID!: string;

	@IsUUID(undefined, { message: "Service ID must be a valid UUID." })
	@IsNotEmpty({ message: "Service ID can not be empty." })
	serviceID!: string;

	@IsISO8601(undefined, { message: "Start Date must be a valid Date." })
	@IsNotEmpty({ message: "Start Date can not be empty." })
	startDate!: string;

	@IsUUID(undefined, { message: "Staff ID must be a valid UUID." })
	@IsNotEmpty({ message: "Staff ID can not be empty." })
	staffID!: string;
}
