import React, {useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Button
} from '@mui/material';

import {useAppDispatch, useAppSelector} from '../store/hooks';
import {roomLeft, setCurrentRoom} from '../store/chatSlice';
import {setUsernameForRoom, clearUsernameForRoom} from '../store/userSlice';
import {joinRoom, leaveRoom, sendChatMessage} from '../socket';

import ConnectionStatusChip from './ConnectionStatusChip';
import UsernameForm from './UsernameForm';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ActiveUsersList from './ActiveUsersList';

interface RouteParams extends Record<string, string | undefined> {
  roomId: string;
}

const ChatPage: React.FC = () => {
  const {roomId} = useParams<RouteParams>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentRoomId = roomId ?? 'general';

  const username = useAppSelector(
    (state) => state.user.usernameByRoom[currentRoomId]
  );

  const joinError = useAppSelector(
    (state) => state.user.joinErrorByRoom[currentRoomId] ?? null
  );

  const hasJoined = useAppSelector(
    (state) => state.chat.joinedRooms[currentRoomId] === true
  );

  const showChat = Boolean(username && hasJoined);

  const connectionStatus = useAppSelector(
    (state) => state.chat.connectionStatus
  );

  useEffect(() => {
    dispatch(setCurrentRoom(currentRoomId));
  }, [currentRoomId, dispatch]);

  useEffect(() => {
    if (username && connectionStatus === 'connected') {
      joinRoom({roomId: currentRoomId, username});
    }
  }, [currentRoomId, username, connectionStatus]);

  const handleUsernameSubmit = ({username}: { username: string }) => {
    dispatch(setUsernameForRoom({roomId: currentRoomId, username}));
  };

  const handleSendMessage = (text: string) => {
    sendChatMessage({roomId: currentRoomId, text});
  };

  const handleLeaveChat = () => {
    leaveRoom({roomId: currentRoomId});
    dispatch(clearUsernameForRoom({roomId: currentRoomId}));
    dispatch(roomLeft(currentRoomId));
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{mt: 4}}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '80vh'
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Room: {currentRoomId}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ConnectionStatusChip/>
            <Button
              size="small"
              variant="outlined"
              onClick={handleLeaveChat}
            >
              Leave
            </Button>
          </Stack>
        </Stack>

        {!showChat ? (
          <UsernameForm
            onSubmit={handleUsernameSubmit}
            errorMessage={joinError}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0
            }}
          >
            <Typography variant="subtitle2" sx={{mb: 1}}>
              You are logged in as <strong>{username}</strong>
            </Typography>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <MessageList roomId={currentRoomId}/>
              </Box>

              <ActiveUsersList roomId={currentRoomId}/>
            </Box>

            <MessageInput onSend={handleSendMessage} roomId={currentRoomId}/>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ChatPage;