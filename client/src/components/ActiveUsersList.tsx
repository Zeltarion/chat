import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider
} from '@mui/material';

import {useAppSelector} from '../store/hooks';
import type {RoomUser} from '../types/chat';

interface ActiveUsersListProps {
  roomId: string;
}

const ActiveUsersList: React.FC<ActiveUsersListProps> = ({roomId}) => {
  const users: RoomUser[] =
    useAppSelector((state) => state.chat.activeUsersByRoom[roomId]) || [];

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        minWidth: 170,
        maxWidth: 200,
        maxHeight: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="subtitle2" sx={{mb: 1}}>
        Active users ({users.length})
      </Typography>
      <Divider sx={{mb: 1}}/>
      {users.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No users in this room
        </Typography>
      ) : (
        <List dense sx={{overflowY: 'auto'}}>
          {users.map((u) => (
            <ListItem key={u.id}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {u.username}{' '}
                    {u.isTyping && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                      >
                        (typing…)
                      </Typography>
                    )}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ActiveUsersList;