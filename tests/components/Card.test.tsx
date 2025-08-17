import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithRedux } from '../utils/test-utils';
import Card from '../../src/components/Card/Card';
import { Person } from '../../src/model/types';

describe('Card component', () => {
  const mockCharacter: Person = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'https://example.com/rick.jpg',
    episode: ['https://example.com/episode/1'],
  };

  const initialReduxState = {
    characters: {
      selectedCharacters: {},
    },
  };

  it('renders a character container with image, name, status and species correctly', () => {
    renderWithRedux(<Card character={mockCharacter} />, {
      preloadedState: initialReduxState,
    });

    expect(screen.getByAltText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Name: Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Status: Alive')).toBeInTheDocument();
    expect(screen.getByText('Species: Human')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it.skip('handles missing character properties gracefully', () => {
    const incompleteCharacter: Person = {
      id: 2,
      name: '',
      status: '',
      species: '',
      image: '',
      episode: [],
    };

    renderWithRedux(<Card character={incompleteCharacter} />, {
      preloadedState: initialReduxState,
    });

    expect(screen.getByAltText('No data')).toBeInTheDocument();
    expect(screen.getByText('Name: No data')).toBeInTheDocument();
    expect(screen.getByText('Status: No data')).toBeInTheDocument();
    expect(screen.getByText('Species: No data')).toBeInTheDocument();
  });

  it('calls onClick handler when a character is clicked', () => {
    const handleClick = vi.fn();

    const initialState = {
      characters: {
        selectedCharacters: {},
      },
    };

    renderWithRedux(<Card character={mockCharacter} onClick={handleClick} />, {
      preloadedState: initialState,
    });

    fireEvent.click(
      screen.getByText('Name: Rick Sanchez').parentElement
        ?.parentElement as HTMLElement
    );
    expect(handleClick).toHaveBeenCalledWith(mockCharacter);
  });

  it('toggles character selection when checkbox is clicked', () => {
    const { store } = renderWithRedux(<Card character={mockCharacter} />, {
      preloadedState: initialReduxState,
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    const stateAfterToggle = store.getState();
    expect(stateAfterToggle.characters.selectedCharacters[1]).toEqual(
      mockCharacter
    );
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    const stateAfterSecondToggle = store.getState();
    expect(
      stateAfterSecondToggle.characters.selectedCharacters[1]
    ).toBeUndefined();
    expect(checkbox).not.toBeChecked();
  });
});
