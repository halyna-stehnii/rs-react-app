'use client';

import { useState, ChangeEvent, useEffect } from 'react';
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
import { getCharacters } from './actions';

interface ClientHomePageProps {
  initialCharacters: SearchResult;
  initialPage: number;
  initialSearch: string;
  selectedCharacterId: string | null;
}

export default function ClientHomePage({
  initialCharacters,
  initialSearch,
  selectedCharacterId,
}: ClientHomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasError, setHasError] = useState(false);
  const [serverData, setServerData] = useState<SearchResult>(initialCharacters);
  const [isServerLoading, setIsServerLoading] = useState(false);

  const {
    searchTerm,
    storedSearchTerm,
    currentPage,
    handleSearchInputChange: updateSearchTerm,
    handleSearch: executeSearch,
    handlePageChange: changePage,
  } = useSearchQuery('searchTerm', initialSearch);

  const [invalidateCache, { isLoading: isInvalidating }] =
    useInvalidateCacheMutation();

  const shouldUseClientQuery = storedSearchTerm.length > 0;

  const {
    data: clientCharactersData,
    error: clientCharactersError,
    isLoading: isClientLoading,
    isFetching: isClientFetching,
    refetch: clientRefetch,
  } = useGetCharactersQuery(
    {
      name: storedSearchTerm,
      page: currentPage,
    },
    {
      skip: !shouldUseClientQuery,
    }
  );

  useEffect(() => {
    const handleServerPagination = async () => {
      if (!shouldUseClientQuery && currentPage !== 1) {
        setIsServerLoading(true);
        try {
          const newData = await getCharacters({ page: currentPage });
          setServerData(newData);
        } catch (error) {
          console.error('Error loading server data:', error);
        } finally {
          setIsServerLoading(false);
        }
      }
    };

    handleServerPagination();
  }, [currentPage, shouldUseClientQuery]);

  const searchResults: SearchResult = shouldUseClientQuery
    ? clientCharactersData || {
        count: 0,
        next: null,
        previous: null,
        results: [],
      }
    : serverData;

  const charactersError = shouldUseClientQuery ? clientCharactersError : null;
  const isLoading = shouldUseClientQuery ? isClientLoading : isServerLoading;
  const isFetching = shouldUseClientQuery ? isClientFetching : false;

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    executeSearch();
  };

  const handlePageChange = (page: number) => {
    changePage(page);

    const params = new URLSearchParams(searchParams || undefined);
    params.set('page', page.toString());
    if (selectedCharacterId) {
      params.set('characterId', selectedCharacterId);
    }
    if (storedSearchTerm) {
      params.set('search', storedSearchTerm);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCharacterSelect = (characterId: string) => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      params.set('characterId', characterId);
      params.set('page', currentPage.toString());
      if (storedSearchTerm) {
        params.set('search', storedSearchTerm);
      }
      router.push(`/?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      params.set('characterId', characterId);
      params.set('page', currentPage.toString());
      if (storedSearchTerm) {
        params.set('search', storedSearchTerm);
      }
      router.push(`/?${params.toString()}`);
    }
  };

  const handleRefresh = async () => {
    try {
      if (shouldUseClientQuery) {
        await invalidateCache(undefined);
        await clientRefetch();
      } else {
        setIsServerLoading(true);
        const newData = await getCharacters({ page: currentPage });
        setServerData(newData);
        setIsServerLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsServerLoading(false);
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
          {isInvalidating || isServerLoading ? 'Refreshing...' : 'Refresh Data'}
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
            <div>
              <div className="no-results-message">No results</div>
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
