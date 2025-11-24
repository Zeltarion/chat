import {io, Socket} from 'socket.io-client';
import type {Store} from '@reduxjs/toolkit';

import type {RootState} from './store';
import {
  connectionStatusChanged,
  historyLoaded,
  messageReceived,
  activeUsersUpdated, roomLeft
} from './store/chatSlice';
import type {ChatMessage, ActiveUsersPayload, ChatErrorPayload} from './types/chat';
import {clearUsernameForRoom, setJoinError} from "./store/userSlice.ts";

const SOCKET_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

interface ChatHistoryPayload {
  roomId: string;
  messages: ChatMessage[];
}

interface ChatHistoryPayload {
  roomId: string;
  messages: ChatMessage[];
}

interface JoinPayload {
  roomId: string;
  username: string;
}

interface SendMessagePayload {
  roomId: string;
  text: string;
}

interface LeaveRoomPayload {
  roomId: string;
}

interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}

let socket: Socket | null = null;

export function initSocket(store: Store<RootState>) {
  socket = io(SOCKET_URL, {
    autoConnect: false
  });

  socket.on('connect', () => {
    store.dispatch(connectionStatusChanged('connected'));
  });

  socket.on('disconnect', () => {
    store.dispatch(connectionStatusChanged('disconnected'));
  });

  socket.on('chat:history', (payload: ChatHistoryPayload) => {
    store.dispatch(historyLoaded(payload));
  });

  socket.on('chat:message', (msg: ChatMessage) => {
    store.dispatch(messageReceived(msg));
  });

  socket.on('chat:system', (msg: ChatMessage) => {
    store.dispatch(messageReceived(msg));
  });

  socket.on('chat:users', (payload: ActiveUsersPayload) => {
    store.dispatch(activeUsersUpdated(payload));
  });

  socket.on('chat:error', (payload: ChatErrorPayload) => {
    console.error('Chat error:', payload);

    const state = store.getState();
    const roomId = state.chat.currentRoomId;

    if (!roomId) return;

    if (payload.event === 'chat:join') {
      store.dispatch(
        setJoinError({
          roomId,
          error: payload.message
        })
      );
      store.dispatch(roomLeft(roomId));
      store.dispatch(clearUsernameForRoom({ roomId }));
    }
  });

  socket.connect();
}

export function joinRoom(payload: JoinPayload) {
  if (!socket) return;
  socket.emit('chat:join', payload);
}

export function leaveRoom(payload: LeaveRoomPayload) {
  if (!socket) return;
  socket.emit('chat:leave', payload);
}

export function sendChatMessage(payload: SendMessagePayload) {
  if (!socket) return;
  socket.emit('chat:message', payload);
}

export function sendTyping(payload: TypingPayload) {
  if (!socket) return;
  socket.emit('chat:typing', payload);
}