import userReducer, {
  setUsernameForRoom,
  clearUsernameForRoom,
  setJoinError,
} from '../userSlice';

describe('userSlice', () => {
  it('should return initial state', () => {
    const state = userReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({
      usernameByRoom: {},
      joinErrorByRoom: {},
    });
  });

  it('setUsernameForRoom should set username for a room', () => {
    const initialState = {
      usernameByRoom: {},
      joinErrorByRoom: {},
    };

    const state = userReducer(
      initialState,
      setUsernameForRoom({ roomId: 'general', username: 'test' }),
    );

    expect(state.usernameByRoom.general).toBe('test');
  });

  it('setUsernameForRoom should override previous username', () => {
    const initialState = {
      usernameByRoom: { general: 'oldUser' },
      joinErrorByRoom: {},
    };

    const state = userReducer(
      initialState,
      setUsernameForRoom({ roomId: 'general', username: 'newUser' }),
    );

    expect(state.usernameByRoom.general).toBe('newUser');
  });

  it('clearUsernameForRoom should remove username for room', () => {
    const initialState = {
      usernameByRoom: { general: 'test' },
      joinErrorByRoom: {},
    };

    const state = userReducer(
      initialState,
      clearUsernameForRoom({ roomId: 'general' }),
    );

    expect(state.usernameByRoom.general).toBeUndefined();
  });

  it('setJoinError should set error for room', () => {
    const initialState = {
      usernameByRoom: {},
      joinErrorByRoom: {},
    };

    const state = userReducer(
      initialState,
      setJoinError({ roomId: 'general', error: 'Username already taken' }),
    );

    expect(state.joinErrorByRoom.general).toBe('Username already taken');
  });

  it('setJoinError should allow clearing error with null', () => {
    const initialState = {
      usernameByRoom: {},
      joinErrorByRoom: { general: 'Some error' },
    };

    const state = userReducer(
      initialState,
      setJoinError({ roomId: 'general', error: null }),
    );

    expect(state.joinErrorByRoom.general).toBeNull();
  });
});