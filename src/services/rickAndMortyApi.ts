import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SearchResult, Person } from '../model/types';

export const rickAndMortyApi = createApi({
  reducerPath: 'rickAndMortyApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://rickandmortyapi.com/api/' }),
  tagTypes: ['Characters', 'Character'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getCharacters: builder.query<
      SearchResult,
      { name?: string; page?: number }
    >({
      query: ({ name = '', page = 1 }) =>
        `character/?name=${name}&page=${page}`,
      transformResponse: (response: unknown) => {
        const typedResponse = response as {
          info?: { pages: number };
          count: number;
          next: string | null;
          previous: string | null;
          results: Person[];
        };

        if (typedResponse.info && !('pages' in typedResponse)) {
          return {
            ...typedResponse,
            pages: typedResponse.info.pages,
          } as SearchResult;
        }
        return typedResponse as SearchResult;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Characters' as const,
                id,
              })),
              { type: 'Characters', id: 'LIST' },
            ]
          : [{ type: 'Characters', id: 'LIST' }],
    }),
    getCharacterById: builder.query<Person, string>({
      query: (id) => `character/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Character', id }],
    }),
    invalidateCache: builder.mutation<{ success: boolean }, undefined>({
      queryFn: () => ({ data: { success: true } }),
      invalidatesTags: ['Characters', 'Character'],
    }),
  }),
});

export const {
  useGetCharactersQuery,
  useGetCharacterByIdQuery,
  useInvalidateCacheMutation,
} = rickAndMortyApi;
