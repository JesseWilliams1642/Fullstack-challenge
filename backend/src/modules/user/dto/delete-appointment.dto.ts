import { IsNotEmpty, IsUUID } from "class-validator";

export class DeleteAppointmentDTO {
	@IsUUID(undefined, { message: "Appointment ID must be a valid UUID." })
	@IsNotEmpty({ message: "Appointment ID can not be empty." })
	id!: string;

	constructor (
		id: string
	) {
		this.id = id;
	}

}
