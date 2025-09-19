import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { Appointment } from "../appointment/appointment.entity";

@Controller('user')
export class UserController {
    
    public user: User;

    constructor(private userService: UserService) {
        this.user = new User("Jesse");
    }

    // @Body header tells the service which value from the request body
    // we want to use! Really cool!
    @Post('appointments')
    addAppointment(
        //@Body('user') user: User, 
        @Body('serviceType') serviceType: string
    ): Object {

        this.user = this.userService.addAppointment(this.user, serviceType);
        const nonCyclicalAppointments: Omit<Appointment, "user">[] = this.user.appointments.map(({ user, ...data }) => data);
        return {id: this.user.id, name: this.user.name, appointments: nonCyclicalAppointments }

    }

    @Get('appointments')
    //getAppointments(@Body('user') user: User): Appointment[] {
    getAppointments(): Omit<Appointment,"user">[] {

        const appointments: Appointment[] = this.userService.getAppointments(this.user);
        const userlessAppointments: Omit<Appointment,"user">[] = appointments.map(({user, ...data}) => data);
        return userlessAppointments;

    }

    @Get('appointments/:id')
    getLimitedAppointments(
        //@Body('user') user: User,
        @Param('id') numAppointments: string
    ): Omit<Appointment,"user">[] {

        const appointments: Appointment[] = this.userService.getLimitedAppointments(this.user, numAppointments);
        console.log(appointments);
        const userlessAppointments: Omit<Appointment,"user">[] = appointments.map(({user, ...data}) => data);
        console.log(userlessAppointments);
        return userlessAppointments;

    }

}