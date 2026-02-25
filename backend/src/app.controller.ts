import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { GetServiceDTO } from "./modules/service/dto";
import { APIResponse, HealthResponse } from "./common/types";

@Controller("api")
export class AppController {
	constructor(private readonly appService: AppService) {}

	// Get all services to display on front page
	@Get()
	async getServices(): Promise<APIResponse<GetServiceDTO[]>> {
		return { data: await this.appService.getServices(), error: null };
	}

	// Health check, to start frontend once backend is loaded
	@Get("/health")
	async healthCheck(): Promise<HealthResponse> {
		return { status: "ok" };
	}
}
