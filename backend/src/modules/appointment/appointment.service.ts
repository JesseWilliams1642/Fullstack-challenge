import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { Appointment } from "./appointment.entity";
import { durationToMilliseconds } from "../../common/utils";
import { User } from "../user/user.entity";

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
        user: User, 
        service: Service, 
        startTime: Date,
        oldAppointment?: Appointment
    ): Promise<boolean> {

        // Was needed; service was not transferring over!
        let preexistingAppointments: Appointment[] = await this.appointmentRepository.find({
            where: { user: user },
            relations: ['service']
        })

        // Remove old appointment from the comparison list if we are updating oldAppointment --> newAppointment

        if (oldAppointment)
            preexistingAppointments = preexistingAppointments.filter(item => (item.id !== oldAppointment.id));

        // Calculate start and end times in milliseconds

        const startTimeMs: number = startTime.getTime();
        const duration: number = durationToMilliseconds(service.serviceDuration);
        const endTimeMs: number = startTimeMs + duration;

        for (let appointment of preexistingAppointments) {

            const preeexistingStartTime: number = appointment.startTimestamp.getTime();
            const preexistingDuration: number = durationToMilliseconds(appointment.service.serviceDuration);
            const preexistingEndtime: number = preeexistingStartTime + preexistingDuration;

            if (startTimeMs >= preeexistingStartTime && startTimeMs < preexistingEndtime) return true;
            if (endTimeMs > preeexistingStartTime && endTimeMs <= preexistingEndtime) return true;

        }

        return false;

    }

}




