import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
} from "class-validator";

export class RegisterDTO {
	@IsEmail(undefined, { message: "Invalid email." })
	@IsNotEmpty({ message: "Email can not be empty." })
	email!: string;

	@IsString({ message: "Password must be a string." })
	@IsNotEmpty({ message: "Password can not be empty." })
	@MinLength(8, { message: "Password must be 8 characters or more." })
	password!: string;

	@IsString({ message: "Name must be a string." })
	@IsNotEmpty({ message: "Name can not be empty." })
	name!: string;
}
