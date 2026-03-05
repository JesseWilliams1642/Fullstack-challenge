import { Test, TestingModule } from "@nestjs/testing";
import { Appointment } from "../appointment.entity";
import { AppointmentService } from "../appointment.service";
import { Staff } from "src/modules/staff/staff.entity";
import { User } from "src/modules/user/user.entity";
import { GetServiceDTO } from "src/modules/service/dto";
import { Service } from "src/modules/service/service.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("AppointmentService", () => {
	let service: AppointmentService;
	let mockAppointmentRepository: jest.Mocked<any>;
	let mockUserRepository: jest.Mocked<any>;
	let mockServiceRepository: jest.Mocked<any>;
	let mockStaffRepository: jest.Mocked<any>;

	// Test data
	const mockService: Service = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		serviceName: "Haircut",
		serviceDuration: "30m",
		serviceDescription: "A basic haircut",
		serviceImage: "https://example.com/haircut.jpg",
	};

	const mockStaff: Staff = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		name: "Jesse",
		daysWorking: [true, true, true, true, true, false, false],
		startTime: "9h",
		shiftDuration: "8h",
		breakTime: "12h",
		breakDuration: "1h",
		bufferPeriod: "15m",
	};

	const mockStaff2: Staff = {
		id: "550e8400-e29b-41d4-a716-446655440001",
		name: "Chris",
		daysWorking: [true, true, true, true, true, false, false],
		startTime: "9h",
		shiftDuration: "8h",
		breakTime: "12h",
		breakDuration: "1h",
		bufferPeriod: "15m",
	};

	const mockUser: User = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		email: "test@example.com",
		name: "John Doe",
		hashedPassword: "hashedpassword",
		appointments: [],
	};

	const mockUser2: User = {
		id: "550e8400-e29b-41d4-a716-446655440001",
		email: "test2@example.com",
		name: "Jane Doe",
		hashedPassword: "hashedpassword",
		appointments: [],
	};

	// Generic appointment
	const mockStaffAppointment: Appointment = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		startTimestamp: new Date("2001-01-01T10:00:00Z"),
		service: mockService,
		user: mockUser,
		staff: mockStaff,
	};

	// To test for overlapping appointments
	const mockStaffAppointment2: Appointment = {
		id: "550e8400-e29b-41d4-a716-446655440001",
		startTimestamp: new Date("2001-01-01T10:05:00Z"),
		service: mockService,
		user: mockUser,
		staff: mockStaff,
	};

	// To test for overlap between staff appointments
	const mockStaffAppointment3: Appointment = {
		id: "550e8400-e29b-41d4-a716-446655440002",
		startTimestamp: new Date("2001-01-01T10:10:00Z"),
		service: mockService,
		user: mockUser,
		staff: mockStaff2,
	};

	// To test for overlap between user appointments
	const mockStaffAppointment4: Appointment = {
		id: "550e8400-e29b-41d4-a716-446655440003",
		startTimestamp: new Date("2001-01-01T10:15:00Z"),
		service: mockService,
		user: mockUser2,
		staff: mockStaff,
	};

	beforeEach(async () => {
		mockAppointmentRepository = {
			createQueryBuilder: jest.fn().mockReturnValue({
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			}),
		};

		mockStaffRepository = {
			findOneBy: jest.fn(),
		};

		mockUserRepository = {
			findOneBy: jest.fn(),
		};

		mockServiceRepository = {
			findOneBy: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppointmentService,
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
			],
		}).compile();

		service = module.get<AppointmentService>(AppointmentService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAvailabilities", () => {
		it("should return all available time slots, inside of work hours and break times, when there are no existing appointments", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue([mockService]);
			mockStaffRepository.findOneBy.mockResolvedValue([mockStaff]);
			mockUserRepository.findOneBy.mockResolvedValue([mockUser]);

			const result = await service.getAvailabilities(
				new Date("2001-01-01"),
				mockService.id,
				mockStaff.id,
				mockUser.id,
				null,
			);

			// 9am to 5pm, break from 12pm to 1pm, 30 minute service duration
			// 8 hours shift = 8 * 12 5 minute slots, minus 5+5=10 for break + buffer time before it,
			// minus buffer time (5 slots) for the last slot before closing time
			expect(result).toHaveLength(8 * 12 - 10 - 5);

			// Inside of work hours
			expect(result[0]).toBe("2001-01-01T09:00:00.000Z");
			expect(result[result.length - 1]).toBe("2001-01-01T16:30:00.000Z");

			// Not overlapping with break time
			expect(result).toContain("2001-01-01T11:30:00.000Z");
			expect(result).not.toContain("2001-01-01T11:35:00.000Z");
			expect(result).not.toContain("2001-01-01T12:00:00.000Z");
			expect(result).not.toContain("2001-01-01T12:05:00.000Z");
			expect(result).not.toContain("2001-01-01T12:55:00.000Z");
			expect(result).toContain("2001-01-01T13:00:00.000Z");

			// Check that the functions were called the correct number of times
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
		});

		it("should no time slots if the date corresponds to the staff's day off", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue([mockService]);
			mockStaffRepository.findOneBy.mockResolvedValue([mockStaff]);
			mockUserRepository.findOneBy.mockResolvedValue([mockUser]);

			const result = await service.getAvailabilities(
				new Date("2000-01-01"), // A Saturday!
				mockService.id,
				mockStaff.id,
				mockUser.id,
				null,
			);

			expect(result).toBe([]);

			// Check that the functions were called the correct number of times
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(0);
		});

		it("should return appointments that do not overlap with existing appointments", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue([mockService]);
			mockStaffRepository.findOneBy.mockResolvedValue([mockStaff]);
			mockUserRepository.findOneBy.mockResolvedValue([mockUser]);

			const result = await service.getAvailabilities(
				new Date("2001-01-01"),
				mockService.id,
				mockStaff.id,
				mockUser.id,
				null,
			);

			// Overlap with appointment and buffer period
			// Appointment must be at a time that takes into account both its service duration
			// and the buffer time from the appointment being checked
			expect(result).toContain("2001-01-01T09:15:00.000Z"); // On threshold of service duration of new appointment + buffer time
			expect(result).not.toContain("2001-01-01T09:20:00.000Z"); // Cannot fit service + buffer time between new and existing appointment
			expect(result).not.toContain("2001-01-01T09:45:00.000Z"); // Start of buffer time
			expect(result).not.toContain("2001-01-01T10:00:00.000Z"); // Overlaps with existing appointment
			expect(result).not.toContain("2001-01-01T10:30:00.000Z"); // End of existing appointment
			expect(result).not.toContain("2001-01-01T10:40:00.000Z"); // End of buffer time after existing appointment
			expect(result).toContain("2001-01-01T10:45:00.000Z");

			// Check that the functions were called the correct number of times
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
		});

		it("should include time slots that overlap with the user's own existing appointment when editing that existing appointment)", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.getAvailabilities(
				new Date("2001-01-01"),
				mockService.id,
				mockStaff.id,
				mockUser.id,
				mockStaffAppointment.id, // Editing the existing appointment
			);

			// Check if the time slot that overlaps within the existing appointment is included
			expect(result).toContain("2001-01-01T09:15:00.000Z"); // On threshold of service duration of new appointment + buffer time
			expect(result).toContain("2001-01-01T09:20:00.000Z"); // After threshold
			expect(result).toContain("2001-01-01T09:45:00.000Z"); // Start of buffer time
			expect(result).toContain("2001-01-01T10:00:00.000Z"); // Start of existing appointment
			expect(result).toContain("2001-01-01T10:30:00.000Z"); // End of existing appointment
			expect(result).toContain("2001-01-01T10:40:00.000Z"); // End of buffer time after existing appointment
			expect(result).toContain("2001-01-01T10:45:00.000Z");

			// Check that the functions were called the correct number of times
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
		});

		it("should error if the serviceId does not correspond to a valid service", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const fakeServiceId = "thisisnotavalidserviceid";
			const error = new NotFoundException(
				`Service could not be found for id ${fakeServiceId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date("2001-01-01"),
					fakeServiceId,
					mockStaff.id,
					mockUser.id,
					null,
				),
			).rejects.toThrow(error);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(0);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(0);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(0);
		});

		it("should error if the staffId does not correspond to a valid staff member", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const fakeStaffId = "thisisnotavalidstaffid";
			const error = new NotFoundException(
				`Staff could not be found for id ${fakeStaffId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date("2001-01-01"),
					mockService.id,
					fakeStaffId,
					mockUser.id,
					null,
				),
			).rejects.toThrow(error);
			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(0);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(0);
		});

		it("should error if the userId does not correspond to a valid user", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const fakeUserId = "thisisnotavaliduserid";
			const error = new NotFoundException(
				`User could not be found for id ${fakeUserId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date("2001-01-01"),
					mockService.id,
					mockStaff.id,
					fakeUserId,
					null,
				),
			).rejects.toThrow(error);

			expect(mockServiceRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockStaffRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(0);
		});
	});

	describe("checkAppointmentAvailability", () => {
		it("should be true if is within start/end times, outside of the break, and there are no other appointments", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			const result = await service.checkAppointmentAvailability(
				new Date("2001-01-01T10:30:00.000Z"),
				mockUser,
				mockService,
				mockStaff,
				null,
			);

			expect(result).toBe(true);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});

		it("should error if the date corresponds to the staff's day off", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			let error = new BadRequestException(
				"The chosen appointment is not within the chosen staff's operating days.",
			);

			await expect(
				service.checkAppointmentAvailability(
					new Date("2000-01-01"), // A Saturday!
					mockUser,
					mockService,
					mockStaff,
					null,
				),
			).rejects.toThrow(error);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(0);
		});

		it("should error if it overlaps with existing appointments", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			let error = new BadRequestException(
				"The chosen appointment overlaps with one of the user's existing appointments.",
			);

			await expect(
				service.checkAppointmentAvailability(
					new Date("2001-01-01T10:30:00.000Z"), // Overlaps with existing appointment
					mockUser,
					mockService,
					mockStaff,
					null,
				),
			).rejects.toThrow(error);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});

		it("should error if it overlaps with existing appointments", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			let error = new BadRequestException(
				"The chosen appointment is not within the chosen staff's operating hours.",
			);

			await expect(
				service.checkAppointmentAvailability(
					new Date("2001-01-01T3:00:00.000Z"), // Outside of work hours
					mockUser,
					mockService,
					mockStaff,
					null,
				),
			).rejects.toThrow(error);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});

		it("should error if it overlaps with staff's break time", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			let error = new BadRequestException(
				"The chosen appointment conflicts with the staff's break time.",
			);

			await expect(
				service.checkAppointmentAvailability(
					new Date("2001-01-01T12:00:00.000Z"), // During break time
					mockUser,
					mockService,
					mockStaff,
					null,
				),
			).rejects.toThrow(error);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});

		it("should error if it conflicts with one of the staff's existing appointments", async () => {
			const staffQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment4]),
			};

			const userQueryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([]),
			};

			mockAppointmentRepository.createQueryBuilder.mockImplementation(() => {
				// First call is for staff appointments, second call is for user appointments
				switch (mockAppointmentRepository.createQueryBuilder.mock.calls.length) {
					case 0:
						return staffQueryBuilder;
					case 1:
						return userQueryBuilder;
					default:
						throw new Error("createQueryBuilder called too many times");
				}
			});

			let error = new BadRequestException(
				"The chosen appointment conflicts with one of the staff's existing appointments.",
			);

			await expect(
				service.checkAppointmentAvailability(
					new Date("2001-01-01T11:30:00.000Z"), // During user2's existing appointment with the same staff member
					mockUser,
					mockService,
					mockStaff,
					null,
				),
			).rejects.toThrow(error);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});

		it("should be true if it overlaps with the user's own existing appointment when editing that existing appointment)", async () => {
			const queryBuilder = {
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment]),
			};
			mockAppointmentRepository.createQueryBuilder.mockReturnValue(queryBuilder);

			const result = await service.checkAppointmentAvailability(
				new Date("2001-01-01T10:30:00.000Z"),
				mockUser,
				mockService,
				mockStaff,
				mockStaffAppointment, // Editing the existing appointment
			);

			// mockAppointment is at 10:00AM, so 10:30AM is available when editing it
			expect(result).toBe(true);

			// Check that the functions were called the correct number of times
			expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledTimes(2);
		});
	});
});
