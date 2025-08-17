import { useState, ChangeEvent } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SearchResults from './components/SearchResults/SearchResults';
import Search from './components/Search/Search';
import SelectedItemsFlyout from './components/SelectedItemsFlyout/SelectedItemsFlyout';
import useSearchQuery from './hooks/useSearchQuery';
import {
  useGetCharactersQuery,
  useInvalidateCacheMutation,
} from './services/rickAndMortyApi';
import { SearchResult } from './model/types';
import './App.css';
import './components/CharacterDetails/CharacterDetails.css';

const AppContent = () => {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

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
    navigate(`/character/${characterId}?page=${currentPage}`);
  };

  // Handle manual refresh - force refetch and invalidate cache
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
        <Outlet />
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
};

const App = () => {
  return <AppContent />;
};

export default App;
