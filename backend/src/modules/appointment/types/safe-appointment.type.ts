import { NonFunctionProperties } from "src/common/utils/strip-class";
import { Appointment } from "../appointment.entity";

// Needed to prevent recursion issues when retrieving appointments
// for a user

export interface SafeAppointment {

    id: string,
    startTimestamp: Date,
    serviceID: string,
    serviceName: string,
    serviceDuration: Object,
    serviceDescription: string,
    staffID: string,
    staffName: string

}