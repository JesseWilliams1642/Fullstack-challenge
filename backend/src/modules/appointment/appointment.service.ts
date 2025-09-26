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
        staff: Staff
    ): Promise<boolean> {

        return false;

    }

    async checkAppointmentOverlap(
        preexistingAppointments: Appointment[], 
        service: Service, 
        startTime: Date
    ): Promise<boolean> {

        return false;

    }

}




