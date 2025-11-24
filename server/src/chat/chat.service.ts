import { Injectable, Logger } from '@nestjs/common';
import {
  ActiveUsersPayload,
  ChatClientData,
  ChatMessage,
  RoomUser,
  SystemMessage,
  UserMessage,
} from './chat.types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private readonly rooms = new Map<string, ChatMessage[]>();
  private readonly roomUsers = new Map<string, Map<string, RoomUser>>();
  private readonly clientsData = new Map<string, ChatClientData>();

  // ===== clients data =====

  getClientData(clientId: string): ChatClientData {
    return this.clientsData.get(clientId) ?? {};
  }

  setClientData(clientId: string, patch: ChatClientData): void {
    const prev = this.clientsData.get(clientId) ?? {};
    const next: ChatClientData = { ...prev, ...patch };
    this.clientsData.set(clientId, next);
  }

  clearClientData(clientId: string): void {
    this.clientsData.delete(clientId);
  }

  // ===== rooms / messages =====

  getRoomMessages(roomId: string): ChatMessage[] {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    return this.rooms.get(roomId)!;
  }

  appendSystemMessage(roomId: string, text: string): SystemMessage {
    const history = this.getRoomMessages(roomId);
    const systemMessage: SystemMessage = {
      type: 'system',
      text,
      timestamp: new Date().toISOString(),
      roomId,
    };
    history.push(systemMessage);
    return systemMessage;
  }

  appendUserMessage(
    roomId: string,
    username: string,
    text: string,
  ): UserMessage {
    const history = this.getRoomMessages(roomId);
    const msg: UserMessage = {
      type: 'message',
      username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      roomId,
    };
    history.push(msg);
    return msg;
  }

  // ===== room users =====

  getRoomUsersMap(roomId: string): Map<string, RoomUser> {
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Map());
    }
    return this.roomUsers.get(roomId)!;
  }

  addUserToRoom(roomId: string, clientId: string, username: string): void {
    const map = this.getRoomUsersMap(roomId);
    map.set(clientId, {
      id: clientId,
      username,
      isTyping: false,
    });
  }

  removeUserFromRoom(roomId: string, clientId: string): void {
    const map = this.roomUsers.get(roomId);
    if (!map) return;

    map.delete(clientId);
    if (map.size === 0) {
      this.roomUsers.delete(roomId);
    }
  }

  getActiveUsers(roomId: string): ActiveUsersPayload {
    const map = this.roomUsers.get(roomId);
    const users: RoomUser[] = map ? Array.from(map.values()) : [];
    return { roomId, users };
  }

  isUsernameTaken(
    roomId: string,
    username: string,
    currentClientId?: string,
  ): boolean {
    const map = this.roomUsers.get(roomId);
    if (!map) return false;

    const target = username.trim().toLowerCase();

    for (const user of map.values()) {
      const existing = user.username.trim().toLowerCase();

      if (existing === target && user.id !== currentClientId) {
        this.logger.debug(
          `Username "${username}" already taken in room "${roomId}" by client ${user.id}`,
        );
        return true;
      }
    }

    return false;
  }
}
