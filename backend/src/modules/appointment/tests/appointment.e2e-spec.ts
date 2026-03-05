import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import cookieParser from "cookie-parser";
import { AppointmentModule } from "../appointment.module";
import { AuthModule } from "../../auth/auth.module";
import { GetAppointmentAvailabilityDTO } from "../dto";
import { ServiceService } from "src/modules/service/service.service";
import { StaffService } from "src/modules/staff/staff.service";

describe("Appointment Module (e2e)", () => {
	let app: INestApplication;
	let authToken: string;

	let serviceService: ServiceService;
	let staffService: StaffService;

	let staffId: string;
	let serviceId: string;

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
			imports: [AppointmentModule, AuthModule],
			providers: [ServiceService, StaffService],
		}).compile();

		app = module.createNestApplication();
		app.use(cookieParser());
		await app.init();

		serviceService = module.get<ServiceService>(ServiceService);
		staffService = module.get<StaffService>(StaffService);

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

		// Get test service and staff IDs for appointment availability tests
		const services = await serviceService.getServices();
		const staffs = await staffService.getStaff();

		if (services.length === 0 || staffs.length === 0) {
			throw new Error("No services or staff found in the database for testing");
		}
		serviceId = services[0].id;
		staffId = staffs[0].id;
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

	describe("GET /api/appointment", () => {
		it("should return all appointment times with valid structure when authenticated", async () => {
			const testDTO: GetAppointmentAvailabilityDTO = {
				date: new Date("2024-02-27").toISOString(),
				serviceID: serviceId,
				staffID: staffId,
			};

			const res = await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({ dto: JSON.stringify(testDTO) })
				.expect(200);

			expect(res.body).toHaveProperty("data");
			expect(res.body).toHaveProperty("error");
			expect(res.body.error).toBeNull();
			expect(res.body.data.length).toBeGreaterThanOrEqual(0);
			expect(res.body.data).toBeInstanceOf(Array<string>);
		});

		it("should return 401 when accessing without authentication", async () => {
			await request(app.getHttpServer()).get("/api/appointment").expect(401);
		});

		it("should return 401 with invalid JWT token", async () => {
			await request(app.getHttpServer())
				.get("/api/service")
				.set("Cookie", getCookieHeader("invalid-token"))
				.expect(401);
		});

		it("should return 400 for non-UUID serviceID", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: new Date("2024-02-27").toISOString(),
						serviceID: "invalid-uuid",
						staffID: staffId,
					}),
				})
				.expect(400);
		});

		it("should return 400 for empty serviceID", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: new Date("2024-02-27").toISOString(),
						staffID: staffId,
					}),
				})
				.expect(400);
		});

		it("should return 400 for non-UUID staffID", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: new Date("2024-02-27").toISOString(),
						serviceID: serviceId,
						staffID: "invalid-uuid",
					}),
				})
				.expect(400);
		});

		it("should return 400 for empty staffID", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: new Date("2024-02-27").toISOString(),
						serviceID: serviceId,
					}),
				})
				.expect(400);
		});

		it("should return 400 for non-ISO8601 date", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: "invalid-date",
						serviceID: serviceId,
						staffID: staffId,
					}),
				})
				.expect(400);
		});

		it("should return 400 for empty date", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						serviceID: serviceId,
						staffID: staffId,
					}),
				})
				.expect(400);
		});

		it("should return 400 for non-UUID serviceID", async () => {
			await request(app.getHttpServer())
				.get("/api/appointment")
				.set("Cookie", getCookieHeader(authToken))
				.query({
					dto: JSON.stringify({
						date: new Date("2024-02-27").toISOString(),
						serviceID: serviceId,
						staffID: staffId,
						appointmentId: "invalid-uuid",
					}),
				})
				.expect(400);
		});
	});
});
