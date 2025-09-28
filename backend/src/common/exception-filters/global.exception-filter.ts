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

		// Check exception response type; send message accordingly

		if (typeof exceptionResponse === "string") {
			// Log to backend console
			console.log({
				statusCode: status,
				message: exceptionResponse,
				timestamp: new Date().toISOString(),
			});

			// Send exception response to frontend
			response.status(status).json({
				statusCode: status,
				message: exceptionResponse,
				timestamp: new Date().toISOString(),
			});
		} else {
			// Log to backend console
			console.log({
				statusCode: status,
				...exceptionResponse,
				timestamp: new Date().toISOString(),
			});

			// Send exception response to frontend
			response.status(status).json({
				...exceptionResponse,
				timestamp: new Date().toISOString(),
			});
		}
	}
}
