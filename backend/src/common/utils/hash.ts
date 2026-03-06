import { InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

// Hashes password using bcrypt

export const hashPassword = async (password: string): Promise<string> => {
	const saltRounds: number = Number(process.env.SALT_ROUNDS);
	if (isNaN(saltRounds))
		throw new InternalServerErrorException("Salt rounds should be a number.");
	return await bcrypt.hash(password, saltRounds);
};

// Compares a plaintext password with a hashed password

export const comparePassword = async (
	password: string,
	hash: string,
): Promise<boolean> => {
	return await bcrypt.compare(password, hash);
};
