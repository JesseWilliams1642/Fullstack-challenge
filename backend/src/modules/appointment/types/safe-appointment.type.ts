// Needed to prevent recursion issues when retrieving appointments
// for a user

export interface SafeAppointment {
	id: string;
	startTimestamp: Date;
	serviceID: string;
	serviceName: string;
	serviceDuration: object;
	serviceDescription: string;
	staffID: string;
	staffName: string;
}
