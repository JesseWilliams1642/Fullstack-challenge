import { Test, TestingModule } from "@nestjs/testing";
import { ServiceController } from "../service.controller";
import { ServiceService } from "../service.service";
import { GetServiceDTO } from "../dto";

describe("ServiceController", () => {
	let controller: ServiceController;
	let mockServiceService: jest.Mocked<ServiceService>;

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
		// Must be cast as jest.Mocked<ServiceService> to satisfy TypeScript type checking for mocked methods
		// Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getServices()
		mockServiceService = {
			getServices: jest.fn(),
		} as unknown as jest.Mocked<ServiceService>;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ServiceController],
			providers: [ServiceService],
		})
			.overrideProvider(ServiceService)
			.useValue(mockServiceService)
			.compile();

		controller = module.get<ServiceController>(ServiceController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getServices", () => {
		it("should return all services with successful response", async () => {
			const mockServices = [mockService, mockService2];
			mockServiceService.getServices.mockResolvedValue(mockServices);

			const result = await controller.getServices();

			expect(result).toEqual({
				data: mockServices,
				error: null,
			});
			expect(mockServiceService.getServices).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveLength(2);
		});

		it("should return empty array when no services exist", async () => {
			mockServiceService.getServices.mockResolvedValue([]);

			const result = await controller.getServices();

			expect(result).toEqual({
				data: [],
				error: null,
			});
			expect(mockServiceService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should return error response when service throws exception", async () => {
			const error = new Error("Database connection failed");
			mockServiceService.getServices.mockRejectedValue(error);

			await expect(controller.getServices()).rejects.toThrow(
				"Database connection failed",
			);
			expect(mockServiceService.getServices).toHaveBeenCalledTimes(1);
		});

		it("should validate response data structure", async () => {
			mockServiceService.getServices.mockResolvedValue([mockService]);

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
});
