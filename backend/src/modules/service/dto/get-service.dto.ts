import { IsNotEmpty, IsString, IsUrl, IsUUID } from "class-validator";

export class GetServiceDTO {
	@IsUUID()
	@IsNotEmpty()
	id!: string;

	@IsString()
	@IsNotEmpty()
	serviceName!: string;

	@IsString()
	@IsNotEmpty()
	serviceDuration!: string;

	@IsString()
	@IsNotEmpty()
	serviceDescription!: string;

	@IsUrl()
	@IsNotEmpty()
	serviceImage!: string;
}
