import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

declare const global: {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

describe('App Component', () => {
  const mockFetchResponse = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        image: 'rick.jpg',
        episode: ['episode1', 'episode2'],
      },
      {
        name: 'Morty Smith',
        status: 'Alive',
        species: 'Human',
        image: 'morty.jpg',
        episode: ['episode1', 'episode2'],
      },
    ],
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse),
      })
    );

    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should make an initial API call on component mount with empty search term', async () => {
    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://rickandmortyapi.com/api/character/?name='
      );
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
    expect(await screen.findByText(/morty smith/i)).toBeInTheDocument();
  });

  it('should load saved search term from localStorage and make API call with it', async () => {
    const savedSearchTerm = 'Rick';
    localStorage.setItem('searchTerm', savedSearchTerm);

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://rickandmortyapi.com/api/character/?name=${savedSearchTerm}`
      );
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
  });
});
