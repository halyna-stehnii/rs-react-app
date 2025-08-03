import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Person } from '../model/types';

interface CharactersState {
  selectedCharacters: Record<number, Person>;
}

const initialState: CharactersState = {
  selectedCharacters: {},
};

export const charactersSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    toggleCharacterSelection: (state, action: PayloadAction<Person>) => {
      const character = action.payload;
      if (character.id) {
        if (state.selectedCharacters[character.id]) {
          state.selectedCharacters = Object.fromEntries(
            Object.entries(state.selectedCharacters).filter(
              ([key]) => Number(key) !== character.id
            )
          );
        } else {
          state.selectedCharacters[character.id] = character;
        }
      }
    },
    clearSelectedCharacters: (state) => {
      state.selectedCharacters = {};
    },
  },
});

export const { toggleCharacterSelection, clearSelectedCharacters } =
  charactersSlice.actions;
export default charactersSlice.reducer;

export const selectSelectedCharacters = (state: {
  characters: CharactersState;
}) => state.characters.selectedCharacters;
