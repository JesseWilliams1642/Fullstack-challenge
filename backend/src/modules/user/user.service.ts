import { Injectable } from "@nestjs/common";
import { User } from "./user.model"
import { Appointment } from "../appointment/appointment.model";

@Injectable()
export class UserService {
    
    addAppointment(user: User, appointmentType: string) {
        const appointment = new Appointment("0", appointmentType);
        user.appointments = [...user.appointments, appointment];
        return user;
    }

    getAppointments(user: User): Appointment[] {
        return [...user.appointments]
    }

    // user.appointments.find(appointment => appointment.id => appointment.id === appointmentId);
    // findIndex gets the index instead of the object itself

    getLimitedAppointments(user: User, numAppointments: string) {
        let returnSize: number = Number(numAppointments);
        if (isNaN(returnSize)) 
            throw new Error("Number of appointments is not a number.");
        if (returnSize < 0)
            throw new Error("Number must be positive.")
        
        if (user.appointments.length < returnSize)
            returnSize = user.appointments.length;

        const appointmentList: Appointment[] = [];
        for (let i = 0; i < returnSize; i++) 
            appointmentList.push(user.appointments[i])

        return appointmentList;

    }

    // Patch changes specific values. Put values replaces the whole object
    // Delete
    
}