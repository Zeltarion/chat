export type MessageType = 'message' | 'system';

export interface BaseMessage {
  type: MessageType;
  text: string;
  timestamp: string; // ISO string
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
  id: string;
  username: string;
  isTyping: boolean;
}

export interface ActiveUsersPayload {
  roomId: string;
  users: RoomUser[];
}

export interface ChatErrorPayload {
  type: string;   // 'ws_error' e.g.
  event: string;  // 'chat:join', 'chat:message' ...
  message: string;
}