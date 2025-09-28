import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	UseGuards,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { JwtGuard } from "../../common/guards";
import { getAppointmentAvailabilityDTO } from "./dto";

@UseGuards(JwtGuard)
@Controller("api/appointment")
export class AppointmentController {
	constructor(private appointmentService: AppointmentService) {}

	// For a specific service and staff member, get the available dates
	// the user can select from

	@HttpCode(HttpStatus.OK)
	@Get("availability")
	async getAppointments(
		@Body() dto: getAppointmentAvailabilityDTO,
	): Promise<Date[]> {
		return await this.appointmentService.getAvailabilities(
			dto.serviceID,
			new Date(dto.date),
			dto.staffID,
		);
	}
}
