import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server as HttpServer } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) should return { status: "ok" }', async () => {
    const httpServer = app.getHttpServer() as unknown as HttpServer;

    const res = await request(httpServer).get('/health').expect(200);

    expect(res.body).toEqual({ status: 'ok' });
  });
});
