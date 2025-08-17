import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../src/redux/store';
import AppRouter from '../src/AppRouter';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../src/components/CharacterDetails/CharacterDetails', () => ({
  default: () => <div>Mock Character Details</div>,
}));

vi.mock('../src/App', () => ({
  default: () => (
    <div>
      Mock App <button>Search</button>
    </div>
  ),
}));

vi.mock('../src/pages/NotFound/NotFound', () => ({
  default: () => <div>Mock Not Found Page</div>,
}));

vi.mock('../src/components/ErrorBoundary/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Route: ({ element }: { element: React.ReactNode }) => element,
}));

describe('AppRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the application with Redux Provider', () => {
    render(
      <Provider store={store}>
        <AppRouter />
      </Provider>
    );

    expect(screen.getByText('Mock App')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});
