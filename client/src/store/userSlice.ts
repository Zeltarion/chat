import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  usernameByRoom: Record<string, string | undefined>;
  joinErrorByRoom: Record<string, string | null>;
}

const initialState: UserState = {
  usernameByRoom: {},
  joinErrorByRoom: {}
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsernameForRoom(
      state,
      action: PayloadAction<{ roomId: string; username: string }>
    ) {
      const { roomId, username } = action.payload;
      state.usernameByRoom[roomId] = username;
      state.joinErrorByRoom[roomId] = null;
    },
    clearUsernameForRoom(state, action: PayloadAction<{ roomId: string }>) {
      const { roomId } = action.payload;
      state.usernameByRoom[roomId] = undefined;
      state.joinErrorByRoom[roomId] = null;
    },
    setJoinError(
      state,
      action: PayloadAction<{ roomId: string; error: string | null }>
    ) {
      const { roomId, error } = action.payload;
      state.joinErrorByRoom[roomId] = error;
      if (error) {
        state.usernameByRoom[roomId] = undefined;
      }
    }
  }
});

export const {
  setUsernameForRoom,
  clearUsernameForRoom,
  setJoinError
} = userSlice.actions;

export default userSlice.reducer;