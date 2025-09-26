import { Injectable, Inject } from "@nestjs/common";
import { User } from "./user.entity"
import { Appointment } from "../appointment/appointment.entity";
import { Repository } from "typeorm";
import { hashPassword } from "../../common/utils/hash";

@Injectable()
export class UserService {
    
    constructor(
        @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
        @Inject('APPOINTMENT_REPOSITORY') private appointmentRepository: Repository<Appointment>
    ) {}

    async createUser(email: string, password: string, name: string): Promise<User> {

        const newUser: User = this.userRepository.create({
            email: email,
            hashedPassword: await hashPassword(password),
            name: name
        })

        return await this.userRepository.save(newUser);

    }

    async addAppointment(email: string, serviceType: string): Promise<User> {

        const user: User | null = await this.userRepository.findOneBy({ email: email });
        if (!user) throw new Error(`User could not be found for email ${email}.`);

        const newAppointment: Appointment = this.appointmentRepository.create({
            serviceType,
            user
        });

        const appointment: Appointment = await this.appointmentRepository.save(newAppointment);

        user.appointments = [...user.appointments || [], appointment];
        return await this.userRepository.save(user);

    }

    async getAppointments(email: string): Promise<Appointment[]> {

        const user: User | null = await this.userRepository.findOne({
            where: { email: email },
            relations: ['appointments']
        });
        if (!user) throw new Error(`User could not be found for email ${email}.`);

        return [...user.appointments || []]

    }

    // user.appointments.find(appointment => appointment.id => appointment.id === appointmentId);
    // findIndex gets the index instead of the object itself

    async getLimitedAppointments(email: string, numAppointments: string): Promise<Appointment[]> {

        // Don't need to check if returnSize is a number as ParseIntPipe checks
        // for us in user.controller.ts
        let returnSize: number = Number(numAppointments);
        if (returnSize < 0) throw new Error("Id should be a positive integer.");

        const user: User | null = await this.userRepository.findOne({
            where: { email: email },
            relations: ['appointments']
        });
        if (!user) throw new Error(`User could not be found for email ${email}.`);
        
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