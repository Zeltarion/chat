import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField, Typography } from '@mui/material';

interface UsernameFormProps {
  onSubmit: (data: { username: string }) => void;
  errorMessage?: string | null;
}

interface FormValues {
  username: string;
}

const UsernameForm: React.FC<UsernameFormProps> = ({
  onSubmit,
  errorMessage
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: { username: '' }
  });

  const submit = (values: FormValues) => {
    onSubmit({ username: values.username.trim() });
  };

  const fieldError = errors.username?.message || errorMessage || '';

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2
      }}
    >
      <Typography variant="subtitle1">
        Enter a username to join this room
      </Typography>

      <TextField
        label="Username"
        size="small"
        fullWidth
        autoFocus
        {...register('username', {
          required: 'Username is required',
          validate: (value) =>
            value.trim().length > 0 || 'Username cannot be empty'
        })}
        error={!!fieldError}
        helperText={fieldError || 'Must be unique in this room'}
      />

      <Button type="submit" variant="contained">
        Join chat
      </Button>
    </Box>
  );
};

export default UsernameForm;