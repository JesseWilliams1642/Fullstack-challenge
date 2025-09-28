import { Module } from "@nestjs/common";
import { AppointmentProvider } from "./appointment.provider";
import { DatabaseModule } from "../database/database.module";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { StaffModule } from "../staff/staff.module";
import { ServiceModule } from "../service/service.module";

@Module({
	imports: [DatabaseModule, StaffModule, ServiceModule],
	controllers: [AppointmentController],
	providers: [AppointmentService, AppointmentProvider],
	exports: [AppointmentProvider, AppointmentService],
})
export class AppointmentModule {}
