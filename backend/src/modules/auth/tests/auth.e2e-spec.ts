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

	describe("POST api/auth/register", () => {
		it("should return the created user for a successful registration", async () => {
			const registerRes = await request(app.getHttpServer())
				.post("/api/auth/register")
				.send(TEST_USER)
				.expect(201);

			expect(registerRes.body).toHaveProperty("data");
			expect(registerRes.body).toHaveProperty("error");
			const createdUser = registerRes.body.data;
			expect(registerRes.body.error).toBeNull;

			expect(createdUser).toHaveProperty("email", TEST_USER.email);
			expect(typeof createdUser.email).toBe("string");
			expect(createdUser.email.length).toBeGreaterThan(0);
			
			expect(createdUser).toHaveProperty("id");
			expect(typeof createdUser.id).toBe("string");
			expect(createdUser.id.length).toBeGreaterThan(0);
			
			expect(createdUser).toHaveProperty("name", TEST_USER.name);
			expect(typeof createdUser.name).toBe("string");
			expect(createdUser.name.length).toBeGreaterThan(0);
		});

		it("should throw an error if the user already exists", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send(TEST_USER)
				.expect(400);
		});

		it("should throw an error for an empty email field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					name: TEST_USER.name,
					password: TEST_USER.password
				})
				.expect(400);
		});

		it("should throw an error for an invalid email format", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: "thisisnotanemail",
					name: TEST_USER.name,
					password: TEST_USER.password
				})
				.expect(400);
		});

		it("should throw an error for an empty password field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: TEST_USER.email,
					name: TEST_USER.name,
				})
				.expect(400);
		});

		it("should throw an error for a non-string password field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: TEST_USER.email,
					name: TEST_USER.name,
					password: 1234
				})
				.expect(400);
		});

		it("should throw an error for passwords of length 7 or less", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: TEST_USER.email,
					name: TEST_USER.name,
					password: "uhoh"
				})
				.expect(400);
		});

		it("should throw an error for an empty name field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: TEST_USER.email,
					password: TEST_USER.password
				})
				.expect(400);
		});

		it("should throw an error for a non-string name field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/register")
				.send({
					email: TEST_USER.email,
					name: 1234,
					password: TEST_USER.password
				})
				.expect(400);
		});

	});

	describe("POST api/auth/login", () => {
		it("should send a JWT token for the correct login credentials", async () => {
			// Login and capture JWT token
			const loginRes = await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: TEST_USER.email,
					password: TEST_USER.password,
				})
				.expect(200);

			const setCookieHeader = loginRes.headers["set-cookie"]?.[0];
			authToken = setCookieHeader.split(";")[0].split("=")[1];
			
			expect(typeof authToken).toBe("string");
			expect(authToken.length).toBeGreaterThan(0);

			expect(loginRes.body).toHaveProperty("data", "Logged out successfully.");
			expect(loginRes.body).toHaveProperty("error", null);
		});

		it("should throw an error for a non-registered email", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: "thisisnotregisteredtest123@email.com",
					password: TEST_USER.password,
				})
				.expect(404);
		});

		it("should throw an error for an incorrect password", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: TEST_USER.email,
					password: "thisisdefinitelyincorrect",
				})
				.expect(400);
		});

		it("should throw an error for an empty email field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					password: TEST_USER.password,
				})
				.expect(400);
		});

		it("should throw an error for an invalid email field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: "notanemail",
					password: TEST_USER.password,
				})
				.expect(400);
		});

		it("should throw an error for empty password field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: TEST_USER.email,
				})
				.expect(400);
		});

		it("should throw an error for a password of 7 characters or less", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: TEST_USER.email,
					password: "uhoh",
				})
				.expect(400);
		});

		it("should throw an error for a non-string password field", async () => {
			await request(app.getHttpServer())
				.post("/api/auth/login")
				.send({
					email: TEST_USER.email,
					password: 1234,
				})
				.expect(400);
		});

	});

	describe("GET api/auth/me", () => {
		it("should return user information for valid authenticated JWT token", async () => {
			const registerRes = await request(app.getHttpServer())
				.post("/api/auth/me")
				.set("Cookie", getCookieHeader(authToken))
				.expect(200);

			expect(registerRes.body).toHaveProperty("data");
			expect(registerRes.body).toHaveProperty("error");
			const returnedUser = registerRes.body.data;
			expect(registerRes.body.error).toBeNull;

			expect(returnedUser).toHaveProperty("email", TEST_USER.email);
			expect(typeof returnedUser.email).toBe("string");
			expect(returnedUser.email.length).toBeGreaterThan(0);
			
			expect(returnedUser).toHaveProperty("id");
			expect(typeof returnedUser.id).toBe("string");
			expect(returnedUser.id.length).toBeGreaterThan(0);
			
			expect(returnedUser).toHaveProperty("name", TEST_USER.name);
			expect(typeof returnedUser.name).toBe("string");
			expect(returnedUser.name.length).toBeGreaterThan(0);
		});

		it("should return 401 when accessing without authentication", async () => {
			await request(app.getHttpServer()).get("/api/auth/me").expect(401);
		});
		
		it("should return 401 with invalid JWT token", async () => {
			await request(app.getHttpServer())
				.get("/api/auth/me")
				.set("Cookie", getCookieHeader("invalid-token"))
				.expect(401);
		})
	});

	describe("POST api/auth/logout", () => {
		it("should remove the JWT auth token", async () => {
			const logoutRes = await request(app.getHttpServer())
				.post("/api/auth/logout")
				.expect(200);

			const setCookieHeader = logoutRes.headers["set-cookie"]?.[0];
			expect(setCookieHeader).toBeNull();

			expect(logoutRes.body).toHaveProperty("data", "Logged out successfully.");
			expect(logoutRes.body).toHaveProperty("error", null);
		});
	});

});