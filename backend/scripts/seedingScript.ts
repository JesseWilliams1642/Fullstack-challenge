import { NestFactory } from "@nestjs/core";
import { INestApplicationContext } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { AppModule } from "../src/app.module";
import { Staff } from "../src/modules/staff/staff.entity";
import { User } from "../src/modules/user/user.entity";
import { Service } from "../src/modules/service/service.entity";
import { hashPassword } from "../src/common/utils/hash";

async function bootstrap() {
	const app: INestApplicationContext =
		await NestFactory.createApplicationContext(AppModule);
	const dataSource: DataSource = app.get<DataSource>("DATA_SOURCE");

	// Get all the relevant repositories

	const userRepository: Repository<User> = dataSource.getRepository(User);
	const serviceRepository: Repository<Service> =
		dataSource.getRepository(Service);
	const staffRepository: Repository<Staff> = dataSource.getRepository(Staff);

	// Seed in User data

	const userList: User[] = [];

	userList.push(
		userRepository.create({
			name: "Customer 1",
			email: "customer1@sampleassist.com",
			hashedPassword: await hashPassword("password@123")
		}),
	);

	userList.push(
		userRepository.create({
			name: "Customer 2",
			email: "customer2@sampleassist.com",
			hashedPassword: await hashPassword("password@123")
		}),
	);

	userList.push(
		userRepository.create({
			name: "Admin",
			email: "admin@sampleassist.com",
			hashedPassword: await hashPassword("admin@123")
		}),
	);

	await userRepository.insert(userList);
	console.log("✅ Test users inserted.");

	// Seed in service data

	const serviceList: Service[] = [];

	serviceList.push(
		serviceRepository.create({
			serviceName: "Haircut",
			serviceDuration: "30m",
			serviceDescription: "Professional cuts for personal and business",
			serviceImage: "https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800"
		}),
	);

	serviceList.push(
		serviceRepository.create({
			serviceName: "Hair Styling",
			serviceDuration: "45m",
			serviceDescription: "Professional styling for special occasions",
			serviceImage: "https://images.pexels.com/photos/3992865/pexels-photo-3992865.jpeg?auto=compress&cs=tinysrgb&w=800"
		}),
	);

	serviceList.push(
		serviceRepository.create({
			serviceName: "Hair Colouring",
			serviceDuration: "90m",
			serviceDescription: "Indepth consultation to determine what is best for your hair",
			serviceImage: "https://images.pexels.com/photos/3992855/pexels-photo-3992855.jpeg?auto=compress&cs=tinysrgb&w=800"
		}),
	);

	serviceList.push(
		serviceRepository.create({
			serviceName: "Consultation",
			serviceDuration: "15m",
			serviceDescription: "Hair dying and natural-looking highlights with expert technique",
			serviceImage: "https://images.pexels.com/photos/3992871/pexels-photo-3992871.jpeg?auto=compress&cs=tinysrgb&w=800"
		}),
	);

	serviceList.push(
		serviceRepository.create({
			serviceName: "Deep Conditioning Treatment",
			serviceDuration: "60m",
			serviceDescription: "Deep conditioning and repair treatment",
			serviceImage: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800"
		}),
	);

	await serviceRepository.insert(serviceList);
	console.log("✅ Test services inserted.");

	// Seed in staff data

	const staff: Staff = staffRepository.create({
		name: "Jesse",
		daysWorking: [true, true, true, true, true, false, false],
		startTime: "9h",
		shiftDuration: "8h",
		breakTime: "12h",
		breakDuration: "1h",
		bufferPeriod: "15m",
	});

	await staffRepository.insert(staff);
	console.log("✅ Test staff inserted.");
}

void bootstrap();
