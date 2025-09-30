export class CreateAppointmentDTO {
	serviceID!: string;
	startDate!: string;
	staffID!: string;
}

export class EditAppointmentDTO {
	appointmentID!: string;
	serviceID?: string;
	startDate?: string;
	staffID?: string;
}
