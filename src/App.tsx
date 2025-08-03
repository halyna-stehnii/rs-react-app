import { useState, useEffect, ChangeEvent } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SearchResults from './components/SearchResults/SearchResults';
import Search from './components/Search/Search';
import useSearchQuery from './hooks/useSearchQuery';
import { SearchResult } from './model/types';
import './App.css';
import './components/CharacterDetails/CharacterDetails.css';

const AppContent = () => {
  const navigate = useNavigate();

  const {
    searchTerm,
    storedSearchTerm,
    currentPage,
    handleSearchInputChange: updateSearchTerm,
    handleSearch: executeSearch,
    handlePageChange: changePage,
  } = useSearchQuery('searchTerm', '');

  const [searchResults, setSearchResults] = useState<SearchResult>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchSearchResults(storedSearchTerm, currentPage);
  }, [storedSearchTerm, currentPage]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const result = executeSearch();
    fetchSearchResults(result.searchTerm, result.page);
  };

  const handlePageChange = (page: number) => {
    const result = changePage(page);
    fetchSearchResults(result.searchTerm, result.page);
  };

  const handleCharacterSelect = (characterId: string) => {
    navigate(`/character/${characterId}?page=${currentPage}`);
  };

  const fetchSearchResults = (searchTerm = '', page = 1) => {
    const apiBaseUrl = 'https://rickandmortyapi.com/api/character';
    const searchUrl = `${apiBaseUrl}/?name=${searchTerm}&page=${page}`;

    setIsLoading(true);

    fetch(searchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No results found');
        }
        return response.json();
      })
      .then((data) => {
        const totalPages = Math.ceil(data.info?.count / 20) || 1;

        setSearchResults({
          ...data,
          pages: totalPages,
        });

        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
        setSearchResults({ count: 0, next: null, previous: null, results: [] });
        setIsLoading(false);
      });
  };

  if (hasError) {
    throw new Error('Test error!');
  }

  return (
    <div className="app-container">
      <Search
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        onSearch={handleSearch}
      />

      <div className="main-content">
        <div className="search-results-container">
          {isLoading ? (
            <div className="loader"></div>
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
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
