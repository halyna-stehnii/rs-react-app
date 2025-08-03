import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRedux } from '../utils/test-utils';
import SelectedItemsFlyout from '../../src/components/SelectedItemsFlyout/SelectedItemsFlyout';
import { Person } from '../../src/model/types';

describe('SelectedItemsFlyout component', () => {
  const mockCharacter1: Person = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'https://example.com/rick.jpg',
    episode: ['https://example.com/episode/1'],
  };

  const mockCharacter2: Person = {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    image: 'https://example.com/morty.jpg',
    episode: ['https://example.com/episode/1'],
  };

  const initialReduxState = {
    characters: {
      selectedCharacters: {},
    },
  };

  it('should not render when no items are selected', () => {
    const { container } = renderWithRedux(<SelectedItemsFlyout />, {
      preloadedState: initialReduxState,
    });
    expect(container.firstChild).toBeNull();
  });

  it('should render with correct count when items are selected', () => {
    const preloadedState = {
      characters: {
        selectedCharacters: {
          1: mockCharacter1,
          2: mockCharacter2,
        },
      },
    };

    renderWithRedux(<SelectedItemsFlyout />, { preloadedState });

    expect(screen.getByText('2 items selected')).toBeInTheDocument();
    expect(screen.getByText('Unselect all')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('should show singular message when 1 item is selected', () => {
    const preloadedState = {
      characters: {
        selectedCharacters: {
          1: mockCharacter1,
        },
      },
    };

    renderWithRedux(<SelectedItemsFlyout />, { preloadedState });

    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });

  it('should unselect all characters when button is clicked', () => {
    const preloadedState = {
      characters: {
        selectedCharacters: {
          1: mockCharacter1,
          2: mockCharacter2,
        },
      },
    };

    const { store } = renderWithRedux(<SelectedItemsFlyout />, {
      preloadedState,
    });

    expect(screen.getByText('2 items selected')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Unselect all'));

    const state = store.getState();
    expect(Object.keys(state.characters.selectedCharacters).length).toBe(0);
  });
});
