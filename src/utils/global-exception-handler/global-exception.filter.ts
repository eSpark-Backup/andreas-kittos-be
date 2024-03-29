import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default status code and error message
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal Server Error';

    if (exception instanceof HttpException) {
      // If it's an HttpException, extract the status code and error message
      statusCode = exception.getStatus();
      errorMessage = exception.getResponse() as string;
    } else if (exception instanceof Error) {
      // If it's a regular Error, log the error message
      errorMessage = exception.message as string;
      console.error(exception.message);
    }

    // Send the response with the appropriate status code and error message
    response.status(statusCode).json({
      statusCode,
      message: errorMessage,
    });
  }
}
