import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class GetStaffDTO {
    
    @IsUUID(undefined, { message: "Staff ID must be a valid UUID." })
    @IsNotEmpty({ message: "Staff ID can not be empty." })
    id!: string;
    
    @IsString({ message: "Name must be a string." })
    @IsNotEmpty({ message: "Name can not be empty." })
    name!: string;

}