import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DatabaseModule } from "./modules/database/database.module";
import { AppointmentModule } from "./modules/appointment/appointment.module";
import { ServiceModule } from "./modules/service/service.module";
import { StaffModule } from "./modules/staff/staff.module";

@Module({
	imports: [
		UserModule,
		AppointmentModule,
		ServiceModule,
		StaffModule,
		AuthModule,
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
