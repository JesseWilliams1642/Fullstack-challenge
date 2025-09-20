import { Module } from "@nestjs/common";
import { AppointmentProvider } from "./appointment.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [],
    providers: [
        AppointmentProvider
    ],
    exports: [AppointmentProvider]
})
export class AppointmentModule {};