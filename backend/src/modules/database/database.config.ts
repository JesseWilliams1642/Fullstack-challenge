import { DataSource } from "typeorm";
import { User } from "../user/user.entity";
import { Appointment } from "../appointment/appointment.entity";
import { Service } from "../service/service.entity";
import { Staff } from "../staff/staff.entity";
import { InternalServerErrorException } from "@nestjs/common";

// DataSource used for migrations and repositories

const port: number = Number(process.env.DB_PORT) || 5432;
if (isNaN(port))
	throw new InternalServerErrorException("Database port is not a valid number!");

const dataSource = new DataSource({
	type: "postgres",
	host: "db",			// Must match service name in docker-compose.yml
	port: port,
	username: process.env.DB_USERNAME || "postgres",
	password: process.env.DB_PASSWORD || "password",
	database: process.env.DB_NAME || "db",
	entities: [User, Appointment, Service, Staff],
	migrations: ["dist/src/migrations/**/*.{js,ts}"],
	synchronize: false,
	logging: (process.env.DB_LOGGING as unknown as boolean) || false,
});

export default dataSource;
