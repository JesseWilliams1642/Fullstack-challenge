import {
	Controller,
	UseGuards,
	HttpStatus,
	HttpCode,
	Get,
} from "@nestjs/common";
import { JwtGuard } from "../../common/guards";
import { StaffService } from "./staff.service";
import { GetStaffDTO } from "./dto";
import { APIResponse } from "src/common/types";

@UseGuards(JwtGuard)
@Controller("api/staff")
export class StaffController {
	constructor(private staffService: StaffService) {}

	// Get a list of all available staff members

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get()
	async getStaff(): Promise<APIResponse<GetStaffDTO[]>> {
		return {
			data: await this.staffService.getStaff(),
			error: null,
		};
	}
}
