import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import {
	BadRequestException,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { User } from "../../user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { hashPassword, comparePassword } from "../../../common/utils";

jest.mock("../../../common/utils", () => ({
  ...jest.requireActual("../../../common/utils"),
  comparePassword: jest.fn(),
}));

describe("AuthService", () => {
	let service: AuthService;
	let mockUserRepository: jest.Mocked<any>;
	let mockJwt: jest.Mocked<any>;

	const mockUser = {
		id: "1afa573b-4c6c-4fb5-9aa9-adf48a7c90f0",
		name: "John Doe",
		email: "test@email.com",
		hashedPassword: "",
	} as User;

	const mockCredentials = {
		email: "test@email.com",
		password: "password",
	};

	beforeAll(async () => {
		mockUser.hashedPassword = await hashPassword("password");
	});

	beforeEach(async () => {
		mockUserRepository = {
			findOneBy: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
		};

		mockJwt = {
			signAsync: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: "USER_REPOSITORY",
					useValue: mockUserRepository,
				},
				{ provide: JwtService, useValue: mockJwt },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("login", () => {
		beforeAll(() => {
			(comparePassword as jest.Mock).mockResolvedValue(true);
		});

		beforeEach(() => {
			(comparePassword as jest.Mock).mockClear();
			jest.spyOn(service, 'signToken').mockResolvedValue({ jwtToken: 'signed-token' });
		});

		it("should return a JWT token for valid credentials", async () => {
			process.env.SALT_ROUNDS = "5";
			process.env.JWT_SECRET = "test-secret";
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.login(mockCredentials);
			expect(result).toEqual({ jwtToken: "signed-token" });
			expect(typeof result.jwtToken).toBe("string");

			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
				email: mockCredentials.email,
			});
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);

			expect(comparePassword).toHaveBeenCalledWith(
				mockCredentials.password,
				mockUser.hashedPassword,
			);
			expect(comparePassword).toHaveBeenCalledTimes(1);

			expect(service.signToken).toHaveBeenCalledWith(mockUser.id, mockUser.email);
			expect(service.signToken).toHaveBeenCalledTimes(1);
		});

		it("should throw NotFoundException if user is not found", async () => {
			process.env.SALT_ROUNDS = "5";
			const error = new NotFoundException("User was not found.");
			mockUserRepository.findOneBy.mockResolvedValue(null);

			await expect(service.login(mockCredentials)).rejects.toThrow(error);

			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
				email: mockCredentials.email,
			});
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(service.signToken).toHaveBeenCalledTimes(0);
		});

		it("should throw BadRequestException if password is incorrect", async () => {
			process.env.SALT_ROUNDS = "5";
			const error = new BadRequestException("Incorrect password.");
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);
			(comparePassword as jest.Mock).mockResolvedValue(false);

			await expect(service.login(mockCredentials)).rejects.toThrow(error);

			expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
				email: mockCredentials.email,
			});
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);

			expect(comparePassword).toHaveBeenCalledWith(
				mockCredentials.password,
				mockUser.hashedPassword,
			);
			expect(comparePassword).toHaveBeenCalledTimes(1);

			expect(service.signToken).toHaveBeenCalledTimes(0);
		});
	});

	describe("signToken", () => {
		it("should return a JWT token with correct payload", async () => {
			process.env.SALT_ROUNDS = "5";
			process.env.JWT_SECRET = "test-secret";
			mockJwt.signAsync.mockResolvedValue("signed-token");

			const token = await service.signToken(mockUser.id, mockUser.email);
			expect(token).toHaveProperty("jwtToken");
			expect(typeof token.jwtToken).toBe("string");
		});

		it("should throw an error if JWT_SECRET is not set", async () => {
			process.env.SALT_ROUNDS = "5";
			process.env.JWT_SECRET = "";
			const error = new InternalServerErrorException("JWT_SECRET must be set.");

			await expect(service.signToken(mockUser.id, mockUser.email)).rejects.toThrow(
				error,
			);
			expect(mockJwt.signAsync).toHaveBeenCalledTimes(0);
		});
	});

	describe("createUser", () => {
		process.env.SALT_ROUNDS = "5";
		it("should create a new user and return safe user data", async () => {
			mockUserRepository.findOneBy.mockResolvedValue(null);
			mockUserRepository.create.mockResolvedValue(mockUser);
			mockUserRepository.save.mockResolvedValue(mockUser);

			const result = await service.createUser(
				mockCredentials.email,
				mockCredentials.password,
				mockUser.name,
			);

			expect(result).toHaveProperty("id", mockUser.id);
			expect(typeof result.id).toBe("string");
			expect(result).toHaveProperty("email", mockUser.email);
			expect(typeof result.email).toBe("string");
			expect(result).toHaveProperty("name", mockUser.name);
			expect(typeof result.name).toBe("string");
			expect(result).not.toHaveProperty("hashedPassword");

			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
		});

		it("should throw an error if user with email already exists", async () => {
			process.env.SALT_ROUNDS = "5";
			const error = new BadRequestException("User is already registered.");
			mockUserRepository.findOneBy.mockResolvedValue(mockUser);

			await expect(
				service.createUser(
					mockCredentials.email,
					mockCredentials.password,
					mockUser.name,
				),
			).rejects.toThrow(error);
			expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.create).toHaveBeenCalledTimes(0);
			expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
		});
	});
});
