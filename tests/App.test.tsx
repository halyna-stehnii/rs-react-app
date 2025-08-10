import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';
import { renderWithRedux } from './utils/test-utils';

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useNavigate: () => vi.fn(),
  Outlet: () => <div data-testid="outlet"></div>,
}));

const mockUseSearchQuery = vi.fn();

vi.mock('../src/hooks/useSearchQuery', () => ({
  default: (...args: unknown[]) => mockUseSearchQuery(...args),
}));

const initialReduxState = {
  characters: {
    selectedCharacters: {},
  },
};

interface SearchResultsProps {
  searchResults: {
    results: Character[];
    [key: string]: unknown;
  };
  onSelectCharacter?: (id: string | number) => void;
}

interface Character {
  id?: number;
  name?: string;
  status?: string;
  species?: string;
  image?: string;
  [key: string]: unknown;
}

vi.mock('../src/components/SearchResults/SearchResults', () => {
  return {
    default: ({ searchResults, onSelectCharacter }: SearchResultsProps) => (
      <div data-testid="search-results">
        {searchResults.results?.map((character: Character, index: number) => (
          <div
            key={index}
            className="card"
            onClick={() =>
              onSelectCharacter && onSelectCharacter(character.id || index)
            }
          >
            <img src={character.image} alt={character.name} />
            <div>{character.name}</div>
            <div>Status: {character.status}</div>
            <div>Species: {character.species}</div>
          </div>
        ))}
      </div>
    ),
  };
});

vi.mock('../src/components/SelectedItemsFlyout/SelectedItemsFlyout', () => ({
  default: () => <div data-testid="selected-items-flyout" />,
}));

interface SearchProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

vi.mock('../src/components/Search/Search', () => ({
  default: ({ searchTerm, onSearchChange, onSearch }: SearchProps) => {
    return (
      <div>
        <input
          className="search-input"
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Find Rick and Morty characters"
        />
        <button onClick={onSearch}>Search</button>
      </div>
    );
  },
}));

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

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse),
        clone: function () {
          return {
            ok: this.ok,
            json: this.json,
            clone: this.clone,
          };
        },
      })
    );

    localStorage.clear();
    vi.clearAllMocks();

    mockUseSearchQuery.mockImplementation(
      (storageKey: string, defaultValue: string) => {
        const storedValue = localStorage.getItem(storageKey);
        return {
          searchTerm: '',
          storedSearchTerm: storedValue
            ? JSON.parse(storedValue)
            : defaultValue,
          currentPage: 1,
          handleSearchInputChange: vi.fn(),
          handleSearch: vi.fn().mockReturnValue({
            searchTerm: storedValue ? JSON.parse(storedValue) : defaultValue,
            page: 1,
          }),
          handlePageChange: vi.fn().mockReturnValue({
            searchTerm: storedValue ? JSON.parse(storedValue) : defaultValue,
            page: 1,
          }),
        };
      }
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should make an initial API call on component mount with empty search term', async () => {
    renderWithRedux(<App />, { preloadedState: initialReduxState });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0][0];
      const requestUrl =
        fetchCall instanceof Request ? fetchCall.url : String(fetchCall);
      expect(requestUrl).toContain(
        'https://rickandmortyapi.com/api/character/'
      );
      expect(requestUrl).toContain('name=');
      expect(requestUrl).toContain('page=1');
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
    expect(await screen.findByText(/morty smith/i)).toBeInTheDocument();
  });

  it('should load saved search term from localStorage and make API call with it', async () => {
    const savedSearchTerm = 'Rick';
    localStorage.setItem('searchTerm', JSON.stringify(savedSearchTerm));

    mockUseSearchQuery.mockReturnValue({
      searchTerm: savedSearchTerm,
      storedSearchTerm: savedSearchTerm,
      currentPage: 1,
      handleSearchInputChange: vi.fn(),
      handleSearch: vi
        .fn()
        .mockReturnValue({ searchTerm: savedSearchTerm, page: 1 }),
      handlePageChange: vi.fn(),
    });

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0][0];
      const requestUrl =
        fetchCall instanceof Request ? fetchCall.url : String(fetchCall);
      expect(requestUrl).toContain(
        'https://rickandmortyapi.com/api/character/'
      );
      expect(requestUrl).toContain(`name=${savedSearchTerm}`);
      expect(requestUrl).toContain('page=1');
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
  });

  it('should show loader when fetching data', () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            const response = {
              ok: true,
              json: () => Promise.resolve(mockFetchResponse),
              clone: () => ({ ...response }),
            };
            resolve(response);
          }, 100);
        })
    );

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    const loader = screen.getByText('', { selector: 'div.loader' });
    expect(loader).toBeInTheDocument();
  });

  it('should display loading indicator during API calls and hide it after completion', async () => {
    const fetchSpy = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = {
            ok: true,
            json: () => Promise.resolve(mockFetchResponse),
            clone: () => ({ ...response }),
          };
          resolve(response);
        }, 10);
      });
    });

    global.fetch = fetchSpy;

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    const loaderElements = document.getElementsByClassName('loader');
    expect(loaderElements.length).toBeGreaterThan(0);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(await screen.findByText(/rick sanchez/i)).toBeInTheDocument();
  });

  it('should handle search button clicks with proper loading states', async () => {
    const mockUpdateSearchTerm = vi.fn();

    mockUpdateSearchTerm.mockImplementation((value) => {
      return value;
    });

    const mockExecuteSearch = vi
      .fn()
      .mockReturnValue({ searchTerm: 'Summer', page: 1 });

    mockUseSearchQuery.mockReturnValue({
      searchTerm: 'Summer',
      storedSearchTerm: '',
      currentPage: 1,
      handleSearchInputChange: mockUpdateSearchTerm, // This is what we're testing
      handleSearch: mockExecuteSearch,
      handlePageChange: vi.fn(),
    });

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    const summerResponse = {
      info: { count: 1, pages: 1, next: null, prev: null },
      ...mockFetchResponse,
      results: [
        {
          id: 3,
          name: 'Summer Smith',
          status: 'Alive',
          species: 'Human',
          image: 'summer.jpg',
          episode: ['episode1', 'episode2'],
        },
      ],
    };

    const fetchSpy = vi.fn().mockImplementation(() => {
      const response = {
        ok: true,
        json: () => Promise.resolve(summerResponse),
        clone: () => ({ ...response }),
      };
      return Promise.resolve(response);
    });

    global.fetch = fetchSpy;

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(await screen.findByText(/summer smith/i)).toBeInTheDocument();
    expect(screen.queryByText(/rick sanchez/i)).not.toBeInTheDocument();
  });

  it('should successfully fetch and display data with all expected properties', async () => {
    const detailedMockResponse = {
      info: { count: 1, pages: 1, next: null, prev: null },
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Beth Smith',
          status: 'Alive',
          species: 'Human',
          image: 'beth.jpg',
          episode: ['episode1', 'episode2', 'episode3'],
        },
      ],
    };

    localStorage.setItem('searchTerm', JSON.stringify(''));

    mockUseSearchQuery.mockReturnValue({
      searchTerm: '',
      storedSearchTerm: '',
      currentPage: 1,
      handleSearchInputChange: vi.fn(),
      handleSearch: vi.fn().mockReturnValue({ searchTerm: '', page: 1 }),
      handlePageChange: vi.fn(),
    });

    global.fetch = vi.fn().mockImplementation(() => {
      const response = {
        ok: true,
        json: () => Promise.resolve(detailedMockResponse),
        clone: () => ({ ...response }),
      };
      return Promise.resolve(response);
    });

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0][0];
      const requestUrl =
        fetchCall instanceof Request ? fetchCall.url : String(fetchCall);
      expect(requestUrl).toContain(
        'https://rickandmortyapi.com/api/character/'
      );
      expect(requestUrl).toContain('name=');
      expect(requestUrl).toContain('page=1');
    });

    expect(await screen.findByText(/Beth Smith/i)).toBeInTheDocument();

    const characterImage = screen.getByAltText('Beth Smith');
    expect(characterImage).toBeInTheDocument();
    expect(characterImage).toHaveAttribute('src', 'beth.jpg');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementsByClassName('loader').length).toBe(0);
  });
});
