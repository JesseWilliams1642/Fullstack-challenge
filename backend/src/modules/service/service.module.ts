import { Module } from "@nestjs/common";
import { ServiceProvider } from "./service.provider";
import { DatabaseModule } from "../database/database.module";
import { ServiceController } from "./service.controller";
import { ServiceService } from "./service.service";

@Module({
    imports: [DatabaseModule],
    controllers: [ServiceController],
    providers: [
        ServiceService,
        ServiceProvider
    ],
    exports: [ServiceProvider, ServiceService]
})
export class ServiceModule {};