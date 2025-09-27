import { IsDate, IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";

export class EditAppointmentDTO {
    
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    appointmentIndex: number;

    @IsUUID()
    @IsNotEmpty()
    serviceID?: string;

    @IsDate()
    @IsNotEmpty()
    startDate?: Date;

    @IsUUID()
    @IsNotEmpty()
    staffID?: string;

}