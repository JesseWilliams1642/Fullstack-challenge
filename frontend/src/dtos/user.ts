export class CreateAppointmentDTO {
	serviceID!: string;
	startDate!: Date;
	staffID!: string;
}

export class EditAppointmentDTO {
	appointmentID!: string;
	serviceID?: string;
	startDate?: Date;
	staffID?: string;
}
