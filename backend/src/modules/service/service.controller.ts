import {
	Controller,
	UseGuards,
	HttpStatus,
	HttpCode,
	Get,
} from "@nestjs/common";
import { JwtGuard } from "../../common/guards";
import { ServiceService } from "./service.service";
import { GetServiceDTO } from "./dto";
import { APIResponse } from "src/common/types";

@UseGuards(JwtGuard)
@Controller("api/service")
export class ServiceController {
	constructor(private serviceService: ServiceService) {}

	// Get list of available services

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get()
	async getServices(): Promise<APIResponse<GetServiceDTO[]>> {
		return {
			data: await this.serviceService.getServices(),
			error: null
		};
	}
}
