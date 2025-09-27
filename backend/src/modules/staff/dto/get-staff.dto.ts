import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class GetStaffDTO {
    
    @IsUUID()
    @IsNotEmpty()
    id!: string;
    
    @IsString()
    @IsNotEmpty()
    name!: string;

}