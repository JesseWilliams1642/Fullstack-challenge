import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { Appointment } from "./appointment.entity";

export function checkAppointmentAvailability(startDate: Date, service: Service, staff: Staff): boolean {

    return false;

}

export function checkAppointmentOverlap(preexistingAppointments: Appointment[], service: Service, startTime: Date): boolean {

    return false;

}