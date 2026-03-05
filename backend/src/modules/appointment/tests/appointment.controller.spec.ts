import { Test, TestingModule } from "@nestjs/testing";
import { AppointmentController } from "../appointment.controller";
import { AppointmentService } from "../appointment.service";
import { GetAppointmentAvailabilityDTO } from "../dto";
import { SafeUser } from "src/common/types";
import { NotFoundException } from "@nestjs/common";

describe("AppointmentController", () => {
	let controller: AppointmentController;
	let mockAppointmentService: jest.Mocked<AppointmentService>;

	// Test data
	const mockUser: SafeUser = {
		id: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f0",
		name: "John Doe",
		email: "test@testemail.com",
	};

	const mockAvailabilityDTO: GetAppointmentAvailabilityDTO = {
		serviceID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f1",
		date: new Date().toISOString(),
		staffID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f2",
		appointmentID: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f3",
	};

	beforeEach(async () => {
		// Must be cast as jest.Mocked<AppointmentService> to satisfy TypeScript type checking for mocked methods
		// Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getServices()
		mockAppointmentService = {
			getAvailabilities: jest.fn(),
		} as unknown as jest.Mocked<AppointmentService>;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppointmentController],
			providers: [AppointmentService],
		})
			.overrideProvider(AppointmentService)
			.useValue(mockAppointmentService)
			.compile();

		controller = module.get<AppointmentController>(AppointmentController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAppointments", () => {
		it("should return available appointment times", async () => {
			const expectedAvailabilities = [
				"9:00 AM",
				"9:05 AM",
				"9:10 AM",
				"9:15 AM",
				"9:20 AM",
				"9:25 AM",
				"9:30 AM",
				"9:35 AM",
				"9:40 AM",
				"9:45 AM",
				"9:50 AM",
				"9:55 AM",
			];
			mockAppointmentService.getAvailabilities.mockResolvedValue(
				expectedAvailabilities,
			);

			const result = await controller.getAppointments(mockUser, mockAvailabilityDTO);
			expect(result).toEqual({
				data: expectedAvailabilities,
				error: null,
			});
			expect(mockAppointmentService.getAvailabilities).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveLength(expectedAvailabilities.length);
		});

		it("should return empty array when no availabilities exist", async () => {
			mockAppointmentService.getAvailabilities.mockResolvedValue([]);
			const result = await controller.getAppointments(mockUser, mockAvailabilityDTO);
			expect(result).toEqual({
				data: [],
				error: null,
			});
			expect(mockAppointmentService.getAvailabilities).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveLength(0);
		});

		it("should return error response when getAvailabilities throws exception", async () => {
			const error = new NotFoundException(
				`Service could not be found for id ${mockAvailabilityDTO.serviceID}.`,
			);
			mockAppointmentService.getAvailabilities.mockRejectedValue(error);
			await expect(
				controller.getAppointments(mockUser, mockAvailabilityDTO),
			).rejects.toThrow(
				`Service could not be found for id ${mockAvailabilityDTO.serviceID}.`,
			);
			expect(mockAppointmentService.getAvailabilities).toHaveBeenCalledTimes(1);
		});

		it("should have a valid response structure", async () => {
			const expectedAvailabilities = ["9:00 AM"];
			mockAppointmentService.getAvailabilities.mockResolvedValue(
				expectedAvailabilities,
			);

			const result = await controller.getAppointments(mockUser, mockAvailabilityDTO);
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("error");
			expect(result.data).toEqual(expectedAvailabilities);
			expect(result.data!.length).toBeGreaterThanOrEqual(0);
			expect(result.data).toBeInstanceOf(Array<string>);
			expect(result.error).toBeNull();
		});
	});
});
