import React, { type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import chatReducer from './store/chatSlice';
import userReducer from './store/userSlice';
import type { RootState } from './store';


type PartialState = Partial<RootState>;

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    preloadedState,
  }: { route?: string; preloadedState?: PartialState } = {},
) {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
      user: userReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
  });

  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}