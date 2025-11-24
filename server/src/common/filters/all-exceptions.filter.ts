import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

type HttpErrorResponse =
  | string
  | {
      message?: string | string[];
      [key: string]: unknown;
    };

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctxType = host.getType<'http' | 'ws' | 'rpc'>();

    if (ctxType !== 'http') {
      return;
    }

    const httpCtx = host.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseMessage: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse() as HttpErrorResponse;

      if (typeof res === 'string') {
        responseMessage = res;
      } else if (res && typeof res === 'object') {
        const msg = res.message;
        if (typeof msg === 'string' || Array.isArray(msg)) {
          responseMessage = msg;
        } else {
          responseMessage = res;
        }
      }
    }

    const logPayload = {
      status,
      path: request.url,
      method: request.method,
      query: request.query as unknown,
      body: request.body as unknown,
    };

    this.logger.error(
      exception.message,
      exception.stack,
      JSON.stringify(logPayload),
    );

    response.status(status).json({
      statusCode: status,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
