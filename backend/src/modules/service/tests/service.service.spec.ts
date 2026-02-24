import { Test, TestingModule } from "@nestjs/testing";
import { ServiceService } from "../service.service";
import { GetServiceDTO } from "../dto";

describe("ServiceService", () => {
	let service: ServiceService;
	let mockServiceRepository: jest.Mocked<any>;

	// Test data
	const mockService: GetServiceDTO = {
		id: "550e8400-e29b-41d4-a716-446655440000",
		serviceName: "Haircut",
		serviceDuration: "30min",
		serviceDescription: "Professional haircut",
		serviceImage: "haircut.jpg",
	};

	const mockService2: GetServiceDTO = {
		id: "550e8400-e29b-41d4-a716-446655440001",
		serviceName: "Coloring",
		serviceDuration: "60min",
		serviceDescription: "Hair coloring service",
		serviceImage: "coloring.jpg",
	};

	beforeEach(async () => {
		mockServiceRepository = {
			find: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ServiceService,
				{
					provide: "SERVICE_REPOSITORY",
					useValue: mockServiceRepository,
				},
			],
		}).compile();

		service = module.get<ServiceService>(ServiceService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getServices", () => {
		it("should return all services from repository", async () => {
			const mockServices = [mockService, mockService2];
			mockServiceRepository.find.mockResolvedValue(mockServices);

			const result = await service.getServices();

			expect(result).toEqual(mockServices);
			expect(mockServiceRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should return empty array when no services exist", async () => {
			mockServiceRepository.find.mockResolvedValue([]);

			const result = await service.getServices();

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
			expect(mockServiceRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should return single service when only one exists", async () => {
			mockServiceRepository.find.mockResolvedValue([mockService]);

			const result = await service.getServices();

			expect(result).toEqual([mockService]);
			expect(result).toHaveLength(1);
			expect(result[0].serviceName).toBe("Haircut");
		});

		it("should throw error when repository fails", async () => {
			const error = new Error("Database connection failed");
			mockServiceRepository.find.mockRejectedValue(error);

			await expect(service.getServices()).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockServiceRepository.find).toHaveBeenCalledTimes(1);
		});

		it("should validate service data structure", async () => {
			mockServiceRepository.find.mockResolvedValue([mockService]);

			const result = await service.getServices();
			const firstService = result[0];

			expect(firstService).toHaveProperty("id");
			expect(firstService).toHaveProperty("serviceName");
			expect(firstService).toHaveProperty("serviceDuration");
			expect(firstService).toHaveProperty("serviceDescription");
			expect(firstService).toHaveProperty("serviceImage");

			expect(typeof firstService.id).toBe("string");
			expect(typeof firstService.serviceName).toBe("string");
			expect(typeof firstService.serviceDuration).toBe("string");
			expect(typeof firstService.serviceDescription).toBe("string");
			expect(typeof firstService.serviceImage).toBe("string");
		});
	});
});
