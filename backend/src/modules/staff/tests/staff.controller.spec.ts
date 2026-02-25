import { Test, TestingModule } from "@nestjs/testing";
import { StaffController } from "../staff.controller";
import { StaffService } from "../staff.service";
import { GetStaffDTO } from "../dto";

describe("StaffController", () => {
	let controller: StaffController;
	let mockStaffService: jest.Mocked<StaffService>;

	// Test data
	const mockStaff: GetStaffDTO = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		name: "John Doe",
	};

	const mockStaff2: GetStaffDTO = {
		id: "550e8400-e29b-41d4-a716-446655440001",
		name: "Jane Smith",
	};

	beforeEach(async () => {
		// Must be cast as jest.Mocked<StaffService> to satisfy TypeScript type checking for mocked methods
		// Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getStaff()
		mockStaffService = {
			getStaff: jest.fn(),
		} as unknown as jest.Mocked<StaffService>;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [StaffController],
			providers: [StaffService],
		})
			.overrideProvider(StaffService)
			.useValue(mockStaffService)
			.compile();

		controller = module.get<StaffController>(StaffController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getStaff", () => {
		it("should return all staff with successful response", async () => {
			const mockStaffs = [mockStaff, mockStaff2];
			mockStaffService.getStaff.mockResolvedValue(mockStaffs);

			const result = await controller.getStaff();

			expect(result).toEqual({
				data: mockStaffs,
				error: null,
			});
			expect(mockStaffService.getStaff).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveLength(2);
		});

		it("should return empty array when no staff exist", async () => {
			mockStaffService.getStaff.mockResolvedValue([]);

			const result = await controller.getStaff();

			expect(result).toEqual({
				data: [],
				error: null,
			});
			expect(mockStaffService.getStaff).toHaveBeenCalledTimes(1);
		});

		it("should return error response when getStaff throws exception", async () => {
			const error = new Error("Database connection failed");
			mockStaffService.getStaff.mockRejectedValue(error);

			await expect(controller.getStaff()).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockStaffService.getStaff).toHaveBeenCalledTimes(1);
		});

		it("should validate response data structure", async () => {
			mockStaffService.getStaff.mockResolvedValue([mockStaff]);

			const result = await controller.getStaff();
			const staff = result.data![0];

			expect(staff).toHaveProperty("id");
			expect(staff).toHaveProperty("name");

			expect(typeof staff.id).toBe("string");
			expect(typeof staff.name).toBe("string");
		});
	});
});
