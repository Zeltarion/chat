import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Container, Typography, Stack, Paper} from '@mui/material';

const ROOMS = [
  {id: 'general', name: 'General chat'},
  {id: 'random', name: 'Random chat'}
];

const RoomListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{mt: 4}}>
      <Paper sx={{p: 3}}>
        <Typography variant="h5" gutterBottom>
          Select a chat room
        </Typography>
        <Stack spacing={2} sx={{mt: 2}}>
          {ROOMS.map((room) => (
            <Button
              key={room.id}
              variant="outlined"
              onClick={() => navigate(`/room/${room.id}`)}
            >
              {room.name}
            </Button>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default RoomListPage;