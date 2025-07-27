import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NotFound from '../../src/components/NotFound';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('NotFound Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the 404 page with correct heading', () => {
    render(<NotFound />);

    const heading = screen.getByRole('heading', {
      name: /404 - Page Not Found/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(<NotFound />);

    const errorMessage = screen.getByText(
      /The page you are looking for does not exist./i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders a back to home button', () => {
    render(<NotFound />);

    const backButton = screen.getByRole('button', { name: /Back to Home/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveClass('back-button');
  });

  it('navigates to home page when back button is clicked', async () => {
    render(<NotFound />);

    const backButton = screen.getByRole('button', { name: /Back to Home/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
