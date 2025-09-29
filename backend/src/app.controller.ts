import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { GetServiceDTO } from "./modules/service/dto";
import { APIResponse } from "./common/types";

@Controller("api")
export class AppController {
	constructor(private readonly appService: AppService) {}

	// Get all services to display on front page

	@Get()
	async getServices(): Promise<APIResponse<GetServiceDTO[]>> {
		return { data: await this.appService.getService(), error: null };
	}
}
