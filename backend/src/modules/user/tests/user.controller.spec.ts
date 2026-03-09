import { SafeUser } from "src/common/types";
import { UserController } from "../user.controller";
import { UserService } from "../user.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateAppointmentDTO, EditAppointmentDTO } from "../dto";
import { SafeAppointment } from "src/modules/appointment/types";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { Appointment } from "src/modules/appointment/appointment.entity";
import { Service } from "src/modules/service/service.entity";
import { Staff } from "src/modules/staff/staff.entity";
import { dateToStrings } from "src/common/utils";
import { User } from "../user.entity";

describe("UserController", () => {
    let controller: UserController;
    let mockUserService: jest.Mocked<UserService>;

    // Test data
    const mockUser: SafeUser = {
        id: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f0",
        name: "John Doe",
        email: "test@testemail.com",
    };

    const createAppointmentDTO: CreateAppointmentDTO = {
        serviceID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f1",
        startDate: new Date().toISOString(),
        staffID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f2",
    };

    const editAppointmentDTO: EditAppointmentDTO = {
        appointmentID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
        serviceID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f1",
        startDate: new Date().toISOString(),
        staffID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f2",
    };

    const mockService: Service = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		serviceName: "Haircut",
		serviceDuration: { years: 0, months: 0, days: 0, hours: 0, minutes: 30, seconds: 0 },
		serviceDescription: "A basic haircut",
		serviceImage: "https://example.com/haircut.jpg",
	};

	const mockStaff: Staff = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		name: "Jesse",
		daysWorking: [true, true, true, true, true, false, false],
		startTime: { years: 0, months: 0, days: 0, hours: 9, minutes: 0, seconds: 0 },
		shiftDuration: { years: 0, months: 0, days: 0, hours: 8, minutes: 0, seconds: 0 },
		breakTime: { years: 0, months: 0, days: 0, hours: 12, minutes: 0, seconds: 0 },
		breakDuration: { years: 0, months: 0, days: 0, hours: 1, minutes: 0, seconds: 0 },
		bufferPeriod: { years: 0, months: 0, days: 0, hours: 0, minutes: 15, seconds: 0 },
	};

    const mockAppointment1: Appointment = {
        id: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
        user: mockUser as User,
        startTimestamp: new Date(),
        service: mockService,
        staff: mockStaff,
    }

    const mockAppointment2: Appointment = {
        id: "2afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
        user: mockUser as User,
        startTimestamp: new Date(),
        service: mockService,
        staff: mockStaff,
    }

    const mockAppointment3: Appointment = {
        id: "3afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
        user: mockUser as User,
        startTimestamp: new Date(),
        service: mockService,
        staff: mockStaff,
    }

    const mockRequest1 = {
        body: JSON.stringify({
            id: "3afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
        }),
    } as unknown as Request;

    const mockRequest2 = {
        body: JSON.stringify({})
    } as unknown as Request;

    beforeEach(async () => {
        // Must be cast as jest.Mocked<UserService> to satisfy TypeScript type checking for mocked methods
        // Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getServices()
        mockUserService = {
           addAppointment: jest.fn(),
           getAppointments: jest.fn(),
           getLimitedAppointments: jest.fn(),
           editAppointment: jest.fn(),
           deleteAppointment: jest.fn(),
           deleteAccount: jest.fn(),
        } as unknown as jest.Mocked<UserService>;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService],
        })
            .overrideProvider(UserService)
            .useValue(mockUserService)
            .compile();

        controller = module.get<UserController>(UserController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("addAppointment", () => {
        
        it("should return an appointment in the correct format", async () => {
            
            mockUserService.addAppointment.mockResolvedValue(
				mockAppointment1,
			);
            const result = await controller.addAppointment(mockUser, createAppointmentDTO);

            expect(result).toHaveProperty("data");
            expect(result).toHaveProperty("error", null);

            const data = result.data;
            expect(data).toHaveProperty("id", mockAppointment1.id);
            expect(data).toHaveProperty("startTimestamp", mockAppointment1.startTimestamp);
            expect(data).toHaveProperty("dateString", dateToStrings(mockAppointment1.startTimestamp)[0]);
            expect(data).toHaveProperty("timeString", dateToStrings(mockAppointment1.startTimestamp)[1]);
            expect(data).toHaveProperty("serviceID", mockAppointment1.service.id);
            expect(data).toHaveProperty("serviceName", mockAppointment1.service.serviceName);
            expect(data).toHaveProperty("serviceDuration", mockAppointment1.service.serviceDuration);
            expect(data).toHaveProperty("serviceDescription", mockAppointment1.service.serviceDescription);
            expect(data).toHaveProperty("staffID", mockAppointment1.staff.id);
            expect(data).toHaveProperty("staffName", mockAppointment1.staff.name);
            expect(data).toHaveProperty("status", "completed");

        });

        it("should throw an error for an unknown user email", async () => {
            const error = new NotFoundException(`User could not be found for email ${"nothere@email.com"}.`);
            mockUserService.addAppointment.mockRejectedValue(error);
            await expect(
                controller.addAppointment(mockUser, createAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.addAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error for an unknown service ID", async () => {
            const error = new NotFoundException(`Service could not be found for id ${createAppointmentDTO.serviceID}.`);
            mockUserService.addAppointment.mockRejectedValue(error);
            await expect(
                controller.addAppointment(mockUser, createAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.addAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error for an unknown staff ID", async () => {
            const error = new NotFoundException(`Staff could not be found for id ${createAppointmentDTO.staffID}.`);
            mockUserService.addAppointment.mockRejectedValue(error);
            await expect(
                controller.addAppointment(mockUser, createAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.addAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if an appointment is unavailable", async () => {
            const error = new BadRequestException("Appointment is unavailable.");
            mockUserService.addAppointment.mockRejectedValue(error);
            await expect(
                controller.addAppointment(mockUser, createAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.addAppointment).toHaveBeenCalledTimes(1);
        });

    });

    describe("getAppointments", () => {

        it("should return an array of appointments in the correct format", async () => {

            mockUserService.getAppointments.mockResolvedValue(
				[mockAppointment1, mockAppointment2, mockAppointment3]
			);
            const result = await controller.getAppointments(mockUser);

            expect(result).toHaveProperty("data");
            expect(result.data!.length).toEqual(3);
            expect(result).toHaveProperty("error", null);

            const data = result.data![0];
            expect(data).toHaveProperty("id", mockAppointment1.id);
            expect(data).toHaveProperty("startTimestamp", mockAppointment1.startTimestamp);
            expect(data).toHaveProperty("dateString", dateToStrings(mockAppointment1.startTimestamp)[0]);
            expect(data).toHaveProperty("timeString", dateToStrings(mockAppointment1.startTimestamp)[1]);
            expect(data).toHaveProperty("serviceID", mockAppointment1.service.id);
            expect(data).toHaveProperty("serviceName", mockAppointment1.service.serviceName);
            expect(data).toHaveProperty("serviceDuration", mockAppointment1.service.serviceDuration);
            expect(data).toHaveProperty("serviceDescription", mockAppointment1.service.serviceDescription);
            expect(data).toHaveProperty("staffID", mockAppointment1.staff.id);
            expect(data).toHaveProperty("staffName", mockAppointment1.staff.name);
            expect(data).toHaveProperty("status", "completed");

        });

        it('should return an empty array if the user has no appointments', async () => {
            mockUserService.getAppointments.mockResolvedValue(
				[]
			);
            const result = await controller.getAppointments(mockUser);

            expect(result).toHaveProperty("data", []);
            expect(result.data!.length).toEqual(0);
            expect(result).toHaveProperty("error", null);
        });

        it("should throw an error for an unknown user ID", async () => {
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            mockUserService.getAppointments.mockRejectedValue(error);
            await expect(
                controller.getAppointments(mockUser),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.getAppointments).toHaveBeenCalledTimes(1);
        });

    });

    describe("getLimitedAppointments", () => {

        it("should return numAppointments-number of appointments in the correct format", async () => {
            mockUserService.getLimitedAppointments.mockResolvedValue(
				[mockAppointment1, mockAppointment2, mockAppointment3]
			);
            const result = await controller.getLimitedAppointments(mockUser, "2");

            expect(result).toHaveProperty("data");
            expect(result.data!.length).toEqual(2);
            expect(result).toHaveProperty("error", null);

            const data = result.data![0];
            expect(data).toHaveProperty("id", mockAppointment1.id);
            expect(data).toHaveProperty("startTimestamp", mockAppointment1.startTimestamp);
            expect(data).toHaveProperty("dateString", dateToStrings(mockAppointment1.startTimestamp)[0]);
            expect(data).toHaveProperty("timeString", dateToStrings(mockAppointment1.startTimestamp)[1]);
            expect(data).toHaveProperty("serviceID", mockAppointment1.service.id);
            expect(data).toHaveProperty("serviceName", mockAppointment1.service.serviceName);
            expect(data).toHaveProperty("serviceDuration", mockAppointment1.service.serviceDuration);
            expect(data).toHaveProperty("serviceDescription", mockAppointment1.service.serviceDescription);
            expect(data).toHaveProperty("staffID", mockAppointment1.staff.id);
            expect(data).toHaveProperty("staffName", mockAppointment1.staff.name);
            expect(data).toHaveProperty("status", "completed");
        });

        it("should return all appointments if the total # of appointments is less than numAppointments", async () => {
            it("should return numAppointments-number of appointments in the correct format", async () => {
                mockUserService.getLimitedAppointments.mockResolvedValue(
                    [mockAppointment1, mockAppointment2, mockAppointment3]
                );
                const result = await controller.getLimitedAppointments(mockUser, "4");

                expect(result).toHaveProperty("data");
                expect(result.data!.length).toEqual(3);
                expect(result).toHaveProperty("error", null);
            });
        });

        it("should return an empty array if the user has no appointments", async () => {
            mockUserService.getLimitedAppointments.mockResolvedValue(
                    []
                );
                const result = await controller.getLimitedAppointments(mockUser, "4");

                expect(result).toHaveProperty("data", []);
                expect(result.data!.length).toEqual(0);
                expect(result).toHaveProperty("error", null);
        });

        it("should throw an error if numAppointments is negative", async () => {
            const error = new BadRequestException("Id should be a positive integer.");
            mockUserService.getLimitedAppointments.mockRejectedValue(error);
            await expect(
                controller.getLimitedAppointments(mockUser, "3"),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.getLimitedAppointments).toHaveBeenCalledTimes(1);
        });

        it("should throw an error for an unknown user ID", async () => {
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            mockUserService.getLimitedAppointments.mockRejectedValue(error);
            await expect(
                controller.getLimitedAppointments(mockUser, "3"),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.getLimitedAppointments).toHaveBeenCalledTimes(1);
        });

    });

    describe("editAppointment", () => {

        it("should return the edited appointment in the correct format", async () => {
            mockUserService.editAppointment.mockResolvedValue(
				mockAppointment1
			);
            const result = await controller.editAppointment(mockUser, editAppointmentDTO);

            expect(result).toHaveProperty("data");
            expect(result).toHaveProperty("error", null);

            const data = result.data![0];
            expect(data).toHaveProperty("id", mockAppointment1.id);
            expect(data).toHaveProperty("startTimestamp", mockAppointment1.startTimestamp);
            expect(data).toHaveProperty("dateString", dateToStrings(mockAppointment1.startTimestamp)[0]);
            expect(data).toHaveProperty("timeString", dateToStrings(mockAppointment1.startTimestamp)[1]);
            expect(data).toHaveProperty("serviceID", mockAppointment1.service.id);
            expect(data).toHaveProperty("serviceName", mockAppointment1.service.serviceName);
            expect(data).toHaveProperty("serviceDuration", mockAppointment1.service.serviceDuration);
            expect(data).toHaveProperty("serviceDescription", mockAppointment1.service.serviceDescription);
            expect(data).toHaveProperty("staffID", mockAppointment1.staff.id);
            expect(data).toHaveProperty("staffName", mockAppointment1.staff.name);
            expect(data).toHaveProperty("status", "completed");
        });

        it("should throw an error for an unknown user ID", async () => {
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the user has no appointments", async () => {
            const error = new BadRequestException("User does not contain any appointments.");
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the appointment ID is not owned by the user", async () => {
            const error = new ForbiddenException("Appointment is not owned by the User");
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if there are no changes to the appointment being requested", async () => {
            const error = new BadRequestException("Request needs at least one changed attribute.");
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the new service ID has no corresponding service", async () => {
            const error = new NotFoundException( `Service could not be found for id ${editAppointmentDTO.serviceID}.` );
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the new staff ID has no corresponding staff", async () => {
            const error = new NotFoundException(`Staff could not be found for id ${editAppointmentDTO.staffID}.`);
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the new/edited appointment is unavailable', async () => {
            const error = new BadRequestException("Appointment is unavailable.");
            mockUserService.editAppointment.mockRejectedValue(error);
            await expect(
                controller.editAppointment(mockUser, editAppointmentDTO),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.editAppointment).toHaveBeenCalledTimes(1);
        });

    });

    describe("deleteAppointment", () => {

        it("should return a success message if completed", async () => {

            mockUserService.deleteAppointment.mockResolvedValue();
            const result = await controller.deleteAppointment(mockUser, mockRequest1);

            expect(result).toHaveProperty("data", "Appointment deleted successfully");
            expect(result).toHaveProperty("error", null);

        });

        it("should throw an error if no appointment ID is supplied", async () => {
            const error = new BadRequestException("Appointment ID is empty.");
            await expect(
                controller.deleteAppointment(mockUser, mockRequest2),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(0);
        });

        it("should throw an error for an unknown user email", async () => {
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            mockUserService.deleteAppointment.mockRejectedValue(error);
            await expect(
                controller.deleteAppointment(mockUser, mockRequest1),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the user has no appointments", async () => {
            const error = new BadRequestException("User does not contain any appointments.");
            mockUserService.deleteAppointment.mockRejectedValue(error);
            await expect(
                controller.deleteAppointment(mockUser, mockRequest1),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the appointment ID is not owned by the user", async () => {
            const error = new ForbiddenException("Appointment is not owned by the User");
            mockUserService.deleteAppointment.mockRejectedValue(error);
            await expect(
                controller.deleteAppointment(mockUser, mockRequest1),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the staff ID for the appointment has no corresponding staff", async () => {
            const error = new NotFoundException(`Staff could not be found for id ${mockRequest1.body.id}.`);
            mockUserService.deleteAppointment.mockRejectedValue(error);
            await expect(
                controller.deleteAppointment(mockUser, mockRequest1),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if the staff does not have any appointments", async () => {
            const error = new NotFoundException("Staff does not contain any appointments.");
            mockUserService.deleteAppointment.mockRejectedValue(error);
            await expect(
                controller.deleteAppointment(mockUser, mockRequest1),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAppointment).toHaveBeenCalledTimes(1);
        });

    });

    describe("deleteAccount", () => {

        it("should return a success message if completed", async () => {
            mockUserService.deleteAccount.mockResolvedValue();
            const result = await controller.deleteAccount(mockUser);

            expect(result).toHaveProperty("data", "Account deleted successfully");
            expect(result).toHaveProperty("error", null);
        });

        it("should throw an error if the user ID has no corresponding user", async () => {
            const error = new NotFoundException(`User could not be found for email ${mockUser.email}.`);
            mockUserService.deleteAccount.mockRejectedValue(error);
            await expect(
                controller.deleteAccount(mockUser),
            ).rejects.toThrow(
                error,
            );
            expect(mockUserService.deleteAccount).toHaveBeenCalledTimes(1);
        });

    });

});