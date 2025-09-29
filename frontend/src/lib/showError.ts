// For alerting a returned error to the user

export function showError(error: any) {
	console.log(error);
	console.log(JSON.stringify(error));

	let message = "";
	if (error?.message) message = error.message;
	if (error?.response?.data?.error?.message)
		message = error.response.data.error.message;
	if (error?.response?.data?.error?.message?.message)
		message = error.response.data.error.message.message;

	let status = "";
	if (error?.statusCode) status = error.statusCode.toString();
	if (error?.response?.data?.error?.statusCode)
		status = error.response.data.error.statusCode.toString();

	let timestamp = "";
	if (error?.timestamp) timestamp = error.timestamp;
	if (error?.response?.data?.error?.timestamp)
		timestamp = error.response.data.error.timestamp;

	const alertMessage = `Request has failed. Error report:
    
Status Code: ${status}
Message: ${message}
Timestamp: ${timestamp}`;

	alert(alertMessage);
}
