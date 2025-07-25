import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

declare const global: {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

describe.skip('App Component', () => {
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

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      removeItem: vi.fn((key: string) => {
        // Use object destructuring but ignore the extracted value
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _, ...rest } = store;
        store = rest;
      }),
      length: 0,
      // Use empty arrow function since we don't use the parameter
      key: vi.fn(() => ''),
    };
  })();

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockFetchResponse),
      })
    );

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should load the saved search term from localStorage on mount', async () => {
    const savedSearchTerm = 'Rick';
    localStorageMock.getItem.mockReturnValueOnce(savedSearchTerm);

    render(<App />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue(savedSearchTerm);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://rickandmortyapi.com/api/character/?name=${savedSearchTerm}`
    );
  });

  it('should fetch with empty search when nothing is saved in localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);

    render(<App />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith('searchTerm');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://rickandmortyapi.com/api/character/?name='
    );
  });

  it('should save search term to localStorage when search is performed', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    const searchButton = screen.getByRole('button', { name: 'Search' });

    const newSearchTerm = 'Morty';
    fireEvent.change(searchInput, { target: { value: newSearchTerm } });

    fireEvent.click(searchButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchTerm',
      newSearchTerm
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `https://rickandmortyapi.com/api/character/?name=${newSearchTerm}`
    );
  });

  it('should trim the search term before saving to localStorage', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    const searchButton = screen.getByRole('button', { name: 'Search' });

    const untrimmedSearchTerm = '  Rick  ';
    const trimmedSearchTerm = 'Rick';
    fireEvent.change(searchInput, { target: { value: untrimmedSearchTerm } });

    fireEvent.click(searchButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchTerm',
      trimmedSearchTerm
    );

    expect(global.fetch).toHaveBeenCalledWith(
      `https://rickandmortyapi.com/api/character/?name=${trimmedSearchTerm}`
    );
  });

  it('should update input value when user types', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue('');

    const typedText = 'Rick Sanchez';
    fireEvent.change(searchInput, { target: { value: typedText } });

    expect(searchInput).toHaveValue(typedText);

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should save input to localStorage when search button is clicked', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    const searchButton = screen.getByRole('button', { name: 'Search' });

    const searchTerm = 'Beth Smith';
    fireEvent.change(searchInput, { target: { value: searchTerm } });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    fireEvent.click(searchButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'searchTerm',
      searchTerm
    );
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
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
});
