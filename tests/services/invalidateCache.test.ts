import { describe, it, expect } from 'vitest';
import { rickAndMortyApi } from '../../src/services/rickAndMortyApi';

describe('Cache Invalidation', () => {
  it('should have invalidateCache mutation endpoint defined', () => {
    expect(rickAndMortyApi.endpoints.invalidateCache).toBeDefined();
  });

  it('should generate a useInvalidateCacheMutation hook', () => {
    const { useInvalidateCacheMutation } = rickAndMortyApi;
    expect(useInvalidateCacheMutation).toBeDefined();
  });
});
