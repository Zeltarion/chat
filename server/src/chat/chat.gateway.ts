import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SystemMessage, UserMessage } from './chat.types';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JoinDto, SendMessageDto, TypingDto, LeaveDto } from './chat.dto';
import { WsValidationPipe } from '../common/pipes/ws-validation.pipe';
import { WsExceptionsFilter } from '../common/filters/ws-exceptions.filter';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})
@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionsFilter(new Logger(WsExceptionsFilter.name)))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  private emitActiveUsers(roomId: string): void {
    const payload = this.chatService.getActiveUsers(roomId);
    this.server.to(roomId).emit('chat:users', payload);
  }

  private async leaveRoomInternal(
    client: Socket,
    roomId: string,
    reason: 'leave' | 'disconnect',
  ): Promise<void> {
    const { username } = this.chatService.getClientData(client.id);
    if (!username) return;

    const text =
      reason === 'leave'
        ? `${username} left the chat`
        : `${username} disconnected`;

    const systemMessage: SystemMessage = this.chatService.appendSystemMessage(
      roomId,
      text,
    );

    client.to(roomId).emit('chat:system', systemMessage);

    this.chatService.removeUserFromRoom(roomId, client.id);
    this.emitActiveUsers(roomId);

    await client.leave(roomId);
  }

  // ===== lifecycle =====

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected ${client.id}`);
    const { username, roomId } = this.chatService.getClientData(client.id);

    if (username && roomId) {
      await this.leaveRoomInternal(client, roomId, 'disconnect');
    }

    this.chatService.clearClientData(client.id);
  }

  // ===== events =====

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinDto,
  ): Promise<void> {
    const { username, roomId } = payload;
    const { roomId: prevRoomId } = this.chatService.getClientData(client.id);

    if (this.chatService.isUsernameTaken(roomId, username, client.id)) {
      throw new WsException({
        event: 'chat:join',
        message: 'Username already taken in this room',
      });
    }

    if (prevRoomId && prevRoomId !== roomId) {
      await this.leaveRoomInternal(client, prevRoomId, 'leave');
    }

    this.chatService.setClientData(client.id, { username, roomId });
    await client.join(roomId);

    const history = this.chatService.getRoomMessages(roomId);

    this.chatService.addUserToRoom(roomId, client.id, username);
    this.emitActiveUsers(roomId);

    client.emit('chat:history', {
      roomId,
      messages: history,
    });

    const systemMessage: SystemMessage = this.chatService.appendSystemMessage(
      roomId,
      `${username} joined the chat`,
    );

    this.server.to(roomId).emit('chat:system', systemMessage);
  }

  @SubscribeMessage('chat:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveDto,
  ): Promise<void> {
    const { roomId } = payload;
    const { roomId: currentRoomId } = this.chatService.getClientData(client.id);

    if (!roomId || roomId !== currentRoomId) {
      return;
    }

    await this.leaveRoomInternal(client, roomId, 'leave');
    this.chatService.setClientData(client.id, { roomId: undefined });
  }

  @SubscribeMessage('chat:message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ): void {
    const { roomId, text } = payload;
    const { username, roomId: currentRoomId } = this.chatService.getClientData(
      client.id,
    );

    const activeRoomId = roomId || currentRoomId;

    if (!username || !activeRoomId) {
      throw new WsException({
        event: 'chat:message',
        message: 'User is not in a room',
      });
    }

    const msg: UserMessage = this.chatService.appendUserMessage(
      activeRoomId,
      username,
      text,
    );

    this.server.to(activeRoomId).emit('chat:message', msg);
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingDto,
  ): void {
    const { roomId, isTyping } = payload;
    const { roomId: currentRoomId, username } = this.chatService.getClientData(
      client.id,
    );

    if (!roomId || roomId !== currentRoomId || !username) {
      throw new WsException({
        event: 'chat:typing',
        message: 'User is not in this room',
      });
    }

    const map = this.chatService.getRoomUsersMap(roomId);
    const user = map.get(client.id);
    if (!user) {
      throw new WsException({
        event: 'chat:typing',
        message: 'User not found in room users map',
      });
    }

    user.isTyping = isTyping;
    map.set(client.id, user);
    this.emitActiveUsers(roomId);
  }
}
