// For alerting a returned error to the user

import type { MessageInstance } from "antd/es/message/interface";

export function showError(error: any, message: MessageInstance) {

	let errorMessage = "";
	if (error?.message) errorMessage = error.message;
	if (error?.response?.data?.error?.message)
		errorMessage = error.response.data.error.message;
	if (error?.response?.data?.error?.message?.message)
		errorMessage = error.response.data.error.message.message;

	let status = "";
	if (error?.statusCode) status = error.statusCode.toString();
	if (error?.response?.data?.error?.statusCode)
		status = error.response.data.error.statusCode.toString();

	let timestamp = "";
	if (error?.timestamp) timestamp = error.timestamp;
	if (error?.response?.data?.error?.timestamp)
		timestamp = error.response.data.error.timestamp;

	const alertMessage = (
		<div style={{ textAlign: "left", marginLeft: "4px" }}>
			<span> <b> Request Has Failed  </b> </span> <br />
			<span> Status Code: {status} </span> <br />
			<span> Message: {errorMessage} </span> <br />
			<span> Timestamp: {timestamp} </span>
		</div>
	);

	message.error({
		content: alertMessage,
		duration: 20
	});
}
