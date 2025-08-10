import { configureStore } from '@reduxjs/toolkit';
import charactersReducer from '../../src/redux/charactersSlice';
import { rickAndMortyApi } from '../../src/services/rickAndMortyApi';
import { Person } from '../../src/model/types';

interface CharactersState {
  selectedCharacters: Record<number, Person>;
}

interface RootState {
  characters: CharactersState;
  [rickAndMortyApi.reducerPath]: ReturnType<typeof rickAndMortyApi.reducer>;
}

export const setupStore = () => {
  return configureStore({
    reducer: {
      characters: charactersReducer,
      [rickAndMortyApi.reducerPath]: rickAndMortyApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(rickAndMortyApi.middleware),
  });
};

export type { RootState };
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
