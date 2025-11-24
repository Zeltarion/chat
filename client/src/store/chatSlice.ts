import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

import type {ChatMessage, ActiveUsersPayload, RoomUser} from '../types/chat';

type ConnectionStatus = 'connected' | 'disconnected';

interface ChatState {
  currentRoomId: string | null;
  connectionStatus: ConnectionStatus;
  messagesByRoom: Record<string, ChatMessage[]>;
  activeUsersByRoom: Record<string, RoomUser[]>;
  joinedRooms: Record<string, boolean>;   // 🔹 новый флаг
}

const initialState: ChatState = {
  currentRoomId: null,
  connectionStatus: 'disconnected',
  messagesByRoom: {},
  activeUsersByRoom: {},
  joinedRooms: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentRoom(state, action: PayloadAction<string>) {
      const roomId = action.payload;
      state.currentRoomId = roomId;
      if (!state.messagesByRoom[roomId]) {
        state.messagesByRoom[roomId] = [];
      }
      if (!state.activeUsersByRoom[roomId]) {
        state.activeUsersByRoom[roomId] = [];
      }
      if (typeof state.joinedRooms[roomId] === 'undefined') {
        state.joinedRooms[roomId] = false;
      }
    },
    connectionStatusChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    historyLoaded(
      state,
      action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>
    ) {
      const { roomId, messages } = action.payload;
      state.messagesByRoom[roomId] = messages;
      state.joinedRooms[roomId] = true;
    },
    messageReceived(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const roomId = msg.roomId;
      if (!state.messagesByRoom[roomId]) {
        state.messagesByRoom[roomId] = [];
      }
      state.messagesByRoom[roomId].push(msg);
    },
    activeUsersUpdated(
      state,
      action: PayloadAction<ActiveUsersPayload>
    ) {
      const { roomId, users } = action.payload;
      state.activeUsersByRoom[roomId] = users;
    },
    roomLeft(state, action: PayloadAction<string>) {
      const roomId = action.payload;
      state.joinedRooms[roomId] = false;
      state.activeUsersByRoom[roomId] = [];
    }
  }
});

export const {
  setCurrentRoom,
  connectionStatusChanged,
  historyLoaded,
  messageReceived,
  activeUsersUpdated,
  roomLeft
} = chatSlice.actions;

export default chatSlice.reducer;