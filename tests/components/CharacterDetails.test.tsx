import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CharacterDetails from '../../src/components/CharacterDetails';
import React from 'react';

declare const global: {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const mockNavigate = vi.fn();
const mockUseParams = vi.fn().mockReturnValue({ characterId: '1' });
const mockSearchParams = new URLSearchParams({ page: '1' });

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

describe('CharacterDetails Component', () => {
  const mockCharacterData = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['episode1', 'episode2', 'episode3'],
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCharacterData),
      })
    );
  });

  it('shows loading state initially', () => {
    render(<CharacterDetails />);
    expect(
      screen.getByText(/loading/i) || screen.getByTestId('loader')
    ).toBeInTheDocument();
  });

  it('displays character details after loading', async () => {
    render(<CharacterDetails />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(mockCharacterData.name)).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText(mockCharacterData.status)).toBeInTheDocument();
    expect(screen.getByText('Species:')).toBeInTheDocument();
    expect(screen.getByText(mockCharacterData.species)).toBeInTheDocument();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockCharacterData.image);
    expect(image).toHaveAttribute('alt', mockCharacterData.name);
  });

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.reject(new Error('Not found')),
      })
    );

    render(<CharacterDetails />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/character not found/i)).toBeInTheDocument();
  });

  it('has a working close button', async () => {
    render(<CharacterDetails />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /×/i });
    expect(closeButton).toBeInTheDocument();

    await userEvent.click(closeButton);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/',
      search: 'page=1',
    });
  });
});
