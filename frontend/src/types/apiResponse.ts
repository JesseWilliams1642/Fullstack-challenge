export interface APIResponse<T> {
	data: T | null;
	error: Error | null;
}
