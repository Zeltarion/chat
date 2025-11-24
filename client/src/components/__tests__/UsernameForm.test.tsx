import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UsernameForm from '../UsernameForm';

describe('UsernameForm', () => {
  it('calls onSubmit with username', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<UsernameForm onSubmit={handleSubmit} />);

    const input = screen.getByLabelText(/username/i);
    const button = screen.getByRole('button', { name: /join/i });

    await user.type(input, 'testuser');
    await user.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({ username: 'testuser' });
  });

  it('shows errorMessage when provided', () => {
    render(
      <UsernameForm
        onSubmit={vi.fn()}
        errorMessage="Username already taken"
      />,
    );

    expect(
      screen.getByText(/username already taken/i),
    ).toBeInTheDocument();
  });
});