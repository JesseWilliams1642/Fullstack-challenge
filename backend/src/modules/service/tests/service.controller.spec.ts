import { Test, TestingModule } from "@nestjs/testing";
import { ServiceController } from "../service.controller";
import { ServiceService } from "../service.service";
import { GetServiceDTO } from "../dto";

describe("ServiceController", () => {
	let controller: ServiceController;

	const mockService: GetServiceDTO = {
		id: expect.any(Number),
		serviceName: expect.any(String),
		serviceDuration: expect.any(Number),
		serviceDescription: expect.any(String),
		serviceImage: expect.any(String),
	};

	const mockServiceService = {
		getServices: jest.fn(() => [mockService]),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ServiceController],
			providers: [ServiceService],
		})
			.overrideProvider(ServiceService)
			.useValue(mockServiceService)
			.compile();

		controller = module.get<ServiceController>(ServiceController);
	});

	it("Should Be Defined", () => {
		expect(controller).toBeDefined();
	});

	it("getServices() should return services", async () => {
		expect(await controller.getServices()).toEqual({
			data: [mockService],
			error: null,
		});
	});
});
