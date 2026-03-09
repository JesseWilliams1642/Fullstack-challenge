import { Test, TestingModule } from "@nestjs/testing";
import { Appointment } from "../appointment.entity";
import { AppointmentService } from "../appointment.service";
import { Staff } from "src/modules/staff/staff.entity";
import { User } from "src/modules/user/user.entity";
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
		startTimestamp: new Date(2001, 0, 1, 10, 0, 0), // 2001-01-01 at 10:00 AM local time
		service: mockService,
		user: mockUser,
		staff: mockStaff,
	};

	// To test for overlap between user appointments
	const mockStaffAppointment2: Appointment = {
		id: "550e8400-e29b-41d4-a716-446655440003",
		startTimestamp: new Date(2001, 0, 1, 10, 15, 0), // 2001-01-01 at 10:15 AM local time
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

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.getAvailabilities(
				new Date(2001, 0, 1), // Local midnight (Monday)
				mockUser.id,
				mockService.id,
				mockStaff.id,
				null,
			);

			// 9am to 5pm, break from 12pm to 1pm, 30 minute service duration
			// Checked that it must be 74 manually
			expect(result).toHaveLength(74);

			// Inside of work hours
			expect(result[0]).toBe("9:00 AM");
			expect(result[result.length - 1]).toBe("4:30 PM");

			// Not overlapping with break time
			expect(result).toContain("11:30 AM");
			expect(result).not.toContain("11:35 AM");
			expect(result).not.toContain("12:00 PM");
			expect(result).not.toContain("12:05 PM");
			expect(result).not.toContain("12:55 PM");
			expect(result).toContain("1:00 PM");

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

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.getAvailabilities(
				new Date(2000, 0, 1), // A Saturday (Local midnight)
				mockUser.id,
				mockService.id,
				mockStaff.id,
				null,
			);

			expect(result).toStrictEqual([]);

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

			mockServiceRepository.findOneBy.mockResolvedValue(mockService);
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.getAvailabilities(
				new Date(2001, 0, 1), // Local midnight (Monday)
				mockUser.id,
				mockService.id,
				mockStaff.id,
				null,
			);

			// Overlap with appointment and buffer period
			// Appointment must be at a time that takes into account both its service duration
			// and the buffer time from the appointment being checked
			expect(result).toContain("9:15 AM"); 		// On threshold of service duration of new appointment + buffer time
			expect(result).not.toContain("9:20 AM"); 	// Cannot fit service + buffer time between new and existing appointment
			expect(result).not.toContain("9:45 AM"); 	// Start of buffer time
			expect(result).not.toContain("10:00 AM"); 	// Overlaps with existing appointment
			expect(result).not.toContain("10:30 AM"); 	// End of existing appointment
			expect(result).not.toContain("10:40 AM"); 	// End of buffer time after existing appointment
			expect(result).toContain("10:45 AM");

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
				new Date(2001, 0, 1), // Local midnight (Monday)
				mockUser.id,
				mockService.id,
				mockStaff.id,
				mockStaffAppointment.id, // Editing the existing appointment
			);

			// Check if the time slot that overlaps within the existing appointment is included
			expect(result).toContain("9:15 AM"); 	// On threshold of service duration of new appointment + buffer time
			expect(result).toContain("9:20 AM"); 	// After threshold
			expect(result).toContain("9:45 AM"); 	// Start of buffer time
			expect(result).toContain("10:00 AM"); 	// Start of existing appointment
			expect(result).toContain("10:30 AM"); 	// End of existing appointment
			expect(result).toContain("10:40 AM"); 	// End of buffer time after existing appointment
			expect(result).toContain("10:45 AM");

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

			mockServiceRepository.findOneBy.mockResolvedValue();
			mockStaffRepository.findOneBy.mockResolvedValue(mockStaff);
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const fakeServiceId = "thisisnotavalidserviceid";
			const error = new NotFoundException(
				`Service could not be found for id ${fakeServiceId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date(2001, 0, 1), // Local midnight (Monday)
					mockUser.id,
					fakeServiceId,
					mockStaff.id,
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
			mockStaffRepository.findOneBy.mockResolvedValue();
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const fakeStaffId = "thisisnotavalidstaffid";
			const error = new NotFoundException(
				`Staff could not be found for id ${fakeStaffId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date(2001, 0, 1), // Local midnight (Monday)
					mockUser.id,
					mockService.id,
					fakeStaffId,
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
			mockUserRepository.findOneBy.mockResolvedValue();

			const fakeUserId = "thisisnotavaliduserid";
			const error = new NotFoundException(
				`User could not be found for id ${fakeUserId}.`,
			);

			await expect(
				service.getAvailabilities(
					new Date(2001, 0, 1), // Local midnight (Monday)
					fakeUserId,
					mockService.id,
					mockStaff.id,
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
				new Date(2001, 0, 1, 10, 30), // Monday 10:30 AM
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
					new Date(2000, 0, 1, 10), // A Saturday!
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
					new Date(2001, 0, 1, 10, 30), // Overlaps with existing appointment
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
					new Date(2001, 0, 1, 3), // Outside of work hours
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
					new Date(2001, 1, 1, 12), // During break time
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
				getMany: jest.fn().mockResolvedValue([mockStaffAppointment2]),
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
					case 1:
						console.log("called");
						return staffQueryBuilder;
					case 2:
						console.log("called");
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
					new Date(2001, 0, 1, 10, 30), // During user2's existing appointment with the same staff member
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
				new Date(2001, 0, 1, 10, 30),
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
