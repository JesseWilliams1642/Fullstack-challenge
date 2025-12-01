import { forwardRef, Module } from "@nestjs/common";
import { AppointmentProvider } from "./appointment.provider";
import { DatabaseModule } from "../database/database.module";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { StaffModule } from "../staff/staff.module";
import { ServiceModule } from "../service/service.module";
import { UserModule } from "../user/user.module";

@Module({
	imports: [
		DatabaseModule,
		StaffModule,
		ServiceModule,
		forwardRef(() => UserModule), // Required to stop cyclical importing
	],
	controllers: [AppointmentController],
	providers: [AppointmentService, AppointmentProvider],
	exports: [AppointmentProvider, AppointmentService],
})
export class AppointmentModule {}
