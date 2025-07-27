import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SearchResults from '../../src/components/SearchResults';

describe('SearchResults Component', () => {
  const defaultProps = {
    searchResults: {
      count: 0,
      next: '',
      previous: '',
      results: [],
    },
    currentPage: 1,
    onPageChange: vi.fn(),
    onSelectCharacter: vi.fn(),
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
        currentPage={1}
        onPageChange={vi.fn()}
        onSelectCharacter={vi.fn()}
      />
    );
    const resultItems = screen.getAllByRole('listitem');
    expect(resultItems).toHaveLength(results.length);
  });

  it('displays character container with image, name, status and species correctly', () => {
    const testCharacter = {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      episode: [],
    };

    render(
      <SearchResults
        searchResults={{
          count: 1,
          next: '',
          previous: '',
          results: [testCharacter],
        }}
        currentPage={1}
        onPageChange={vi.fn()}
        onSelectCharacter={vi.fn()}
      />
    );

    const characterImage = screen.getByAltText(testCharacter.name);
    expect(characterImage).toBeInTheDocument();
    expect(characterImage.tagName).toBe('IMG');
    expect(characterImage).toHaveAttribute('src', testCharacter.image);

    expect(screen.getByText(`Name: ${testCharacter.name}`)).toBeInTheDocument();
    expect(
      screen.getByText(`Status: ${testCharacter.status}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Species: ${testCharacter.species}`)
    ).toBeInTheDocument();

    const characterContainer = screen
      .getByAltText(testCharacter.name)
      .closest('.character-container');
    expect(characterContainer).toHaveClass('character-container');

    const imageContainer = screen
      .getByAltText(testCharacter.name)
      .closest('.character-image');
    expect(imageContainer).toHaveClass('character-image');

    const infoContainer = screen
      .getByText(`Name: ${testCharacter.name}`)
      .closest('.character-info');
    expect(infoContainer).toHaveClass('character-info');
  });

  it('handles empty character properties gracefully', () => {
    const characterWithEmptyProps = {
      id: 3,
      name: '',
      status: '',
      species: '',
      image: '',
      episode: [],
    };

    render(
      <SearchResults
        searchResults={{
          count: 1,
          next: '',
          previous: '',
          results: [characterWithEmptyProps],
        }}
        currentPage={1}
        onPageChange={vi.fn()}
        onSelectCharacter={vi.fn()}
      />
    );

    const characterImage = screen.getByRole('img');
    expect(characterImage).toBeInTheDocument();
    expect(characterImage).toHaveAttribute('src', 'no-img.png');

    expect(screen.getByText('Name: No data')).toBeInTheDocument();
    expect(screen.getByText('Status: No data')).toBeInTheDocument();
    expect(screen.getByText('Species: No data')).toBeInTheDocument();
  });

  it('calls onSelectCharacter when a character is clicked', () => {
    const mockSelectCharacter = vi.fn();
    const testCharacter = {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      episode: [],
    };

    render(
      <SearchResults
        searchResults={{
          count: 1,
          next: '',
          previous: '',
          results: [testCharacter],
        }}
        currentPage={1}
        onPageChange={vi.fn()}
        onSelectCharacter={mockSelectCharacter}
      />
    );

    const characterContainer = screen
      .getByAltText(testCharacter.name)
      .closest('.character-container');

    if (characterContainer) {
      fireEvent.click(characterContainer);
      expect(mockSelectCharacter).toHaveBeenCalledWith('1');
    }
  });
});
