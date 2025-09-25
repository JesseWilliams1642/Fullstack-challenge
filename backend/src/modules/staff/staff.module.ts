import { Module } from "@nestjs/common";
import { StaffProvider } from "./staff.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [],
    providers: [
        StaffProvider
    ],
    exports: [StaffProvider]
})
export class StaffModule {};