import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('should show loader when fetching data', () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve(mockFetchResponse),
            });
          }, 100);
        })
    );

    render(<App />);

    const loader = screen.getByText('', { selector: 'div.loader' });
    expect(loader).toBeInTheDocument();
  });

  it('should display loading indicator during API calls and hide it after completion', async () => {
    let resolveFunction: (value: unknown) => void = () => {};
    const delayedPromise = new Promise<unknown>((resolve) => {
      resolveFunction = resolve;
    });

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => delayedPromise,
      })
    );

    render(<App />);

    const loaderElements = document.getElementsByClassName('loader');
    expect(loaderElements.length).toBeGreaterThan(0);

    resolveFunction(mockFetchResponse);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
  });

  it('should handle search button clicks with proper loading states', async () => {
    render(<App />);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'Summer' } });

    const summerResponse = {
      ...mockFetchResponse,
      results: [
        {
          name: 'Summer Smith',
          status: 'Alive',
          species: 'Human',
          image: 'summer.jpg',
          episode: ['episode1', 'episode2'],
        },
      ],
    };

    let resolveFunction: (value: unknown) => void = () => {};
    const delayedPromise = new Promise<unknown>((resolve) => {
      resolveFunction = resolve;
    });

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => delayedPromise,
      })
    );

    fireEvent.click(searchButton);

    const loaderElements = document.getElementsByClassName('loader');
    expect(loaderElements.length).toBeGreaterThan(0);

    resolveFunction(summerResponse);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(await screen.findByText(/summer smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/rick sanchez/i)).not.toBeInTheDocument();
  });
});
