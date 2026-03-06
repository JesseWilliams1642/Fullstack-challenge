import { IsNotEmpty, IsString, IsUrl, IsUUID } from "class-validator";
import { PostgresInterval } from "../../../common/types";

export class GetServiceDTO {
	@IsUUID()
	@IsNotEmpty()
	id!: string;

	@IsString()
	@IsNotEmpty()
	serviceName!: string;

	@IsString()
	@IsNotEmpty()
	serviceDuration!: string | PostgresInterval;

	@IsString()
	@IsNotEmpty()
	serviceDescription!: string;

	@IsUrl()
	@IsNotEmpty()
	serviceImage!: string;
}
