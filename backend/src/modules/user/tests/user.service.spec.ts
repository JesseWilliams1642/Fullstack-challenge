import { Service } from "../../service/service.entity";
import { UserService } from "../user.service";
import { Staff } from "../../staff/staff.entity";
import { User } from "../user.entity";
import { Appointment } from "../../appointment/appointment.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentService } from "../../appointment/appointment.service";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { EditAppointmentDTO } from "../dto";

describe("UserService", () => {
    let service: UserService;
    let mockAppointmentRepository: jest.Mocked<any>;
    let mockUserRepository: jest.Mocked<any>;
    let mockServiceRepository: jest.Mocked<any>;
    let mockStaffRepository: jest.Mocked<any>;
    let mockAppointmentService: jest.Mocked<any>;

    let mockService: Service;
    let mockService2: Service;
    let mockStaff: Staff;
    let mockStaff2: Staff;
    let mockUser: User;
    let mockUser2: User;
    let mockAppointment: Appointment;
    let mockAppointment2: Appointment;

    beforeEach(async () => {
        mockAppointmentRepository = {
            save: jest.fn(),
            delete: jest.fn(),
        };

        mockStaffRepository = {
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
        };

        mockUserRepository = {
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
        };

        mockServiceRepository = {
            findOneBy: jest.fn(),
        };

        mockAppointmentService = {
            checkAppointmentAvailability: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: "APPOINTMENT_REPOSITORY",
                    useValue: mockAppointmentRepository,
                },
                {
                    provide: "USER_REPOSITORY",
                    useValue: mockUserRepository,
                },
                {
                    provide: "SERVICE_REPOSITORY",
                    useValue: mockServiceRepository,
                },
                {
                    provide: "STAFF_REPOSITORY",
                    useValue: mockStaffRepository,
                },
                {
                    provide: AppointmentService,
                    useValue: mockAppointmentService
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);

        // Create mock accounts, reset each run to prevent any changes between tests
        mockService = {
            id: "550e8400-e29b-41d4-a716-446655440000",
            serviceName: "Haircut",
            serviceDuration: { years: 0, months: 0, days: 0, hours: 0, minutes: 30, seconds: 0 },
            serviceDescription: "A basic haircut",
            serviceImage: "https://example.com/haircut.jpg",
        };

        mockService2 = {
            id: "550e8400-e29b-41d4-a716-446655440001",
            serviceName: "Shave",
            serviceDuration: { years: 0, months: 0, days: 0, hours: 0, minutes: 15, seconds: 0 },
            serviceDescription: "A basic shave",
            serviceImage: "https://example.com/shave.jpg",
        }

        mockStaff = {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Jesse",
            daysWorking: [true, true, true, true, true, false, false],
            startTime: { years: 0, months: 0, days: 0, hours: 9, minutes: 0, seconds: 0 },
            shiftDuration: { years: 0, months: 0, days: 0, hours: 8, minutes: 0, seconds: 0 },
            breakTime: { years: 0, months: 0, days: 0, hours: 12, minutes: 0, seconds: 0 },
            breakDuration: { years: 0, months: 0, days: 0, hours: 1, minutes: 0, seconds: 0 },
            bufferPeriod: { years: 0, months: 0, days: 0, hours: 0, minutes: 15, seconds: 0 },
            appointments: []
        };

        mockStaff2 = {
            id: "850e8400-e29b-41d4-a716-446655440000",
            name: "John",
            daysWorking: [true, true, true, true, true, false, false],
            startTime: { years: 0, months: 0, days: 0, hours: 9, minutes: 0, seconds: 0 },
            shiftDuration: { years: 0, months: 0, days: 0, hours: 8, minutes: 0, seconds: 0 },
            breakTime: { years: 0, months: 0, days: 0, hours: 12, minutes: 0, seconds: 0 },
            breakDuration: { years: 0, months: 0, days: 0, hours: 1, minutes: 0, seconds: 0 },
            bufferPeriod: { years: 0, months: 0, days: 0, hours: 0, minutes: 15, seconds: 0 },
            appointments: []
        };

        mockUser = {
            id: "550e8400-e29b-41d4-a716-446655440000",
            email: "test@example.com",
            name: "John Doe",
            hashedPassword: "hashedpassword",
            appointments: [],
        };

        mockUser2 = {
            id: "550e8400-e29b-41d4-a716-446655440001",
            email: "test2@example.com",
            name: "Jane Doe",
            hashedPassword: "hashedpassword",
            appointments: [],
        };

        // Generic appointment
        mockAppointment = {
            id: "550e8400-e29b-41d4-a716-446655440000",
            startTimestamp: new Date(2001, 0, 1, 10, 0, 0), // 2001-01-01 at 10:00 AM local time
            service: mockService,
            user: mockUser,
            staff: mockStaff,
        };

        // To test for overlap between user appointments
        mockAppointment2 = {
            id: "550e8400-e29b-41d4-a716-446655440003",
            startTimestamp: new Date(2002, 0, 1, 10, 15, 0), // 2001-01-01 at 10:15 AM local time
            service: mockService,
            user: mockUser2,
            staff: mockStaff,
        };
        mockUser.appointments = [mockAppointment, mockAppointment2];
        mockStaff.appointments = [mockAppointment];

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addAppointment", () => {

        it("should save an appointment successfully, returning the appointment in the correct format", async () => {
            
            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

            const result = await service.addAppointment(mockUser.email, mockService.id, new Date(), mockStaff.id);

            expect(result).toHaveProperty("id", mockAppointment.id);
            expect(typeof result.id).toEqual("string");
            expect(result).toHaveProperty("startTimestamp", mockAppointment.startTimestamp);
            expect(result.startTimestamp).toBeInstanceOf(Date);
            expect(result).toHaveProperty("service", mockService);
            expect(result.service).toBeInstanceOf(Object);
            expect(result).toHaveProperty("user", mockUser);
            expect(result.user).toBeInstanceOf(Object);
            expect(result).toHaveProperty("staff", mockStaff);
            expect(result.staff).toBeInstanceOf(Object);

            expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(1);

        });

        it("should throw an error if the user can not be found", async () => {

            mockUserRepository.findOneBy.mockResolvedValue();
            mockServiceRepository.findOneBy.mockResolvedValue(mockService);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            await expect(
                service.addAppointment(mockUser.email, mockService.id, new Date(), mockStaff.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the service can not be found", async () => {

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue();
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

            const error = new NotFoundException(`Service could not be found for id ${mockService.id}.`);
            await expect(
                service.addAppointment(mockUser.email, mockService.id, new Date(), mockStaff.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the staff could not be found", async () => {

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService);
            mockStaffRepository.findOneBy.mockResolvedValue();
            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

            const error = new NotFoundException(`Staff could not be found for id ${mockStaff.id}.`);
            await expect(
                service.addAppointment(mockUser.email, mockService.id, new Date(), mockStaff.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the appointment is unavailable", async () => {

            mockUserRepository.findOneBy.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(false);
            mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

            const error = new BadRequestException("Appointment is unavailable.");
            await expect(
                service.addAppointment(mockUser.email, mockService.id, new Date(), mockStaff.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

    });

    describe("getAppointments", () => {

        it("should return an array of appointments with the expected format", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.getAppointments(mockUser.email);

            expect(result.length).toStrictEqual(2);

            // First element of the array should be the latest time (mockAppointment2)
            expect(result[0]).toHaveProperty("id", mockAppointment.id);    
            expect(typeof result[0].id).toEqual("string");
            expect(result[0]).toHaveProperty("startTimestamp", mockAppointment.startTimestamp);
            expect(result[0].startTimestamp).toBeInstanceOf(Date);
            expect(result[0]).toHaveProperty("service", mockService);
            expect(result[0].service).toBeInstanceOf(Object);
            expect(result[0]).toHaveProperty("user", mockUser);    
            expect(result[0].user).toBeInstanceOf(Object);
            expect(result[0]).toHaveProperty("staff", mockStaff);
            expect(result[0].staff).toBeInstanceOf(Object);

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);


        });

        it("should return an empty array if the user has no appointments", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser2);
            const result = await service.getAppointments(mockUser2.email);

            expect(result.length).toStrictEqual(0);

        });

        it("should throw an error if the user can not be found", async () => {

            mockUserRepository.findOne.mockResolvedValue();
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);

            await expect(
                service.getAppointments(mockUser.email),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
        });

    });
    
    describe("getLimitedAppointments", () => {

        it("should return an numAppointments-length array of appointments in the expected format", async () => {

            jest.spyOn(service, 'getAppointments').mockResolvedValue(mockUser.appointments ?? []);
            const result = await service.getLimitedAppointments(mockUser.email, "2");

            expect(result.length).toStrictEqual(2);

            expect(result[0]).toHaveProperty("id", mockAppointment.id);    
            expect(typeof result[0].id).toEqual("string");
            expect(result[0]).toHaveProperty("startTimestamp", mockAppointment.startTimestamp);
            expect(result[0].startTimestamp).toBeInstanceOf(Date);
            expect(result[0]).toHaveProperty("service", mockService);
            expect(result[0].service).toBeInstanceOf(Object);
            expect(result[0]).toHaveProperty("user", mockUser);    
            expect(result[0].user).toBeInstanceOf(Object);
            expect(result[0]).toHaveProperty("staff", mockStaff);
            expect(result[0].staff).toBeInstanceOf(Object);

            expect(service.getAppointments).toHaveBeenCalledTimes(1);

        });

        it("should return all appointments if the total # of appointments is less than numAppointments", async () => {

            jest.spyOn(service, 'getAppointments').mockResolvedValue(mockUser.appointments ?? []);
            const result = await service.getLimitedAppointments(mockUser.email, "5");

            expect(result.length).toStrictEqual(2);
            expect(result).toStrictEqual([mockAppointment, mockAppointment2]);

            expect(service.getAppointments).toHaveBeenCalledTimes(1);

        });

        it("should return an empty array if the user has no appointments", async () => {

            jest.spyOn(service, 'getAppointments').mockResolvedValue(mockUser2.appointments ?? []);
            const result = await service.getLimitedAppointments(mockUser2.email, "2");

            expect(result.length).toStrictEqual(0);
            expect(service.getAppointments).toHaveBeenCalledTimes(1);

        });

        it("should throw an error if numAppointments is negative", async () => {

            jest.spyOn(service, 'getAppointments').mockResolvedValue(mockUser.appointments ?? []);
            const error = new BadRequestException("Id should be a positive integer.");

            await expect(
                service.getLimitedAppointments(mockUser.email, "-1"),
            ).rejects.toThrow(
                error,
            );

            expect(service.getAppointments).toHaveBeenCalledTimes(0);

        });

    });

    describe("editAppointment", () => {

        it("should return the successfully changed appointment, in the expected format", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const result = await service.editAppointment(mockUser.email, mockEditAppointmentDTO);

            expect(result).toHaveProperty("id", mockAppointment.id);    
            expect(typeof result.id).toEqual("string");
            expect(result).toHaveProperty("startTimestamp", new Date(mockEditAppointmentDTO.startDate));
            expect(result.startTimestamp).toBeInstanceOf(Date);
            expect(result).toHaveProperty("service", mockService2);
            expect(result.service).toBeInstanceOf(Object);
            expect(result).toHaveProperty("user", mockUser);    
            expect(result.user).toBeInstanceOf(Object);
            expect(result).toHaveProperty("staff", mockStaff2);
            expect(result.staff).toBeInstanceOf(Object);
            
            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(1);

        });

        it("should throw an error if the user can not be found", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue();
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            await expect(
                service.editAppointment(mockUser.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the user does not have any appointments", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser2);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new BadRequestException("User does not contain any appointments.");
            await expect(
                service.editAppointment(mockUser2.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the appointment is not owned by the user", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: "TESTTESTTEST",
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new ForbiddenException("Appointment is not owned by the User");
            await expect(
                service.editAppointment(mockUser.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the to-be-changed service is not found", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(null);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new NotFoundException(
					`Service could not be found for id ${mockService2.id}.`,
				);
            await expect(
                service.editAppointment(mockUser.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the to-be-changed staff is not found", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(null);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(true);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new NotFoundException(`Staff could not be found for id ${mockStaff2.id}.`);
            await expect(
                service.editAppointment(mockUser.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the appointment is unavailable", async () => {

            const mockEditAppointmentDTO: EditAppointmentDTO = {
                appointmentID: mockAppointment.id,
                serviceID: mockService2.id,
                startDate: "03/25/2015",
                staffID: mockStaff2.id
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockServiceRepository.findOneBy.mockResolvedValue(mockService2);
            mockStaffRepository.findOneBy.mockResolvedValue(mockStaff2);

            mockAppointmentService.checkAppointmentAvailability.mockResolvedValue(false);
            mockAppointmentRepository.save.mockImplementation((...args) => args[0]); // Identity function

            const error = new BadRequestException("Appointment is unavailable.");
            await expect(
                service.editAppointment(mockUser.email, mockEditAppointmentDTO),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
            expect(mockAppointmentService.checkAppointmentAvailability).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.save).toHaveBeenCalledTimes(0);

        });

    });

    describe("deleteAppointment", () => {

        it("should delete the appointment successfully without errors thrown", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockStaff);
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            // Check that it does not throw an error (as no returned var)
            await expect(
                service.deleteAppointment(mockUser.email, mockAppointment.id),
            ).resolves.not.toThrow();

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(1);

        });

        it("should throw an error if the user can not be found", async () => {

            mockUserRepository.findOne.mockResolvedValue();
            mockStaffRepository.findOne.mockResolvedValue(mockStaff);
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            await expect(
                service.deleteAppointment(mockUser.email, mockAppointment.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(0);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);
            
        });

        it("should throw an error if the user does not have any appointments", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser2);
            mockStaffRepository.findOne.mockResolvedValue(mockStaff);
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            const error = new BadRequestException("User does not contain any appointments.");
            await expect(
                service.deleteAppointment(mockUser2.email, mockAppointment.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(0);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the appointment is not owned by the user", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockStaff);
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            const error = new ForbiddenException("Appointment is not owned by the User");
            await expect(
                service.deleteAppointment(mockUser.email, "TESTTESTTEST"),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(0);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the staff that is a part of the appointment can not be found", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue();
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            const error = new NotFoundException(
				`Staff could not be found for id ${mockAppointment.staff.id}.`,
			);
            await expect(
                service.deleteAppointment(mockUser.email, mockAppointment.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);

        });

        it("should throw an error if the staff that is a part of the appointment has no appointments", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockStaffRepository.findOne.mockResolvedValue(mockStaff2);
            mockUserRepository.save.mockResolvedValue();
            mockStaffRepository.save.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();

            const error = new NotFoundException("Staff does not contain any appointments.");
            await expect(
                service.deleteAppointment(mockUser.email, mockAppointment.id),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockStaffRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
            expect(mockStaffRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);

        });

    });

    describe("deleteAccount", () => {

        it("should delete the user account without a thrown error", async () => {

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockAppointmentRepository.delete.mockResolvedValue();
            mockUserRepository.delete.mockResolvedValue();

            // Check that it does not throw an error (as no returned var)
            await expect(
                service.deleteAccount(mockUser.email),
            ).resolves.not.toThrow();

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(1);
            expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);

        });

        it("should throw an error if the user can not be found", async () => {

            mockUserRepository.findOne.mockResolvedValue();
            mockAppointmentRepository.delete.mockResolvedValue();
            mockUserRepository.delete.mockResolvedValue();

            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            await expect(
                service.deleteAccount(mockUser.email),
            ).rejects.toThrow(
                error,
            );

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockAppointmentRepository.delete).toHaveBeenCalledTimes(0);
            expect(mockUserRepository.delete).toHaveBeenCalledTimes(0);

        });

    });

});