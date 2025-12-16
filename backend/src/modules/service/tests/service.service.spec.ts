import { Test, TestingModule } from "@nestjs/testing";
import { ServiceService } from "../service.service";
import { GetServiceDTO } from "../dto";

const mockService: GetServiceDTO = {
    id: expect.any(Number),
    serviceName: expect.any(String),
    serviceDuration: expect.any(Number),
    serviceDescription: expect.any(String),
    serviceImage: expect.any(String)
}

const mockServiceRepository = {
    find: jest.fn().mockResolvedValue([mockService])
};

describe('ServiceService', () => {
    let service: ServiceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ServiceService,
                {
                    provide: "SERVICE_REPOSITORY",
                    useValue: mockServiceRepository
                }
            ]
        })
        .compile();

        service = module.get<ServiceService>(ServiceService);

    });

    it('Should Be Defined', () => {
        expect(service).toBeDefined();
    })

    it("getServices() should return services", async () => {
        expect(await service.getServices()).toEqual([mockService]);
    })

})