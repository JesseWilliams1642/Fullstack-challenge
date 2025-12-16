import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { APIResponse } from "../types";

// Catches all other (unexpected) exceptions

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = exception instanceof HttpException ? (exception as HttpException).getStatus() : 500;

		const exceptionMessage: unknown =
			exception instanceof Error ? exception.message : "Internal server error";

		let message: string = "";
		if (typeof exceptionMessage === "string")  message = exceptionMessage;
		else if (Array.isArray(exceptionMessage)) message = exceptionMessage.join(", ");
		else if (typeof exceptionMessage === "object" && exceptionMessage != null) message = JSON.stringify(exceptionMessage);
		else message = "Internal server error";

		// Show error in console log

		const backendMessage: APIResponse<null> = {
			data: null,
			error: {
				statusCode: status,
				message: message,
				timestamp: new Date().toISOString(),
			}
		}
		console.log(backendMessage);

		// Do send exception.message for unknown error types
		// Do not want potential data leaks

		const responseMessage: APIResponse<null> = {
			data: null,
			error: {
				statusCode: status,
				message: "Internal server error",
				timestamp: new Date().toISOString(),
			}
		}

		response.status(status).json(responseMessage);
	}
}
