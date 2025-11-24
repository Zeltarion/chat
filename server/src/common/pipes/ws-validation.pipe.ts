import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

type HttpValidationErrorResponse =
  | string
  | {
      message?: string | string[];
      [key: string]: unknown;
    };

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }

  private resolveEvent(metadata: ArgumentMetadata): string {
    const metatype = metadata.metatype as { name?: string } | undefined;
    const name = metatype?.name ?? 'unknown';

    // JoinDto -> join; MessageDto -> message; TypingDto -> typing
    const base = name.replace(/Dto$/, '').toLowerCase();

    return `chat:${base}`;
  }

  override async transform<T>(
    value: T,
    metadata: ArgumentMetadata,
  ): Promise<T> {
    try {
      const transformed = (await super.transform(
        value,
        metadata,
      )) as unknown as T;

      return transformed;
    } catch (err) {
      if (err instanceof BadRequestException) {
        const event = this.resolveEvent(metadata);

        const res = err.getResponse() as HttpValidationErrorResponse;

        let messages: string[];

        if (typeof res === 'string') {
          messages = [res];
        } else if (Array.isArray(res.message)) {
          messages = res.message.map((m) => String(m));
        } else if (typeof res.message === 'string') {
          messages = [res.message];
        } else {
          messages = ['Validation failed'];
        }

        throw new WsException({
          event,
          message: 'Validation failed',
          errors: messages,
        });
      }

      throw err;
    }
  }
}
