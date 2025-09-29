import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { ErrorMessage } from "../types/error-message.type";

// Catches all HTTP exceptions (those that we throw)

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		// Do not give frontend data on internal server errors
		let frontendMessage: string | Object = exceptionResponse;
		if (status === 500) frontendMessage = "Internal server error";

		const consoleLogMessage: ErrorMessage = {
			statusCode: status,
			message: exceptionResponse,
			timestamp: new Date().toISOString(),
		};

		const frontendLogMessage: ErrorMessage = {
			statusCode: status,
			message: frontendMessage,
			timestamp: new Date().toISOString(),
		};

		// Send message to backend console
		console.log({ data: null, error: consoleLogMessage });

		// Send message to frontend
		response.status(status).json({ data: null, error: frontendLogMessage});
	}
}
