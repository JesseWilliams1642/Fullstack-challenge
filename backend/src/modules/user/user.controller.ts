import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req } from "@nestjs/common";

import { UserService } from "./user.service";
import { User } from "./user.entity";
import { Appointment } from "../appointment/appointment.entity";
import type { SafeUser } from "./types/safe-user.types";
import { JwtGuard } from "../auth/guard";
import { GetUser } from "../auth/decorator";

// 2:20:11

// Note: Guards can be used at the controller level, as well as at the end-point level
//@UseGuards(JwtGuard)
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



    // Testing out auth

    @UseGuards(JwtGuard)
    @Post('appointments')
    async addAppointment(
        @GetUser() user: SafeUser, 
        @Body('serviceType') serviceType: string
    ): Promise<Object> {                                // NEED TO REPLACE WITH SOMETHING DTO-ISH!

        //const user: SafeUser | undefined = req.user;
        if (!user) throw new Error("Request does not hold the JWT payload.");

        const responseUser: User = await this.userService.addAppointment(user.email, serviceType);
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
        @Param('id', ParseIntPipe) numAppointments: string
    ): Promise<Omit<Appointment,"user">[]> {

        const appointments: Appointment[] = await this.userService.getLimitedAppointments(userEmail, numAppointments);
        const userlessAppointments: Omit<Appointment,"user">[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

}