import { ChatService } from './chat.service';
import { ChatMessage, SystemMessage, UserMessage } from './chat.types';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('client data', () => {
    it('setClientData should merge patches', () => {
      const id = 'socket-1';

      service.setClientData(id, { username: 'Sergey', roomId: 'room1' });
      service.setClientData(id, { roomId: 'room2' });

      const data = service.getClientData(id);
      expect(data).toEqual({ username: 'Sergey', roomId: 'room2' });
    });

    it('clearClientData should remove stored data', () => {
      const id = 'socket-1';

      service.setClientData(id, { username: 'Sergey', roomId: 'room1' });
      service.clearClientData(id);

      const data = service.getClientData(id);
      expect(data).toEqual({});
    });
  });

  describe('messages', () => {
    it('getRoomMessages should initialize empty history', () => {
      const history = service.getRoomMessages('room1');
      expect(history).toEqual([]);
    });

    it('appendSystemMessage should push system message', () => {
      const roomId = 'room1';
      const text = 'System event';

      const msg: SystemMessage = service.appendSystemMessage(roomId, text);

      expect(msg.type).toBe('system');
      expect(msg.text).toBe(text);
      expect(msg.roomId).toBe(roomId);
      expect(typeof msg.timestamp).toBe('string');

      const history: ChatMessage[] = service.getRoomMessages(roomId);
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(msg);
    });

    it('appendUserMessage should push user message', () => {
      const roomId = 'room1';
      const username = 'Sergey';
      const text = 'Hello';

      const msg: UserMessage = service.appendUserMessage(
        roomId,
        username,
        text,
      );

      expect(msg.type).toBe('message');
      expect(msg.username).toBe(username);
      expect(msg.text).toBe(text);
      expect(msg.roomId).toBe(roomId);

      const history = service.getRoomMessages(roomId);
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(msg);
    });
  });

  describe('room users', () => {
    it('addUserToRoom / getActiveUsers / removeUserFromRoom work together', () => {
      const roomId = 'general';

      service.addUserToRoom(roomId, 'socket-1', 'Sergey');
      service.addUserToRoom(roomId, 'socket-2', 'Bob');

      const payload = service.getActiveUsers(roomId);
      expect(payload.roomId).toBe(roomId);
      expect(payload.users).toHaveLength(2);

      const users = payload.users;
      const usernames = users.map((u) => u.username).sort();
      expect(usernames).toEqual(['Bob', 'Sergey']);

      service.removeUserFromRoom(roomId, 'socket-1');

      const payload2 = service.getActiveUsers(roomId);
      expect(payload2.users).toHaveLength(1);
      expect(payload2.users[0].username).toBe('Bob');
    });

    it('isUsernameTaken should detect duplicates in same room', () => {
      const roomId = 'general';

      service.addUserToRoom(roomId, 'socket-1', 'test');

      // The same user under the same ID is not a conflict
      expect(service.isUsernameTaken(roomId, 'test', 'socket-1')).toBe(false);

      // another socket with the same username - conflict
      expect(service.isUsernameTaken(roomId, 'test', 'socket-2')).toBe(true);

      // another name - no conflict
      expect(service.isUsernameTaken(roomId, 'test1', 'socket-2')).toBe(false);
    });
  });
});
