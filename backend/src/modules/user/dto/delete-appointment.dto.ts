import { IsInt, IsNotEmpty, Min } from "class-validator";

export class DeleteAppointmentDTO {
    
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    appointmentIndex!: number;

}