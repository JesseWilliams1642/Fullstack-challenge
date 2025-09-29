// For alerting a returned error to the user

import type { ErrorMessage } from "../types/errorMessage";

export function showError(error: ErrorMessage) {
	alert(`Request has failed. Error report:\n\n${error}`);
}
