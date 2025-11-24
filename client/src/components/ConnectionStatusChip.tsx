import React from 'react';
import {Chip} from '@mui/material';

import {useAppSelector} from '../store/hooks';

const ConnectionStatusChip: React.FC = () => {
  const status = useAppSelector((state) => state.chat.connectionStatus);
  const color = status === 'connected' ? 'success' : 'error';

  return (
    <Chip size="small" label={status} color={color} variant="outlined"/>
  );
};

export default ConnectionStatusChip;