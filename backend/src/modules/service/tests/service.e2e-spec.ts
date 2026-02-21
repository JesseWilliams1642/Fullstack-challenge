import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { ServiceModule } from "../service.module";
import { AuthModule } from "../../auth/auth.module";

describe("Service Module (e2e)", () => {
	let app: INestApplication; // Need to initialize the Nest application for e2e testing
	let authToken: string; // Store JWT token for authenticated requests

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ServiceModule, AuthModule],
		}).compile();

		app = module.createNestApplication();
		app.use(cookieParser()); // Add cookie parser middleware
		await app.init();

		// Register test user via HTTP request
		const registerRes = await request(app.getHttpServer())
			.post("/api/auth/register")
			.send({
				email: "test@supertest.haha",
				password: "testpassword",
				name: "Test User",
			});

		// Login via HTTP request and capture the cookie
		const loginRes = await request(app.getHttpServer())
			.post("/api/auth/login")
			.send({
				email: "test@supertest.haha",
				password: "testpassword",
			});

		if (loginRes.status !== 200) {
			throw new Error(
				`Failed to log in test user. Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)}`,
			);
		}

		// Extract the JWT cookie from the Set-Cookie header
		authToken = loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1];
	});

	afterAll(async () => {
		if (authToken) {
			// Delete test user via HTTP request
			await request(app.getHttpServer())
				.delete("/api/user/account")
				.set("Cookie", `JWT_fullstack=${authToken}`)
				.send({
					email: "test@supertest.haha",
				});
		}

		if (app) await app.close();
	});

	describe("GET /api/service", () => {
		it("Should return service data", () => {
			return request(app.getHttpServer())
				.get("/api/service")
				.set("Cookie", `JWT_fullstack=${authToken}`) // Set the JWT cookie for authentication
				.expect(200)
				.expect((res) => {
					//console.log("Response status:", res.status);
					//console.log("Response body:", JSON.stringify(res.body, null, 2));
					expect(res.body).toBeDefined();
					expect(res.body.data).toBeDefined();
					expect(Array.isArray(res.body.data)).toBe(true);
					expect(res.body.data).toEqual(
						// Must be an array containing objects
						expect.arrayContaining([
							expect.objectContaining({
								// Define object
								id: expect.any(String),
								serviceName: expect.any(String),
								serviceDuration: expect.any(Object),
								serviceDescription: expect.any(String),
								serviceImage: expect.any(String),
							}),
						]),
					);
				});
		});
	});
});
