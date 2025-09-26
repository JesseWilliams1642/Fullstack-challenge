import { NonFunctionProperties } from "src/common/utils/strip-class";
import { Appointment } from "../appointment.entity";

// Needed to prevent recursion issues when retrieving appointments
// for a user

export type SafeAppointment = NonFunctionProperties<Omit<Appointment,"user">>