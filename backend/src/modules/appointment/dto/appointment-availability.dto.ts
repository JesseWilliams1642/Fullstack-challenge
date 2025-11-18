import { Transform } from "class-transformer";
import { IsISO8601, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

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

	// Transforms lets "" get treated as undefined, which IsOptional looks for
	// By default, "" is a defined string and is checked by UUID
	@Transform(({ value }) => (value === "" ? undefined : value))
	@IsOptional()
	@IsUUID(undefined, { message: "Appointment ID must be a valid UUID." })
	appointmentID?: string;
}
