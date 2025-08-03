import charactersReducer, {
  toggleCharacterSelection,
  clearSelectedCharacters,
} from '../../src/redux/charactersSlice';
import { Person } from '../../src/model/types';

describe('characters reducer', () => {
  const initialState = {
    selectedCharacters: {},
  };

  it('should handle initial state', () => {
    expect(charactersReducer(undefined, { type: 'unknown' })).toEqual({
      selectedCharacters: {},
    });
  });

  it('should handle toggleCharacterSelection for adding a character', () => {
    const mockCharacter: Person = {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      image: 'https://example.com/rick.jpg',
      episode: ['https://example.com/episode/1'],
    };

    const actual = charactersReducer(
      initialState,
      toggleCharacterSelection(mockCharacter)
    );

    expect(actual.selectedCharacters).toEqual({
      1: mockCharacter,
    });
  });

  it('should handle toggleCharacterSelection for removing a character', () => {
    const mockCharacter: Person = {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      image: 'https://example.com/rick.jpg',
      episode: ['https://example.com/episode/1'],
    };

    const stateWithCharacter = charactersReducer(
      initialState,
      toggleCharacterSelection(mockCharacter)
    );

    const actual = charactersReducer(
      stateWithCharacter,
      toggleCharacterSelection(mockCharacter)
    );

    expect(actual.selectedCharacters).toEqual({});
  });

  it('should handle clearSelectedCharacters', () => {
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

    const stateWithCharacter1 = charactersReducer(
      initialState,
      toggleCharacterSelection(mockCharacter1)
    );

    const stateWithBothCharacters = charactersReducer(
      stateWithCharacter1,
      toggleCharacterSelection(mockCharacter2)
    );

    const actual = charactersReducer(
      stateWithBothCharacters,
      clearSelectedCharacters()
    );

    expect(actual.selectedCharacters).toEqual({});
  });
});
