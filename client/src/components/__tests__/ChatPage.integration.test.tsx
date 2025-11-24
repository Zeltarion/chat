import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '../../test-utils';
import type { RootState } from '../../store';
import ChatPage from '../ChatPage';
import { joinRoom, leaveRoom, sendChatMessage } from '../../socket';

vi.mock('../../socket', () => ({
  joinRoom: vi.fn(),
  leaveRoom: vi.fn(),
  sendChatMessage: vi.fn(),
  sendTyping: vi.fn(),
  initSocket: vi.fn(),
}));

describe('ChatPage integration', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows username form when not joined', () => {
    const preloadedState: RootState = {
      chat: {
        currentRoomId: null,
        connectionStatus: 'connected',
        messagesByRoom: {},
        activeUsersByRoom: {},
        joinedRooms: {},
      },
      user: {
        usernameByRoom: {},
        joinErrorByRoom: {},
      },
    };

    renderWithProviders(<ChatPage />, {
      route: '/rooms/general',
      preloadedState,
    });

    expect(
      screen.getByRole('button', { name: /join/i }),
    ).toBeInTheDocument();
  });

  it('auto joins room when username already set', async () => {
    const preloadedState: RootState = {
      chat: {
        currentRoomId: null,
        connectionStatus: 'connected',
        messagesByRoom: {},
        activeUsersByRoom: {},
        joinedRooms: {},
      },
      user: {
        usernameByRoom: { general: 'test' },
        joinErrorByRoom: {},
      },
    };

    renderWithProviders(<ChatPage />, {
      route: '/rooms/general',
      preloadedState,
    });

    await waitFor(() => {
      expect(joinRoom).toHaveBeenCalledWith({
        roomId: 'general',
        username: 'test',
      });
    });
  });

  it('allows sending message when in room', async () => {
    const user = userEvent.setup();

    const preloadedState: RootState = {
      chat: {
        currentRoomId: 'general',
        connectionStatus: 'connected',
        messagesByRoom: { general: [] },
        activeUsersByRoom: { general: [] },
        joinedRooms: { general: true },
      },
      user: {
        usernameByRoom: { general: 'test' },
        joinErrorByRoom: {},
      },
    };

    renderWithProviders(<ChatPage />, {
      route: '/rooms/general',
      preloadedState,
    });

    expect(
      screen.getByText(/you are logged in as/i),
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello world');
    await user.click(sendButton);

    expect(sendChatMessage).toHaveBeenCalledWith({
      roomId: 'general',
      text: 'Hello world',
    });
  });

  it('calls leaveRoom and navigates back on Leave click', async () => {
    const user = userEvent.setup();

    const preloadedState: RootState = {
      chat: {
        currentRoomId: 'general',
        connectionStatus: 'connected',
        messagesByRoom: { general: [] },
        activeUsersByRoom: { general: [] },
        joinedRooms: { general: true },
      },
      user: {
        usernameByRoom: { general: 'test' },
        joinErrorByRoom: {},
      },
    };

    const { store } = renderWithProviders(<ChatPage />, {
      route: '/rooms/general',
      preloadedState,
    });

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await user.click(leaveButton);

    expect(leaveRoom).toHaveBeenCalledWith({ roomId: 'general' });

    const state = store.getState() as RootState;
    expect(state.user.usernameByRoom.general).toBeUndefined();
  });
});