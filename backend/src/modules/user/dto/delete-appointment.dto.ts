import { IsInt, IsNotEmpty, Min } from "class-validator";

export class DeleteAppointmentDTO {
    
    @IsInt({ message: "Appointment Index must be an integer." })
    @IsNotEmpty({ message: "Appointment Index can not be empty." })
    @Min(0, { message: "Appointment Index must be zero or greater." })
    appointmentIndex!: number;

}