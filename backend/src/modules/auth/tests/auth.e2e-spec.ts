import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "../auth.module";
import cookieParser from "cookie-parser";
import request from "supertest";

describe("Auth Module (e2e)", () => {
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
			imports: [AuthModule],
			providers: [],
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

	describe("POST api/auth/login", () => {});

	describe("POST api/auth/logout", () => {});

	describe("POST api/auth/register", () => {});

	describe("GET api/auth/me", () => {});
});
