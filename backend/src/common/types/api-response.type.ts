import { ErrorMessage } from "./error-message.type";

// To help distinguish between successful and unsuccessful responses

export interface APIResponse<T> {
	data: T | null;
	error: ErrorMessage | null;
}

// Response to health checks

export interface HealthResponse {
	status: string;
}
