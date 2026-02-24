import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { ServiceModule } from "../service.module";
import { AuthModule } from "../../auth/auth.module";

describe("Service Module (e2e)", () => {
	let app: INestApplication;
	let authToken: string;

	// Test constants
	const TEST_USER = {
		email: "test@supertest.haha",
		password: "testpassword",
		name: "Test User",
	};

	const getCookieHeader = (token: string) => `JWT_fullstack=${token}`;

	// Set up NestJS application and register/login test user to get auth token for protected routes
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ServiceModule, AuthModule],
		}).compile();

		app = module.createNestApplication();
		app.use(cookieParser());
		await app.init();

		// Register test user
		const registerRes = await request(app.getHttpServer())
			.post("/api/auth/register")
			.send(TEST_USER);

		if (registerRes.status !== 201) {
			throw new Error(
				`Failed to register test user. Status: ${registerRes.status}, Body: ${JSON.stringify(registerRes.body)}`,
			);
		}

		// Login and capture JWT token
		const loginRes = await request(app.getHttpServer())
			.post("/api/auth/login")
			.send({
				email: TEST_USER.email,
				password: TEST_USER.password,
			});

		if (loginRes.status !== 200) {
			throw new Error(
				`Failed to log in test user. Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)}`,
			);
		}

		const setCookieHeader = loginRes.headers["set-cookie"]?.[0];
		if (!setCookieHeader) throw new Error("No Set-Cookie header in login response");

		authToken = setCookieHeader.split(";")[0].split("=")[1];
		if (!authToken)
			throw new Error("Failed to extract JWT token from Set-Cookie header");
	});

	// Remove test user after tests are completed
	afterAll(async () => {
		if (authToken) {
			try {
				await request(app.getHttpServer())
					.delete("/api/user/account")
					.set("Cookie", getCookieHeader(authToken))
					.send();
			} catch (error) {
				console.warn("Failed to clean up test user:", error);
			}
		}

		if (app) {
			await app.close();
		}
	});

	describe("GET /api/service", () => {
		it("should return all services with valid structure when authenticated", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/service")
				.set("Cookie", getCookieHeader(authToken))
				.expect(200);

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

		it("should return 401 when accessing without authentication", async () => {
			await request(app.getHttpServer()).get("/api/service").expect(401);
		});

		it("should return 401 with invalid JWT token", async () => {
			await request(app.getHttpServer())
				.get("/api/service")
				.set("Cookie", getCookieHeader("invalid-token"))
				.expect(401);
		});
	});
});
