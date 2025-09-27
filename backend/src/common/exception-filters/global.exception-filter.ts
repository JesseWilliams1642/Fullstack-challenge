import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

// Catches all HTTP exceptions (those that we throw)

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === "string")

      response.status(status).json({
        statusCode: status,
        message: exceptionResponse,
        timestamp: new Date().toISOString(),
      });

    else 

      response.status(status).json({
        ...exceptionResponse,
        timestamp: new Date().toISOString(),
      });

  }
}