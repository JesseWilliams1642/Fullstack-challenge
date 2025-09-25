import { Module } from "@nestjs/common";
import { ServiceProvider } from "./service.provider";
import { DatabaseModule } from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [],
    providers: [
        ServiceProvider
    ],
    exports: [ServiceProvider]
})
export class ServiceModule {};