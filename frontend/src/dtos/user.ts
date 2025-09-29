export class CreateAppointmentDTO {
	serviceID!: string;
	date!: string;
	time!: string;
	staffID!: string;
}

export class EditAppointmentDTO {
	appointmentID!: string;
	serviceID?: string;
	date?: string;
	time?: string;
	staffID?: string;
}
