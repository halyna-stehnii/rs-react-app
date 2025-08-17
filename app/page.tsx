'use client';

import { useState, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchResults from '../src/components/SearchResults/SearchResults';
import Search from '../src/components/Search/Search';
import SelectedItemsFlyout from '../src/components/SelectedItemsFlyout/SelectedItemsFlyout';
import CharacterDetails from '../src/components/CharacterDetails/CharacterDetails';
import useSearchQuery from '../src/hooks/useSearchQuery';
import {
  useGetCharactersQuery,
  useInvalidateCacheMutation,
} from '../src/services/rickAndMortyApi';
import { SearchResult } from '../src/model/types';
import '../src/App.css';
import '../src/components/CharacterDetails/CharacterDetails.css';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasError, setHasError] = useState(false);

  const selectedCharacterId = searchParams?.get('characterId');

  const {
    searchTerm,
    storedSearchTerm,
    currentPage,
    handleSearchInputChange: updateSearchTerm,
    handleSearch: executeSearch,
    handlePageChange: changePage,
  } = useSearchQuery('searchTerm', '');

  const [invalidateCache, { isLoading: isInvalidating }] =
    useInvalidateCacheMutation();

  const {
    data: charactersData,
    error: charactersError,
    isLoading,
    isFetching,
    refetch,
  } = useGetCharactersQuery({
    name: storedSearchTerm,
    page: currentPage,
  });

  const searchResults: SearchResult = charactersData || {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    executeSearch();
  };

  const handlePageChange = (page: number) => {
    changePage(page);
  };

  const handleCharacterSelect = (characterId: string) => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      params.set('characterId', characterId);
      params.set('page', currentPage.toString());
      router.push(`/?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      params.set('characterId', characterId);
      params.set('page', currentPage.toString());
      router.push(`/?${params.toString()}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await invalidateCache(undefined);
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  if (hasError) {
    throw new Error('Test error!');
  }

  const isLoadingData = isLoading || isFetching || isInvalidating;

  return (
    <div className="app-container">
      <div className="app-header">
        <Search
          searchTerm={searchTerm}
          onSearchChange={handleSearchInputChange}
          onSearch={handleSearch}
        />
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isLoadingData}
        >
          {isInvalidating ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="main-content">
        <div className="search-results-container">
          {isLoadingData ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading character data...</p>
            </div>
          ) : charactersError ? (
            <div className="error-message">
              <h3>Error loading data</h3>
              <p>
                {charactersError instanceof Error
                  ? charactersError.message
                  : 'Unknown error occurred'}
              </p>
              <button onClick={refetch}>Try Again</button>
            </div>
          ) : searchResults.results.length === 0 ? (
            <div className="no-results">
              <p>No characters found. Try a different search term.</p>
            </div>
          ) : (
            <SearchResults
              searchResults={searchResults}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onSelectCharacter={handleCharacterSelect}
            />
          )}
        </div>

        {selectedCharacterId && <CharacterDetails />}
      </div>

      <button
        onClick={() => {
          setHasError(true);
        }}
      >
        Throw Error
      </button>
      <SelectedItemsFlyout />
    </div>
  );
}
