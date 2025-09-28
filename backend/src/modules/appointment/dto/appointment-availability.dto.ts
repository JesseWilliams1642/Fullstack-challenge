import { IsISO8601, IsNotEmpty, IsUUID } from "class-validator";

export class GetAppointmentAvailabilityDTO {
	@IsUUID(undefined, { message: "Service ID must be a valid UUID." })
	@IsNotEmpty({ message: "Service ID can not be empty." })
	serviceID!: string;

	@IsISO8601(undefined, { message: "Date must be a valid Date." })
	@IsNotEmpty({ message: "Date can not be empty." })
	date!: string;

	@IsUUID(undefined, { message: "Staff ID must be a valid UUID." })
	@IsNotEmpty({ message: "Staff ID can not be empty." })
	staffID!: string;
}
