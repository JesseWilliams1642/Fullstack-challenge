// api/health
// api/services
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

describe("Service Module (e2e)", () => {
	let app: INestApplication;

	// Set up NestJS application and register/login test user to get auth token for protected routes
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = module.createNestApplication();
		app.use(cookieParser());
		await app.init();
	});

	// Remove test user after tests are completed
	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	describe("GET /api", () => {
		it("should return all services with valid structure when authenticated", async () => {
			const res = await request(app.getHttpServer()).get("/api").expect(200);

			expect(res.body).toHaveProperty("data");
			expect(Array.isArray(res.body.data)).toBe(true);

			if (res.body.data.length > 0) {
				const service = res.body.data[0];
				expect(service).toHaveProperty("id");
				expect(typeof service.id).toBe("string");
				expect(service.id.length).toBeGreaterThan(0);

				expect(service).toHaveProperty("serviceName");
				expect(typeof service.serviceName).toBe("string");
				expect(service.serviceName.length).toBeGreaterThan(0);

				expect(service).toHaveProperty("serviceDuration");
				expect(typeof service.serviceDuration).toBe("object");

				expect(service).toHaveProperty("serviceDescription");
				expect(typeof service.serviceDescription).toBe("string");

				expect(service).toHaveProperty("serviceImage");
				expect(typeof service.serviceImage).toBe("string");
			}
		});
	});

	describe("GET /api/health", () => {
		it("should return ok", async () => {
			const res = await request(app.getHttpServer()).get("/api/health").expect(200);

			// No extensive validation needed; it should always be this
			expect(res.body).toEqual({
				status: "ok",
			});
		});
	});
});
