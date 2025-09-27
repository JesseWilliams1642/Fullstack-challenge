import { IsDate, IsNotEmpty, IsUUID } from "class-validator";

export class CreateAppointmentDTO {
    
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