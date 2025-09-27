import { IsDate, IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";

export class EditAppointmentDTO {
    
    @IsInt({ message: "Appointment Index must be an integer." })
    @IsNotEmpty({ message: "Appointment Index can not be empty." })
    @Min(0, { message: "Appointment Index must be zero or greater." })
    appointmentIndex: number;

    @IsUUID(undefined, { message: "Service ID must be a valid UUID." })
    @IsNotEmpty({ message: "Service ID can not be empty." })
    serviceID!: string;

    @IsDate({ message: "Start Date must be a valid Date." })
    @IsNotEmpty({ message: "Start Date can not be empty." })
    startDate!: Date;

    @IsUUID(undefined, { message: "Staff ID must be a valid UUID." })
    @IsNotEmpty({ message: "Staff ID can not be empty." })
    staffID!: string;

}