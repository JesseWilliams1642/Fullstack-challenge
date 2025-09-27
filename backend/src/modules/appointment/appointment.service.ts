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
        day: Date,
        staffID: string
    ): Promise<Date[]> {

        // Get required data
        const service: Service | null = await this.serviceRepository.findOneBy({ id: serviceID });
        if (!service) throw new Error(`Service could not be found for id ${serviceID}.`);              // NEEDS ERROR HANDLING

        const staff: Staff | null = await this.staffRepository.findOneBy({ id: staffID });
        if (!staff) throw new Error(`Staff could not be found for id ${staffID}.`);              // NEEDS ERROR HANDLING

        // Check if the staff member works on that day
        let dayOfWeek: number = day.getDay();
        dayOfWeek = (dayOfWeek - 1) % 7;            // Convert from 0-6 Sun-Sat to 0-6 Mon-Sun

        if (!staff.daysWorking[dayOfWeek])          // If not working that day, return no dates
            return [];

        // Get staff appointments ordered by soonest appointment to latest
        const staffAppointments: Appointment[] = await this.appointmentRepository.createQueryBuilder('appointment')
                                                                                    .leftJoinAndSelect('appointment.service', 'service')
                                                                                    .where('appointment.staff = :staffID', { staffID: staff.id })
                                                                                    .orderBy('appointment.startTimestamp', 'ASC')
                                                                                    .getMany();

        const staffAppointmentSize: number = staffAppointments.length;
        let staffAppointmentIndex: number = 0;

        // Get service-related information in milliseconds

        const staffDayStart: number = durationToMilliseconds(staff.startTime) + day.getTime();
        const staffDayEnd: number = staffDayStart + durationToMilliseconds(staff.shiftDuration);

        const staffBuffer: number = durationToMilliseconds(staff.bufferPeriod);

        const staffBreakStart: number = durationToMilliseconds(staff.breakTime) + day.getTime();
        const staffBreakEnd: number = staffBreakStart + durationToMilliseconds(staff.breakDuration);

        const possibleValues: Date[] = [];
        let startTime: number = staffDayStart - 300000; // - 5 minutes
        const duration: number = durationToMilliseconds(service.serviceDuration);
        
        while (startTime + duration < staffDayEnd) {

            startTime = startTime + 300000;     // + 5 minutes

            const endTime: number = startTime + duration;

            // Get current appointment information
            const appointmentStart: number = staffAppointments[staffAppointmentIndex].startTimestamp.getTime();
            const appointmentEnd: number = appointmentStart + durationToMilliseconds(staffAppointments[staffAppointmentIndex].service.serviceDuration)

            // Check if the start or end time is inside an appointment (or its buffer bounds)
            if (startTime >= appointmentStart - staffBuffer && startTime < appointmentEnd + staffBuffer) continue;
            if (endTime > appointmentStart - staffBuffer && endTime <= appointmentEnd + staffBuffer) continue;

            // Check for the break period
            if (startTime >= staffBreakStart && startTime < staffBreakEnd) continue;  // Only < as we can start at the end of the break
            if (endTime > staffBreakStart && endTime <= staffBreakEnd) continue;     

            // Goto next appointment for check if we have moved past it
            if (startTime >= appointmentEnd + staffBuffer && staffAppointmentIndex + 1 < staffAppointmentSize)
                staffAppointmentIndex = staffAppointmentIndex + 1; 

            possibleValues.push(new Date(startTime));

        }

        return possibleValues;

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




