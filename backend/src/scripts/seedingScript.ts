import { NestFactory } from "@nestjs/core";
import { INestApplicationContext } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { AppModule } from "../app.module";
import { Staff } from "../modules/staff/staff.entity";
import { User } from "../modules/user/user.entity";
import { Service } from "../modules/service/service.entity";
import { hashPassword } from "../common/utils/hash";


async function bootstrap() {

    const app: INestApplicationContext = await NestFactory.createApplicationContext(AppModule);
    const dataSource: DataSource = app.get(DataSource);

    // Get all the relevant repositories

    const userRepository: Repository<User> = dataSource.getRepository(User);
    const serviceRepository: Repository<Service> = dataSource.getRepository(Service);
    const staffRepository: Repository<Staff> = dataSource.getRepository(Staff);

    // Seed in User data

    const userList: User[] = [];

    userList.push(userRepository.create({
        name: "Customer 1",
        email: "customer1@sampleassist.com",
        hashedPassword: await hashPassword("password@123"),
        phoneNumber: "0123456789"
    }));

    userList.push(userRepository.create({
        name: "Customer 2",
        email: "customer2@sampleassist.com",
        hashedPassword: await hashPassword("password@123"),
        phoneNumber: "0123456789"
    }));

    userList.push(userRepository.create({
        name: "Admin",
        email: "admin@sampleassist.com",
        hashedPassword: await hashPassword("admin@123"),
        phoneNumber: "0280068111"
    }));

    await userRepository.insert(userList);
    console.log("✅ Test users inserted.");

    // Seed in service data

    const serviceList: Service[] = [];

    serviceList.push(serviceRepository.create({
        serviceName: "Haircut",
        serviceDuration: "30m",
        serviceDescription: ""
    }));

    serviceList.push(serviceRepository.create({
        serviceName: "Hair Styling",
        serviceDuration: "45m",
        serviceDescription: ""
    }));

    serviceList.push(serviceRepository.create({
        serviceName: "Hair Colouring",
        serviceDuration: "90m",
        serviceDescription: ""
    }));

    serviceList.push(serviceRepository.create({
        serviceName: "Consultation",
        serviceDuration: "15m",
        serviceDescription: ""
    }));

    serviceList.push(serviceRepository.create({
        serviceName: "Deep Conditioning Treatment",
        serviceDuration: "60m",
        serviceDescription: ""
    }));

    await serviceRepository.insert(serviceList);
    console.log("✅ Test services inserted.");

    // Seed in staff data

    const staff: Staff = staffRepository.create({
        name: "Jesse",
        daysWorking: [true,true,true,true,true,false,false],
        startTime: "09:00:00",
        shiftDuration: "8h",
        breakTime: "12:00:00",
        breakDuration: "1h",
        bufferPeriod: "15m"
    });

    await staffRepository.insert(staff);
    console.log("✅ Test staff inserted.");


}

bootstrap();









