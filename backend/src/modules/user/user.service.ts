import { Injectable, Inject } from "@nestjs/common";
import { User } from "./user.entity"
import { Appointment } from "../appointment/appointment.entity";
import { Repository } from "typeorm";
import { hashPassword } from "src/utils/hash";

@Injectable()
export class UserService {
    
    constructor(
        @Inject('USER_REPOSITORY') private userRespository: Repository<User>,
        @Inject('APPOINTMENT_REPOSITORY') private appointmentRepository: Repository<Appointment>
    ) {}

    async createUser(email: string, password: string, name: string): Promise<User> {

        const newUser: User = this.userRespository.create({
            email: email,
            hashedPassword: await hashPassword(password),
            name: name
        })

        return await this.userRespository.save(newUser);

    }

    async addAppointment(email: string, serviceType: string): Promise<User> {

        const user: User | null = await this.userRespository.findOneBy({ email: email });
        if (!user) throw new Error(`User could not be found for email ${email}.`);

        const newAppointment: Appointment = this.appointmentRepository.create({
            serviceType,
            user
        });

        const appointment: Appointment = await this.appointmentRepository.save(newAppointment);

        user.appointments = [...user.appointments || [], appointment];
        return await this.userRespository.save(user);

    }

    async getAppointments(email: string): Promise<Appointment[]> {

        const user: User | null = await this.userRespository.findOne({
            where: { email: email },
            relations: ['appointments']
        });
        if (!user) throw new Error(`User could not be found for email ${email}.`);

        return [...user.appointments || []]

    }

    // user.appointments.find(appointment => appointment.id => appointment.id === appointmentId);
    // findIndex gets the index instead of the object itself

    async getLimitedAppointments(email: string, numAppointments: string): Promise<Appointment[]> {

        let returnSize: number = Number(numAppointments);
        if (isNaN(returnSize)) 
            throw new Error("Number of appointments is not a number.");
        if (returnSize < 0)
            throw new Error("Number must be positive.")

        const user: User | null = await this.userRespository.findOne({
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