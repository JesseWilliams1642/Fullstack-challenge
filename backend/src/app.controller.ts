import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { GetServiceDTO } from "./modules/service/dto";

@Controller("api")
export class AppController {
	constructor(private readonly appService: AppService) {}

	// Get all services to display on front page

	@Get()
	async getServices(): Promise<GetServiceDTO[]> {
		return await this.appService.getService();
	}
}
