import { IsNotEmpty, IsUUID } from "class-validator";

export class getAppointmentAvailabilityDTO {

    @IsUUID()
    @IsNotEmpty()
    serviceID!: string;

    @IsUUID()
    @IsNotEmpty()
    staffID!: string;

}