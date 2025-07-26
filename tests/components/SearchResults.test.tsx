import { render, screen } from '@testing-library/react';
import SearchResults from '../../src/components/SearchResults';

describe('SearchResults Component', () => {
  const defaultProps = {
    searchResults: {
      count: 0,
      next: '',
      previous: '',
      results: [],
    },
  };

  it('displays a message when there are no results', () => {
    render(<SearchResults {...defaultProps} />);
    const noResultsMessage = screen.getByText(/no results/i);
    expect(noResultsMessage).toBeInTheDocument();
  });

  it('displays the correct number of results', () => {
    const results = [
      {
        id: 1,
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        image: 'rick.jpg',
        episode: [],
      },
      {
        id: 2,
        name: 'Morty Smith',
        status: 'Alive',
        species: 'Human',
        image: 'morty.jpg',
        episode: [],
      },
    ];
    render(
      <SearchResults
        searchResults={{
          count: results.length,
          next: '',
          previous: '',
          results: results,
        }}
      />
    );
    const resultItems = screen.getAllByRole('listitem');
    expect(resultItems).toHaveLength(results.length);
  });
});
