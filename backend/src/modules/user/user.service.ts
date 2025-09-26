import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";

import { User } from "./user.entity"
import { Appointment } from "../appointment/appointment.entity";
import { hashPassword } from "../../common/utils";
import { SafeUser } from "../../common/types";
import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { AppointmentService } from "../appointment/appointment.service";

@Injectable()
export class UserService {
    
    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
        @Inject('APPOINTMENT_REPOSITORY') private appointmentRepository: Repository<Appointment>,
        @Inject('STAFF_REPOSITORY') private staffRepository: Repository<Staff>,
        @Inject('SERVICE_REPOSITORY') private serviceRepository: Repository<Service>,

        private readonly appointmentService: AppointmentService
    ) {}

    async createUser(
        email: string, 
        password: string, 
        name: string, 
        phoneNumber: string
    ): Promise<SafeUser> {

        const newUser: User = this.userRepository.create({
            email: email,
            hashedPassword: await hashPassword(password),
            name: name,
            phoneNumber: phoneNumber
        })

        const savedUser: User = await this.userRepository.save(newUser);
        return {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber
        };

    }

    async addAppointment(
        email: string, 
        serviceID: string, 
        startDate: Date, 
        staffID: string
    ): Promise<Appointment[]> {

        // Get entities from respective repositories

        const user: User | null = await this.userRepository.findOneBy({ email: email });
        if (!user) throw new Error(`User could not be found for email ${email}.`);              // NEEDS ERROR HANDLING

        const service: Service | null = await this.serviceRepository.findOneBy({ id: serviceID });
        if (!service) throw new Error(`Service could not be found for id ${serviceID}.`);              // NEEDS ERROR HANDLING

        const staff: Staff | null = await this.staffRepository.findOneBy({ id: staffID });
        if (!staff) throw new Error(`Staff could not be found for id ${staffID}.`);              // NEEDS ERROR HANDLING

        // Check if the appointment is still available
        const appointmentAvailable: boolean = await this.appointmentService.checkAppointmentAvailability(startDate, service, staff);

        // Check if there is overlap with the user's pre-existing appointments
        let appointmentOverlap: boolean = false;
        if (user.appointments)
            appointmentOverlap = await this.appointmentService.checkAppointmentOverlap(user.appointments, service, startDate);

        if (appointmentAvailable) {

            if (appointmentOverlap) throw new Error("Appoint overlaps with pre-existing user appointment.");        // NEEDS ERROR HANDLING

            const newAppointment = new Appointment(
                startDate,
                service,
                user,
                staff
            );

            const appointment: Appointment = await this.appointmentRepository.save(newAppointment);

            // Return the new list of user appointments

            user.appointments = [...user.appointments || [], appointment];
            await this.userRepository.save(user);
            return user.appointments;

        } else throw new Error("Appointment is unavailable.");                                      // NEEDS ERROR HANDLING

    }

    async getAppointments(email: string): Promise<Appointment[]> {

        const user: User | null = await this.userRepository.findOne({
            where: { email: email },
            relations: ['appointments']
        });
        if (!user) throw new Error(`User could not be found for email ${email}.`);              // NEEDS ERROR HANDLING

        return [...user.appointments || []]

    }

    async getLimitedAppointments(email: string, numAppointments: string): Promise<Appointment[]> {

        // Don't need to check if returnSize is a number as ParseIntPipe checks
        // for us in user.controller.ts
        let returnSize: number = Number(numAppointments);
        if (returnSize < 0) throw new Error("Id should be a positive integer.");                // NEEDS ERROR HANDLING

        const user: User | null = await this.userRepository.findOne({
            where: { email: email },
            relations: ['appointments']
        });
        if (!user) throw new Error(`User could not be found for email ${email}.`);              // NEEDS ERROR HANDLING
        
        if ((user.appointments || []).length < returnSize)
            returnSize = (user.appointments || []).length;

        const appointmentList: Appointment[] = [];
        for (let i = 0; i < returnSize; i++) 
            appointmentList.push((user.appointments || [])[i])

        return appointmentList;

    }

    // Patch changes specific values. Put values replaces the whole object
    // Delete

}