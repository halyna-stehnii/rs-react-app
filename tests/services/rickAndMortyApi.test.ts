import { describe, it, expect } from 'vitest';
import { rickAndMortyApi } from '../../src/services/rickAndMortyApi';

describe('Rick and Morty API', () => {
  it('should have the correct endpoints defined', () => {
    expect(rickAndMortyApi.endpoints.getCharacters).toBeDefined();
    expect(rickAndMortyApi.endpoints.getCharacterById).toBeDefined();
    expect(rickAndMortyApi.endpoints.invalidateCache).toBeDefined();
  });

  it('should have the correct reducer path', () => {
    expect(rickAndMortyApi.reducerPath).toBe('rickAndMortyApi');
  });

  it('should have the correct API configuration', () => {
    expect(rickAndMortyApi.reducerPath).toBe('rickAndMortyApi');
    expect(rickAndMortyApi.endpoints).toBeDefined();
  });

  it('should have tag-based caching capabilities', () => {
    const charactersEndpoint = rickAndMortyApi.endpoints.getCharacters;
    const characterByIdEndpoint = rickAndMortyApi.endpoints.getCharacterById;

    expect(charactersEndpoint).toBeDefined();
    expect(characterByIdEndpoint).toBeDefined();
  });

  it('should have properly defined query endpoints', () => {
    const getCharacters = rickAndMortyApi.endpoints.getCharacters;
    const getCharacterById = rickAndMortyApi.endpoints.getCharacterById;

    expect(getCharacters).toBeDefined();
    expect(typeof getCharacters.initiate).toBe('function');

    expect(getCharacterById).toBeDefined();
    expect(typeof getCharacterById.initiate).toBe('function');
  });

  it('should generate proper hooks for the endpoints', () => {
    const {
      useGetCharactersQuery,
      useGetCharacterByIdQuery,
      useInvalidateCacheMutation,
    } = rickAndMortyApi;

    expect(useGetCharactersQuery).toBeDefined();
    expect(useGetCharacterByIdQuery).toBeDefined();
    expect(useInvalidateCacheMutation).toBeDefined();
  });

  it('should have a properly configured invalidateCache mutation endpoint', () => {
    expect(rickAndMortyApi.endpoints.invalidateCache).toBeDefined();

    expect(typeof rickAndMortyApi.endpoints.invalidateCache.initiate).toBe(
      'function'
    );

    const { useInvalidateCacheMutation } = rickAndMortyApi;
    expect(useInvalidateCacheMutation).toBeDefined();
  });
});
