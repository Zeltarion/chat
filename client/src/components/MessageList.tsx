import React from 'react';
import {Box, List, ListItem, ListItemText, Typography} from '@mui/material';

import {useAppSelector} from '../store/hooks';
import type {ChatMessage} from '../types/chat';

interface MessageListProps {
  roomId: string;
}

const MessageList: React.FC<MessageListProps> = ({roomId}) => {
  const messages: ChatMessage[] =
    useAppSelector((state) => state.chat.messagesByRoom[roomId]) || [];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1
      }}
    >
      <List dense>
        {messages.map((m, idx) => {
          const time = new Date(m.timestamp).toLocaleTimeString();

          if (m.type === 'system') {
            return (
              <ListItem key={idx}>
                <ListItemText
                  primary={
                    <Typography variant="caption" color="text.secondary">
                      [{time}] {m.text}
                    </Typography>
                  }
                />
              </ListItem>
            );
          }

          return (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>{m.username}</strong>: {m.text}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {time}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default MessageList;