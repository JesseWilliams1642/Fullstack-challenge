import type { ErrorMessage } from "./errorMessage";

export interface APIResponse<T> {
	data: T | null;
	error: ErrorMessage | null;
}
