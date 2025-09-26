import { Module } from "@nestjs/common";
import { AppointmentProvider } from "./appointment.provider";
import { DatabaseModule } from "../database/database.module";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";

@Module({
    imports: [DatabaseModule],
    controllers: [AppointmentController],
    providers: [
        AppointmentService,
        AppointmentProvider
    ],
    exports: [AppointmentProvider, AppointmentService]
})
export class AppointmentModule {};