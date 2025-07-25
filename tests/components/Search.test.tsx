import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
});
