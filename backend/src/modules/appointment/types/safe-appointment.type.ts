// Needed to prevent recursion issues when retrieving
// appointments for a user

export interface SafeAppointment {
	id: string;
	startTimestamp: Date;
	dateString: string;
	timeString: string;
	serviceID: string;
	serviceName: string;
	serviceDuration: string;
	serviceDescription: string;
	staffID: string;
	staffName: string;
	status: "scheduled" | "completed";
}
