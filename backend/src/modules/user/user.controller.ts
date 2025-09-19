import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.model";
import { Appointment } from "../appointment/appointment.model";

@Controller('user')
export class UserController {
    
    public user: User;

    constructor(private userService: UserService) {
        this.user = new User("0","Jesse",[]);
    }

    // @Body header tells the service which value from the request body
    // we want to use! Really cool!
    @Post('appointments')
    addAppointment(
        @Body('user') user: User, 
        @Body('appointmentType') appointmentType: string
    ): User {
        return this.userService.addAppointment(user, appointmentType);
    }

    @Get('appointments')
    getAppointments(@Body('user') user: User): Appointment[] {
        return this.userService.getAppointments(user);
    }

    @Get('appointments/:id')
    getLimitedAppointments(
        @Body('user') user: User,
        @Param('id') numAppointments: string
    ): Appointment[] {
        return this.userService.getLimitedAppointments(user, numAppointments);
    }

}