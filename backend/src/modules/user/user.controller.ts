import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req, HttpStatus, HttpCode } from "@nestjs/common";

import { UserService } from "./user.service";
import { Appointment } from "../appointment/appointment.entity";
import type { SafeUser } from "../../common/types";
import { JwtGuard } from "../../common/guards";
import { GetUser } from "../../common/decorators";
import { RegisterDTO } from "./dto";
import { SafeAppointment } from "../appointment/types";

// Note: Guards can be used at the controller level, as well as at the end-point level
// @UseGuards(JwtGuard)
@Controller('api/user')
export class UserController {
    
    constructor(private userService: UserService) {}

    // @Body header tells the service which value from the request body we want to use! Really cool!

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async addUser(
        @Body() dto: RegisterDTO
    ): Promise<SafeUser> {
        const createdUser = await this.userService.createUser(dto.email, dto.password, dto.name, dto.phoneNumber);
        return createdUser;
    }










    /*

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

    */

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    @Get('appointments')
    async getAppointments(
        @GetUser() user: SafeUser
    ): Promise<SafeAppointment[]> {

        const appointments: Appointment[] = await this.userService.getAppointments(user.email);
        const userlessAppointments: SafeAppointment[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    @Get('appointments/:id')
    async getLimitedAppointments(
        @GetUser() user: SafeUser,
        @Param('id', ParseIntPipe) numAppointments: string
    ): Promise<SafeAppointment[]> {

        const appointments: Appointment[] = await this.userService.getLimitedAppointments(user.email, numAppointments);
        const userlessAppointments: SafeAppointment[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

}