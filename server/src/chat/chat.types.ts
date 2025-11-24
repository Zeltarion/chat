export type MessageType = 'message' | 'system';

export interface BaseMessage {
  type: MessageType;
  text: string;
  timestamp: string; // ISO
  roomId: string;
}

export interface UserMessage extends BaseMessage {
  type: 'message';
  username: string;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
}

export type ChatMessage = UserMessage | SystemMessage;

export interface RoomUser {
  id: string; // socket.id
  username: string;
  isTyping: boolean;
}

export interface ActiveUsersPayload {
  roomId: string;
  users: RoomUser[];
}

export interface ChatClientData {
  username?: string;
  roomId?: string;
}
