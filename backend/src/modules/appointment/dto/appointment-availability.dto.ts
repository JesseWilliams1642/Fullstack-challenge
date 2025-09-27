import { IsNotEmpty, IsUUID } from "class-validator";

export class getAppointmentAvailabilityDTO {

    @IsUUID(undefined, { message: "Service ID must be a valid UUID." })
    @IsNotEmpty({ message: "Service ID can not be empty." })
    serviceID!: string;

    @IsUUID(undefined, { message: "Staff ID must be a valid UUID." })
    @IsNotEmpty({ message: "Staff ID can not be empty." })
    staffID!: string;

}