// Needed to prevent recursion issues when retrieving
// appointments for a user

import { PostgresInterval } from "src/common/types";

export interface SafeAppointment {
	id: string;
	startTimestamp: Date;
	dateString: string;
	timeString: string;
	serviceID: string;
	serviceName: string;
	serviceDuration: string | PostgresInterval;
	serviceDescription: string;
	staffID: string;
	staffName: string;
	status: "scheduled" | "completed";
}
