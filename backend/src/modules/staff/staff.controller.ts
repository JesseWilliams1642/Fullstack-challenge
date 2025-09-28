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

@UseGuards(JwtGuard)
@Controller("api/staff")
export class StaffController {
	constructor(private staffService: StaffService) {}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtGuard)
	@Get()
	async getStaff(): Promise<GetStaffDTO[]> {
		return await this.staffService.getStaff();
	}
}
