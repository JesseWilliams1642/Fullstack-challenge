import { IsDate, IsNotEmpty, IsUUID } from "class-validator";

export class CreateAppointmentDTO {
    
    @IsUUID()
    @IsNotEmpty()
    serviceID!: string;

    @IsDate()
    @IsNotEmpty()
    startDate!: Date;

    @IsUUID()
    @IsNotEmpty()
    staffID!: string;

}