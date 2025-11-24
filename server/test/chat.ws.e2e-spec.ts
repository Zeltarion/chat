import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server as HttpServer } from 'http';
import type { AddressInfo } from 'node:net';
import { io, Socket } from 'socket.io-client';

import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { WsExceptionsFilter } from '../src/common/filters/ws-exceptions.filter';
import type { ActiveUsersPayload, SystemMessage } from '../src/chat/chat.types';

interface WsErrorPayload {
  type: string;
  event: string;
  message: string;
}

describe('ChatGateway (WebSocket e2e)', () => {
  let app: INestApplication;
  let url: string;
  const roomId = 'general';

  const connectClient = (): Promise<Socket> =>
    new Promise<Socket>((resolve, reject) => {
      const socket = io(url, {
        transports: ['websocket'],
        forceNew: true,
      });

      const onError = (err: Error) => {
        socket.off('connect', onConnect);
        reject(err);
      };

      const onConnect = () => {
        socket.off('connect_error', onError);
        resolve(socket);
      };

      socket.once('connect', onConnect);
      socket.once('connect_error', onError);
    });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false,
    });

    app.useGlobalFilters(
      new AllExceptionsFilter(new Logger(AllExceptionsFilter.name)),
      new WsExceptionsFilter(new Logger(WsExceptionsFilter.name)),
    );

    await app.init();
    await app.listen(0);

    const host = process.env.E2E_HOST ?? 'localhost';

    const httpServer = app.getHttpServer() as unknown as HttpServer;
    const address = httpServer.address() as AddressInfo;
    const port = address.port;

    url = `http://${host}:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect and join room', async () => {
    const client = await connectClient();

    const historyPromise = new Promise<{ roomId: string }>((resolve) => {
      client.once('chat:history', (payload: { roomId: string }) =>
        resolve(payload),
      );
    });

    client.emit('chat:join', { username: 'test', roomId });

    const history = await historyPromise;

    expect(history.roomId).toBe(roomId);

    client.disconnect();
  });

  it('should reject duplicate username in the same room', async () => {
    const client1 = await connectClient();
    const client2 = await connectClient();

    client1.emit('chat:join', { username: 'test', roomId });

    const errorPromise = new Promise<WsErrorPayload>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('chat:error was not emitted in time')),
        10000,
      );

      client2.once('chat:error', (payload: WsErrorPayload) => {
        clearTimeout(timer);
        resolve(payload);
      });
    });

    client2.emit('chat:join', { username: 'test', roomId });

    const errorPayload = await errorPromise;

    expect(errorPayload).toMatchObject({
      type: 'ws_error',
      event: 'chat:join',
      message: 'Username already taken in this room',
    });

    client1.disconnect();
    client2.disconnect();
  });

  it('should send "disconnected" system message and update users on client disconnect', async () => {
    const client1 = await connectClient();
    const client2 = await connectClient();

    // both log in
    client1.emit('chat:join', { username: 'test', roomId });
    client2.emit('chat:join', { username: 'test2', roomId });

    // We wait until client2 sees 2 active users.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Did not receive 2 active users in time')),
        5000,
      );

      client2.on('chat:users', (payload: ActiveUsersPayload) => {
        if (payload.roomId === roomId && payload.users.length === 2) {
          clearTimeout(timer);
          resolve();
        }
      });
    });

    // wait system "disconnected"
    const systemPromise = new Promise<SystemMessage>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('System "disconnected" message not received')),
        5000,
      );

      client2.once('chat:system', (msg: SystemMessage) => {
        clearTimeout(timer);
        resolve(msg);
      });
    });

    const usersPromise = new Promise<ActiveUsersPayload>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Active users update not received')),
        5000,
      );

      client2.on('chat:users', (payload: ActiveUsersPayload) => {
        if (payload.roomId === roomId && payload.users.length === 1) {
          clearTimeout(timer);
          resolve(payload);
        }
      });
    });

    // disconnect client1
    client1.disconnect();

    const [systemMsg, usersPayload] = await Promise.all([
      systemPromise,
      usersPromise,
    ]);

    expect(systemMsg.type).toBe('system');
    expect(systemMsg.roomId).toBe(roomId);
    expect(systemMsg.text).toContain('disconnected');

    expect(usersPayload.roomId).toBe(roomId);
    expect(usersPayload.users).toHaveLength(1);
    const remainingUsernames = usersPayload.users.map((u) => u.username).sort();
    expect(remainingUsernames).toEqual(['test2']);

    client2.disconnect();
  });
});
