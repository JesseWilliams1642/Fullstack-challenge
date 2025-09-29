import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Query,
	UseGuards,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { JwtGuard } from "../../common/guards";
import { GetAppointmentAvailabilityDTO } from "./dto";
import { APIResponse } from "src/common/types";

@UseGuards(JwtGuard)
@Controller("api/appointment")
export class AppointmentController {
	constructor(private appointmentService: AppointmentService) {}

	// For a specific service and staff member, get the available dates
	// the user can select from

	@HttpCode(HttpStatus.OK)
	@Get("availability")
	async getAppointments(
		@Query() dto: GetAppointmentAvailabilityDTO,
	): Promise<APIResponse<string[]>> {
		return {
			data: await this.appointmentService.getAvailabilities(
						dto.serviceID,
						new Date(dto.date),
						dto.staffID,
					),
			error: null
		}
	}
}
