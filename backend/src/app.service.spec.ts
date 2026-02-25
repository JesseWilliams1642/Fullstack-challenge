import { Test, TestingModule } from "@nestjs/testing";
import { GetServiceDTO } from "./modules/service/dto";
import { AppService } from "./app.service";

describe("AppService", () => {
	let service: AppService;
	const mockAppService = {
		getServices: jest.fn(),
	};

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
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: AppService,
					useValue: mockAppService,
				},
			],
		}).compile();

		service = module.get<AppService>(AppService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getServices", () => {
		it("should return all services with successful response", async () => {
			const mockServices = [mockService, mockService2];
			mockAppService.getServices.mockResolvedValue(mockServices);

			const result = await service.getServices();

			expect(result).toEqual({
				data: mockServices,
				error: null,
			});
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
			expect(result).toHaveLength(2);
		});

		it("should return empty array when no services exist", async () => {
			mockAppService.getServices.mockResolvedValue([]);

			const result = await service.getServices();

			expect(result).toEqual({
				data: [],
				error: null,
			});
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should return error response when getServices throws exception", async () => {
			const error = new Error("Database connection failed");
			mockAppService.getServices.mockRejectedValue(error);

			await expect(service.getServices()).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should validate response data structure", async () => {
			mockAppService.getServices.mockResolvedValue([mockService]);

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
