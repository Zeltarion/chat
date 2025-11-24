import { ArgumentsHost, Catch, LoggerService } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

type WsErrorPayload = {
  message?: string;
  event?: string;
  [key: string]: unknown;
};

@Catch(WsException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: WsException, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();
    const data: unknown = ctx.getData();

    const rawError: unknown = exception.getError();

    let message = 'Unknown WebSocket error';
    let event = 'unknown';

    if (typeof rawError === 'string') {
      message = rawError;
    } else if (typeof rawError === 'object' && rawError !== null) {
      const err = rawError as WsErrorPayload;

      if (typeof err.message === 'string') {
        message = err.message;
      }

      if (typeof err.event === 'string') {
        event = err.event;
      }
    }

    this.logger.error(
      `WsException from client ${client?.id || 'unknown'} on event "${event}": ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      JSON.stringify({
        context: 'WsExceptionsFilter',
        event,
        clientId: client?.id,
        data,
      }),
    );

    client.emit('chat:error', {
      type: 'ws_error',
      event,
      message,
    });
  }
}
