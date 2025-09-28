import { Injectable } from "@nestjs/common";
import { ServiceService } from "./modules/service/service.service";
import { GetServiceDTO } from "./modules/service/dto";

@Injectable()
export class AppService {
	constructor(private readonly serviceService: ServiceService) {}

	// Retrieve all services and return them

	async getService(): Promise<GetServiceDTO[]> {
		return await this.serviceService.getServices();
	}
}
