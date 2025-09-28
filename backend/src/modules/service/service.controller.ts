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

@UseGuards(JwtGuard)
@Controller("api/service")
export class ServiceController {
	constructor(private serviceService: ServiceService) {}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get()
	async getServices(): Promise<GetServiceDTO[]> {
		return await this.serviceService.getServices();
	}
}
