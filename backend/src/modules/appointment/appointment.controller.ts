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
import { APIResponse, type SafeUser } from "../../common/types";
import { GetUser } from "../../common/decorators";

@UseGuards(JwtGuard)
@Controller("api/appointment")
export class AppointmentController {
	constructor(private appointmentService: AppointmentService) {}

	// For a specific service and staff member, get the available dates
	// the user can select from

	@HttpCode(HttpStatus.OK)
	@Get("availability")
	async getAppointments(
		@GetUser() user: SafeUser,
		@Query() dto: GetAppointmentAvailabilityDTO,
	): Promise<APIResponse<string[]>> {
		return {
			data: await this.appointmentService.getAvailabilities(
				new Date(dto.date),
				user.id,
				dto.serviceID,
				dto.staffID,
				dto.appointmentID ?? null,
			),
			error: null,
		};
	}
}
