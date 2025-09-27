import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { DatabaseModule } from "../database/database.module";
import { UserProvider } from "./user.provider";
import { AppointmentModule } from "../appointment/appointment.module";
import { StaffModule } from "../staff/staff.module";
import { ServiceModule } from "../service/service.module";

@Module({
    imports: [
        DatabaseModule, 
        AppointmentModule,
        StaffModule,
        ServiceModule
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserProvider
    ],
    exports: [UserProvider]
})
export class UserModule {};