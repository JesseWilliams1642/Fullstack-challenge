import { Test, TestingModule } from "@nestjs/testing";
import { StaffService } from "../staff.service";
import { GetStaffDTO } from "../dto";

describe("ServiceService", () => {
	let service: StaffService;
	let mockStaffRepository: jest.Mocked<any>;

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
		mockStaffRepository = {
			find: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StaffService,
				{
					provide: "STAFF_REPOSITORY",
					useValue: mockStaffRepository,
				},
			],
		}).compile();

		service = module.get<StaffService>(StaffService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getStaff", () => {
		it("should return all staff from repository", async () => {
			const mockStaffs = [mockStaff, mockStaff2];
			mockStaffRepository.find.mockResolvedValue(mockStaffs);

			const result = await service.getStaff();

			expect(result).toEqual(mockStaffs);
			expect(mockStaffRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should return empty array when no staff exist", async () => {
			mockStaffRepository.find.mockResolvedValue([]);

			const result = await service.getStaff();

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
			expect(mockStaffRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should return single staff when only one exists", async () => {
			mockStaffRepository.find.mockResolvedValue([mockStaff]);

			const result = await service.getStaff();

			expect(result).toEqual([mockStaff]);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("John Doe");
		});

		it("should throw error when repository fails", async () => {
			const error = new Error("Database connection failed");
			mockStaffRepository.find.mockRejectedValue(error);

			await expect(service.getStaff()).rejects.toThrow("Database connection failed");
			expect(mockStaffRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should validate service data structure", async () => {
			mockStaffRepository.find.mockResolvedValue([mockStaff]);

			const result = await service.getStaff();
			const staff = result[0];

			expect(staff).toHaveProperty("id");
			expect(staff).toHaveProperty("name");

			expect(typeof staff.id).toBe("string");
			expect(typeof staff.name).toBe("string");
		});
	});
});
