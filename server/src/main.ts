import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Simple chat backend (health, etc.)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const bootstrapLogger = new Logger('Bootstrap');

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
  const port = parseInt(process.env.SERVER_PORT ?? '4000', 10);

  app.enableCors({
    origin: clientUrl,
    methods: ['GET', 'POST'],
    credentials: false,
  });

  app.useGlobalFilters(
    new AllExceptionsFilter(new Logger(AllExceptionsFilter.name)),
  );

  await app.listen(port);
  bootstrapLogger.log(`NestJS server listening on http://localhost:${port}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    bootstrapLogger.warn(`Received ${signal}. Shutting down gracefully...`);
    try {
      await app.close();
      bootstrapLogger.log('HTTP server closed.');
      process.exit(0);
    } catch (err) {
      const e = err as Error;
      bootstrapLogger.error(`Error during shutdown: ${e.message}`, e.stack);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}
void bootstrap();
