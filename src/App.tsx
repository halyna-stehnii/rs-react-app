import { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import SearchResults from './components/SearchResults';
import Search from './components/Search';
import './App.css';
import './components/CharacterDetails.css';

export type SearchResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Person[];
  pages?: number;
  info?: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
};

export type Person = {
  id?: number;
  name: string;
  status: string;
  species: string;
  image: string;
  episode: string[];
};

const AppContent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1
  );

  useEffect(() => {
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
    setCurrentPage(initialPage);

    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
      fetchSearchResults(savedSearchTerm, initialPage);
    } else {
      fetchSearchResults('', initialPage);
    }
  }, [pageParam]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    setCurrentPage(1);

    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);

    fetchSearchResults(trimmedSearchTerm, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);

    fetchSearchResults(searchTerm, page);
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
        if (data.results && data.results.length > 0) {
          localStorage.setItem('searchTerm', searchTerm);
        }
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
