import { Module } from "@nestjs/common";
import { StaffProvider } from "./staff.provider";
import { DatabaseModule } from "../database/database.module";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";

@Module({
	imports: [DatabaseModule],
	controllers: [StaffController],
	providers: [StaffService, StaffProvider],
	exports: [StaffProvider, StaffService],
})
export class StaffModule {}
