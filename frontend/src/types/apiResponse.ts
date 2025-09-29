import type { AxiosError } from "axios";
import type { ErrorMessage } from "./errorMessage";

export interface APIResponse<T> {
	data: T | null;
	error: ErrorMessage | AxiosError | null;
}
