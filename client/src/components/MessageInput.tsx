import React from 'react';
import {useForm} from 'react-hook-form';
import {Box, Button, TextField} from '@mui/material';

import {useTyping} from '../hooks/useTyping';

interface MessageInputProps {
  onSend: (text: string) => void;
  roomId: string;
}

interface FormValues {
  text: string;
}

const MessageInput: React.FC<MessageInputProps> = ({onSend, roomId}) => {
  const {register, handleSubmit, reset} = useForm<FormValues>({
    defaultValues: {
      text: ''
    }
  });

  const {handleTextChange, stopTyping} = useTyping(roomId);

  const {
    ref,
    onChange: rhfOnChange,
    ...restFieldProps
  } = register('text');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // RHF update state of field
    rhfOnChange(event);

    handleTextChange(value);
  };

  const submit = (values: FormValues) => {
    const trimmed = values.text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    reset({text: ''});

    stopTyping();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submit)}
      sx={{display: 'flex', gap: 1}}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        inputRef={ref}
        onChange={handleChange}
        {...restFieldProps}
      />
      <Button type="submit" variant="contained">
        Send
      </Button>
    </Box>
  );
};

export default MessageInput;