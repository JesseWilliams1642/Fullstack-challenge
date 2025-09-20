import { Controller, Post, Body, Get, Param } from "@nestjs/common";

import { UserService } from "./user.service";
import { User } from "./user.entity";
import { Appointment } from "../appointment/appointment.entity";

@Controller('user')
export class UserController {
    
    constructor(
        private userService: UserService
    ) {}

    // @Body header tells the service which value from the request body
    // we want to use! Really cool!

    @Post()
    async addUser(
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('name') name: string
    ): Promise<Omit<User,"hashedPassword">> {
        const createdUser = await this.userService.createUser(email, password, name);
        return { id: createdUser.id, email: createdUser.email, name: createdUser.name }
    }

    @Post('appointments')
    async addAppointment(
        @Body('email') email: string, 
        @Body('serviceType') serviceType: string
    ): Promise<Object> {                                // NEED TO REPLACE WITH SOMETHING DTO-ISH!

        const responseUser: User = await this.userService.addAppointment(email, serviceType);
        if (!responseUser.appointments) return {id: responseUser.id, name: responseUser.name, appointments: [] };

        const nonCyclicalAppointments: Omit<Appointment, "user">[] = responseUser.appointments.map(({ user, ...data }) => data);
        return {id: responseUser.id, name: responseUser.name, appointments: nonCyclicalAppointments }

    }

    @Get('appointments')
    async getAppointments(
        @Body('email') email: string
    ): Promise<Omit<Appointment,"user">[]> {

        const appointments: Appointment[] = await this.userService.getAppointments(email);
        const userlessAppointments: Omit<Appointment,"user">[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

    @Get('appointments/:id')
    async getLimitedAppointments(
        @Body('userEmail') userEmail: string,
        @Param('id') numAppointments: string
    ): Promise<Omit<Appointment,"user">[]> {

        const appointments: Appointment[] = await this.userService.getLimitedAppointments(userEmail, numAppointments);
        const userlessAppointments: Omit<Appointment,"user">[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

}