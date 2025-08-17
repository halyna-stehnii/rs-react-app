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

const mockUseGetCharactersQuery = vi.fn();
const mockUseInvalidateCacheMutation = vi.fn();

vi.mock('../src/services/rickAndMortyApi', () => ({
  rickAndMortyApi: {
    reducerPath: 'rickAndMortyApi',
    reducer: (state = {}) => state,
    middleware:
      () => (next: (action: unknown) => unknown) => (action: unknown) =>
        next(action),
  },
  useGetCharactersQuery: (...args: unknown[]) =>
    mockUseGetCharactersQuery(...args),
  useInvalidateCacheMutation: () => mockUseInvalidateCacheMutation(),
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
            <div>Name: {character.name}</div>
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

describe('App Component', () => {
  const mockFetchResponse = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        image: 'rick.jpg',
        episode: ['episode1', 'episode2'],
      },
      {
        id: 2,
        name: 'Morty Smith',
        status: 'Alive',
        species: 'Human',
        image: 'morty.jpg',
        episode: ['episode1', 'episode2'],
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockUseGetCharactersQuery.mockReturnValue({
      data: mockFetchResponse,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    mockUseInvalidateCacheMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);

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
      expect(mockUseGetCharactersQuery).toHaveBeenCalledWith({
        name: '',
        page: 1,
      });
    });

    expect(
      await screen.findByText(/name:\s*rick sanchez/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/name:\s*morty smith/i)).toBeInTheDocument();
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
      expect(mockUseGetCharactersQuery).toHaveBeenCalledWith({
        name: savedSearchTerm,
        page: 1,
      });
    });

    expect(
      await screen.findByText(/name:\s*rick sanchez/i)
    ).toBeInTheDocument();
  });

  it('should show loader when fetching data', () => {
    mockUseGetCharactersQuery.mockReturnValue({
      data: mockFetchResponse,
      error: null,
      isLoading: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    const loader = screen.getByText('', { selector: 'div.loader' });
    expect(loader).toBeInTheDocument();
  });

  it('should display loading indicator during API calls and hide it after completion', async () => {
    mockUseGetCharactersQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { rerender } = renderWithRedux(<App />, {
      preloadedState: initialReduxState,
    });

    const loaderElements = document.getElementsByClassName('loader');
    expect(loaderElements.length).toBeGreaterThan(0);

    // Simulate data loaded
    mockUseGetCharactersQuery.mockReturnValue({
      data: mockFetchResponse,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    rerender(<App />);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(
      await screen.findByText(/name:\s*rick sanchez/i)
    ).toBeInTheDocument();
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
      handleSearchInputChange: mockUpdateSearchTerm,
      handleSearch: mockExecuteSearch,
      handlePageChange: vi.fn(),
    });

    const summerResponse = {
      info: { count: 1, pages: 1, next: null, prev: null },
      count: 1,
      next: null,
      previous: null,
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

    mockUseGetCharactersQuery.mockReturnValue({
      data: mockFetchResponse,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { rerender } = renderWithRedux(<App />, {
      preloadedState: initialReduxState,
    });

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });
    mockUseGetCharactersQuery.mockReturnValue({
      data: summerResponse,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(mockExecuteSearch).toHaveBeenCalled();
    rerender(<App />);

    await waitFor(() => {
      const loaderElements = document.getElementsByClassName('loader');
      expect(loaderElements.length).toBe(0);
    });

    expect(
      await screen.findByText(/name:\s*summer smith/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/name:\s*rick sanchez/i)).not.toBeInTheDocument();
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

    mockUseGetCharactersQuery.mockReturnValue({
      data: detailedMockResponse,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderWithRedux(<App />, { preloadedState: initialReduxState });

    await waitFor(() => {
      expect(mockUseGetCharactersQuery).toHaveBeenCalledWith({
        name: '',
        page: 1,
      });
    });

    expect(await screen.findByText(/name:\s*beth smith/i)).toBeInTheDocument();

    const characterImage = screen.getByAltText('Beth Smith');
    expect(characterImage).toBeInTheDocument();
    expect(characterImage).toHaveAttribute('src', 'beth.jpg');

    expect(mockUseGetCharactersQuery).toHaveBeenCalledTimes(1);
    expect(document.getElementsByClassName('loader').length).toBe(0);
  });
});
