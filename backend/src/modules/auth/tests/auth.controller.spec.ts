import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { AuthDTO } from "../dto";
import { NotFoundException } from "@nestjs/common/exceptions/not-found.exception";
import { BadRequestException } from "@nestjs/common/exceptions/bad-request.exception";
import { SafeUser } from "src/common/types";
describe("AuthController", () => {
	let controller: AuthController;
	let mockAuthService: jest.Mocked<AuthService>;

	const mockCredentials: AuthDTO = {
		email: "testtest123@gmail.com",
		password: "password",
	};

	const mockUser: SafeUser = {
		id: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f0",
		name: "John Doe",
		email: "tester@gmail.com",
	};

	beforeEach(async () => {
		// Must be cast as jest.Mocked<AuthService> to satisfy TypeScript type checking for mocked methods
		// Can't set as a partial mock else TypeScript will throw errors about missing methods when we try to mock getServices()
		mockAuthService = {
			login: jest.fn(),
			addUser: jest.fn(),
			createUser: jest.fn(),
		} as unknown as jest.Mocked<AuthService>;

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService],
		})
			.overrideProvider(AuthService)
			.useValue(mockAuthService)
			.compile();

		controller = module.get<AuthController>(AuthController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("login", () => {
		it("should return a JWT token on successful login", async () => {
			mockAuthService.login.mockResolvedValue({ jwtToken: "mock-jwt-token" });
			const mockRes = {
				cookie: jest.fn(),
			} as any;

			const result = await controller.login(mockCredentials, mockRes);
			expect(result).toEqual({
				data: "Logged in successfully.",
				error: null,
			});
			expect(mockAuthService.login).toHaveBeenCalledWith(mockCredentials);
			expect(mockRes.cookie).toHaveBeenCalledWith(
				"JWT_fullstack",
				"mock-jwt-token",
				expect.any(Object),
			);
		});

		it("should throw NotFoundException if user is not found", async () => {
			const error = new NotFoundException("User was not found.");
			mockAuthService.login.mockRejectedValue(error);

			await expect(controller.login(mockCredentials, {} as any)).rejects.toThrow(
				error,
			);
			expect(mockAuthService.login).toHaveBeenCalledTimes(1);
		});

		it("should throw BadRequestException if password is incorrect", async () => {
			const error = new BadRequestException("Incorrect password.");
			mockAuthService.login.mockRejectedValue(error);

			await expect(controller.login(mockCredentials, {} as any)).rejects.toThrow(
				error,
			);
			expect(mockAuthService.login).toHaveBeenCalledTimes(1);
		});
	});

	describe("logout", () => {
		it("should clear the JWT cookie on logout", async () => {
			let mockRes = {
				clearCookie: jest.fn(),
			} as any;

			const result = await controller.logout(mockRes);
			expect(result).toEqual({
				data: "Logged out successfully.",
				error: null,
			});
			expect(mockRes.clearCookie).toHaveBeenCalledWith("JWT_fullstack");
		});
	});

	describe("register", () => {
		it("should create a new user and return the user data", async () => {
			mockAuthService.createUser.mockResolvedValue(mockUser);
			const mockRegisterDTO = {
				email: mockUser.email,
				password: "password",
				name: mockUser.name,
			};

			const result = await controller.addUser(mockRegisterDTO);
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("error");
			expect(result.data).toEqual(mockUser);
			expect(mockAuthService.createUser).toHaveBeenCalledTimes(1);
			expect(result.data).toHaveProperty("id", mockUser.id);
			expect(result.data).toHaveProperty("email", mockUser.email);
			expect(result.data).toHaveProperty("name", mockUser.name);
			expect(mockAuthService.createUser).toHaveBeenCalledWith(
				mockRegisterDTO.email,
				mockRegisterDTO.password,
				mockRegisterDTO.name,
			);
		});

		it("should throw BadRequestException if user is already registered", async () => {
			const error = new BadRequestException("User is already registered.");
			mockAuthService.createUser.mockRejectedValue(error);

			const mockRegisterDTO = {
				email: mockUser.email,
				password: "password",
				name: mockUser.name,
			};

			await expect(controller.addUser(mockRegisterDTO)).rejects.toThrow(error);
			expect(mockAuthService.createUser).toHaveBeenCalledTimes(1);
		});
	});

	describe("me", () => {
		it("should return the current user's data when authenticated", async () => {
			const result = await controller.getUser(mockUser);
			expect(result).toHaveProperty("data");
			expect(result).toHaveProperty("error");
			expect(result.data).toEqual(mockUser);
			expect(result.data).toHaveProperty("id", mockUser.id);
			expect(result.data).toHaveProperty("email", mockUser.email);
			expect(result.data).toHaveProperty("name", mockUser.name);
		});
	});
});
