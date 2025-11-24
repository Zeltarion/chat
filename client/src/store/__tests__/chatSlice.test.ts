import chatReducer, {
  setCurrentRoom,
  connectionStatusChanged,
  historyLoaded,
  messageReceived,
  activeUsersUpdated,
  roomLeft,
} from '../chatSlice';
import type { ChatMessage, ActiveUsersPayload } from '../../types/chat';

describe('chatSlice', () => {
  it('should handle initial state', () => {
    const state = chatReducer(undefined, { type: '@@INIT' });
    expect(state.connectionStatus).toBe('disconnected');
    expect(state.currentRoomId).toBeNull();
  });

  it('setCurrentRoom should initialize maps for this room', () => {
    const state = chatReducer(undefined, setCurrentRoom('general'));

    expect(state.currentRoomId).toBe('general');
    expect(state.messagesByRoom.general).toEqual([]);
    expect(state.activeUsersByRoom.general).toEqual([]);
    expect(state.joinedRooms.general).toBe(false);
  });

  it('connectionStatusChanged should update status', () => {
    const state = chatReducer(
      undefined,
      connectionStatusChanged('connected'),
    );
    expect(state.connectionStatus).toBe('connected');
  });

  it('historyLoaded should set messages and mark room as joined', () => {
    const messages: ChatMessage[] = [
      {
        type: 'system',
        text: 'welcome',
        timestamp: new Date().toISOString(),
        roomId: 'general',
      },
    ];

    const state = chatReducer(
      undefined,
      historyLoaded({ roomId: 'general', messages }),
    );

    expect(state.messagesByRoom.general).toEqual(messages);
    expect(state.joinedRooms.general).toBe(true);
  });

  it('messageReceived should append message to room', () => {
    const initial = chatReducer(
      undefined,
      setCurrentRoom('general'),
    );

    const msg: ChatMessage = {
      type: 'message',
      username: 'test',
      text: 'Hello',
      timestamp: new Date().toISOString(),
      roomId: 'general',
    };

    const state = chatReducer(initial, messageReceived(msg));

    expect(state.messagesByRoom.general).toHaveLength(1);
    expect(state.messagesByRoom.general[0]).toEqual(msg);
  });

  it('activeUsersUpdated should replace users list for room', () => {
    const initial = chatReducer(
      undefined,
      setCurrentRoom('general'),
    );

    const payload: ActiveUsersPayload = {
      roomId: 'general',
      users: [
        { id: '1', username: 'A', isTyping: false },
        { id: '2', username: 'B', isTyping: true },
      ],
    };

    const state = chatReducer(initial, activeUsersUpdated(payload));
    expect(state.activeUsersByRoom.general).toHaveLength(2);
  });

  it('roomLeft should mark room as not joined and clear active users', () => {
    let state = chatReducer(
      undefined,
      setCurrentRoom('general'),
    );

    state = chatReducer(
      state,
      activeUsersUpdated({
        roomId: 'general',
        users: [{ id: '1', username: 'A', isTyping: false }],
      }),
    );

    state = chatReducer(state, roomLeft('general'));

    expect(state.joinedRooms.general).toBe(false);
    expect(state.activeUsersByRoom.general).toEqual([]);
  });
});