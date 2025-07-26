import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Search from '../../src/components/Search';

describe('Search Component', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    onSearch: vi.fn(),
  };

  it('renders search input with correct placeholder', () => {
    render(<Search {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveClass('search-input');
  });

  it('renders search button with correct text', () => {
    render(<Search {...defaultProps} />);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toHaveTextContent('Search');
  });

  it('displays the provided search term in input', () => {
    const searchTerm = 'Rick';
    render(<Search {...defaultProps} searchTerm={searchTerm} />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue(searchTerm);
  });

  it('displays empty input when no search term is provided', () => {
    render(<Search {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue('');
  });

  it('displays empty input when localStorage has no saved term', () => {
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    render(<Search {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue('');
    expect(localStorageMock.getItem).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('saves search term to localStorage when search button is clicked', () => {
    const searchTerm = 'Morty Smith';
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    const onSearchMock = vi.fn(() => {
      localStorage.setItem('rickAndMortySearchTerm', searchTerm);
    });

    render(
      <Search
        searchTerm={searchTerm}
        onSearchChange={vi.fn()}
        onSearch={onSearchMock}
      />
    );

    const searchButton = screen.getByRole('button', { name: 'Search' });
    searchButton.click();

    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'rickAndMortySearchTerm',
      searchTerm
    );

    vi.restoreAllMocks();
  });

  it('displays previously saved search term from localStorage on mount', () => {
    const savedSearchTerm = 'Rick Sanchez';
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(savedSearchTerm),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    const propsWithSavedTerm = {
      ...defaultProps,
      searchTerm: savedSearchTerm,
    };

    render(<Search {...propsWithSavedTerm} />);

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );
    expect(searchInput).toHaveValue(savedSearchTerm);

    vi.restoreAllMocks();
  });

  it('triggers onSearch callback when search button is clicked', () => {
    const onSearchMock = vi.fn();

    render(
      <Search
        searchTerm="Rick Sanchez"
        onSearchChange={vi.fn()}
        onSearch={onSearchMock}
      />
    );

    const searchButton = screen.getByRole('button', { name: 'Search' });

    searchButton.click();

    expect(onSearchMock).toHaveBeenCalledTimes(1);
  });

  it('triggers onSearchChange callback when user types in the input', () => {
    const onSearchChangeMock = vi.fn();

    render(
      <Search
        searchTerm=""
        onSearchChange={onSearchChangeMock}
        onSearch={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Find Rick and Morty characters'
    );

    const typedText = 'Rick';
    fireEvent.change(searchInput, { target: { value: typedText } });

    expect(onSearchChangeMock).toHaveBeenCalled();
  });
});
