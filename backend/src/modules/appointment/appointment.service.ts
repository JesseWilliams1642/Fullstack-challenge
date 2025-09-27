import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { Appointment } from "./appointment.entity";

@Injectable()
export class AppointmentService {
    
    constructor(
        @Inject('APPOINTMENT_REPOSITORY') private appointmentRepository: Repository<Appointment>,
        @Inject('STAFF_REPOSITORY') private staffRepository: Repository<Staff>,
        @Inject('SERVICE_REPOSITORY') private serviceRepository: Repository<Service>
    ) {}
    
    async getAvailabilities(
        serviceID: string,
        staffID: string
    ): Promise<Date[]> {

        return [new Date()];

    }

    async checkAppointmentAvailability(
        startDate: Date, 
        service: Service, 
        staff: Staff,

        // Needed to remove from the list of appointments we compare with if we doing the check for 
        // editAppointment (as that appointment would) be gone after the edit!
        oldAppointment?: Appointment    
            
    ): Promise<boolean> {
        


        return true;

    }

    async checkAppointmentOverlap(
        preexistingAppointments: Appointment[], 
        service: Service, 
        startTime: Date,
        oldAppointment?: Appointment
    ): Promise<boolean> {

        return true;

    }

}




