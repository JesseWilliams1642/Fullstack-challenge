import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Req, HttpStatus, HttpCode, Patch, Delete } from "@nestjs/common";

import { UserService } from "./user.service";
import { Appointment } from "../appointment/appointment.entity";
import type { SafeUser } from "../../common/types";
import { JwtGuard } from "../../common/guards";
import { GetUser } from "../../common/decorators";
import { CreateAppointmentDTO, EditAppointmentDTO, DeleteAppointmentDTO, RegisterDTO } from "./dto";
import { SafeAppointment } from "../appointment/types";

// Note: Guards can be used at the controller level, as well as at the end-point level
// @UseGuards(JwtGuard)
@Controller('api/user')
export class UserController {
    
    constructor(private userService: UserService) {}

    /**
     * 
     * USER APIS
     * 
     */

    // Register for a new user account

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async addUser(
        @Body() dto: RegisterDTO
    ): Promise<SafeUser> {
        const createdUser = await this.userService.createUser(dto.email, dto.password, dto.name, dto.phoneNumber);
        return createdUser;
    }

    /**
     * 
     * USER APPOINTMENT APIS
     * 
     */

    // Create an appointment

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtGuard)
    @Post('appointments')
    async addAppointment(
        @GetUser() user: SafeUser, 
        @Body() dto: CreateAppointmentDTO
    ): Promise<SafeAppointment[]> {                                

        if (!user) throw new Error("Request does not hold the JWT payload.");        // NEEDS ERROR HANDLING. IS THIS NECESSARY??   

        const appointments: Appointment[] = await this.userService.addAppointment(
            user.email, 
            dto.serviceID, 
            dto.startDate, 
            dto.staffID
        );

        const safeAppointments: SafeAppointment[] = appointments.map(({user, ...data}) => data);
        return safeAppointments;

    }

    // Get all appointments

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    @Get('appointments')
    async getAppointments(
        @GetUser() user: SafeUser
    ): Promise<SafeAppointment[]> {

        const appointments: Appointment[] = await this.userService.getAppointments(user.email);
        const safeAppointments: SafeAppointment[] = appointments.map(({user, ...data}) => data);
        return safeAppointments;

    }

    // Get a limited number (id) of appointments

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    @Get('appointments/:id')
    async getLimitedAppointments(
        @GetUser() user: SafeUser,
        @Param('id', ParseIntPipe) numAppointments: string
    ): Promise<SafeAppointment[]> {

        const appointments: Appointment[] = await this.userService.getLimitedAppointments(user.email, numAppointments);
        const safeAppointments: SafeAppointment[] = appointments.map(({user, ...data}) => data);
        return safeAppointments;

    }

    // Edit an appointment

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    @Patch('appointments/edit')
    async editAppointment(
        @GetUser() _user: SafeUser, 
        @Body() dto: EditAppointmentDTO
    ): Promise<SafeAppointment> {                                

        if (!_user) throw new Error("Request does not hold the JWT payload.");        // NEEDS ERROR HANDLING. IS THIS NECESSARY??   
        if (!_user.appointments) throw new Error("User does not contain any appointments.");

        const appointment: Appointment = await this.userService.editAppointment(
            _user.appointments, 
            dto
        );

        const { user, ...safeAppointment } = appointment;
        return safeAppointment;

    }

    // Delete an appointment

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard)
    @Delete('appointments/delete')
    async deleteAppointment(
        @GetUser() user: SafeUser, 
        @Body() dto: DeleteAppointmentDTO
    ): Promise<void> {                                

        if (!user) throw new Error("Request does not hold the JWT payload.");        // NEEDS ERROR HANDLING. IS THIS NECESSARY??   
        
        const appointmentIndex: number = dto.appointmentIndex;
        
        await this.userService.deleteAppointment(
            user.email,
            appointmentIndex 
        );

        return;

    }

}