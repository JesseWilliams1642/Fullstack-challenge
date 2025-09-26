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

    const error = typeof exceptionResponse === 'string'
      ? { message: exceptionResponse }
      : exceptionResponse;

    response.status(status).json({
      statusCode: status,
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}