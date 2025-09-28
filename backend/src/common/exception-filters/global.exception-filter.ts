import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from "@nestjs/common";
import { Response } from "express";

// Catches all HTTP exceptions (those that we throw)

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		let consoleLogMessage: Object = {};
		let frontendLogMessage: Object = {};
		let frontendMessage: string | Object = exceptionResponse;

		// Determine error payload type
		if (typeof exceptionResponse === "string") {
			consoleLogMessage = {
				statusCode: status,
				message: exceptionResponse,
				timestamp: new Date().toISOString(),
			};

			// Do not give frontend data on internal server errors
			if (status === 500) frontendMessage = "Internal server error";

			frontendLogMessage = {
				statusCode: status,
				message: frontendMessage,
				timestamp: new Date().toISOString(),
			};
		} else {
			consoleLogMessage = {
				statusCode: status,
				...exceptionResponse,
				timestamp: new Date().toISOString(),
			};

			// Do not give frontend data on internal server errors
			if (status === 500) frontendMessage = { message: "Internal server error" };

			frontendLogMessage = {
				statusCode: status,
				...(frontendMessage as Object),
				timestamp: new Date().toISOString(),
			};
		}

		// Send message to backend console
		console.log(consoleLogMessage);

		// Send message to frontend
		response.status(status).json(frontendLogMessage);
	}
}
