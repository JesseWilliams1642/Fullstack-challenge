// getServices()
// healthCheck()
import { Test, TestingModule } from "@nestjs/testing";
import { GetServiceDTO } from "./modules/service/dto";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { HealthResponse } from "./common/types";

describe("AppController", () => {
	let controller: AppController;
	let mockAppService: jest.Mocked<AppService>;

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
		// Must be cast as jest.Mocked<AppService> to satisfy TypeScript type checking for mocked methods
		// Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getServices()
		mockAppService = {
			getServices: jest.fn(),
		} as unknown as jest.Mocked<AppService>;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		})
			.overrideProvider(AppService)
			.useValue(mockAppService)
			.compile();

		controller = module.get<AppController>(AppController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getServices", () => {
		it("should return all services with successful response", async () => {
			const mockServices = [mockService, mockService2];
			mockAppService.getServices.mockResolvedValue(mockServices);

			const result = await controller.getServices();

			expect(result).toEqual({
				data: mockServices,
				error: null,
			});
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveLength(2);
		});

		it("should return empty array when no services exist", async () => {
			mockAppService.getServices.mockResolvedValue([]);

			const result = await controller.getServices();

			expect(result).toEqual({
				data: [],
				error: null,
			});
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should return error response when getServices throws exception", async () => {
			const error = new Error("Database connection failed");
			mockAppService.getServices.mockRejectedValue(error);

			await expect(controller.getServices()).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockAppService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should validate response data structure", async () => {
			mockAppService.getServices.mockResolvedValue([mockService]);

			const result = await controller.getServices();
			const service = result.data![0];

			expect(service).toHaveProperty("id");
			expect(service).toHaveProperty("serviceName");
			expect(service).toHaveProperty("serviceDuration");
			expect(service).toHaveProperty("serviceDescription");
			expect(service).toHaveProperty("serviceImage");

			expect(typeof service.id).toBe("string");
			expect(typeof service.serviceName).toBe("string");
			expect(typeof service.serviceDuration).toBe("string");
			expect(typeof service.serviceDescription).toBe("string");
			expect(typeof service.serviceImage).toBe("string");
		});
	});

	describe("healthCheck", () => {
		it("should return an ok response", async () => {
			const result: HealthResponse = await controller.healthCheck();

			expect(result).toEqual({
				status: "ok",
			});
		});
	});
});
