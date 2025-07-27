import { useState, useEffect, ChangeEvent } from 'react';
import SearchResults from './components/SearchResults';
import Search from './components/Search';
import './App.css';

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
  name: string;
  status: string;
  species: string;
  image: string;
  episode: string[];
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const getPageFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  };

  useEffect(() => {
    const initialPage = getPageFromUrl();
    setCurrentPage(initialPage);

    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
      fetchSearchResults(savedSearchTerm, initialPage);
    } else {
      fetchSearchResults('', initialPage);
    }

    const handlePopState = () => {
      const newPage = getPageFromUrl();
      setCurrentPage(newPage);
      fetchSearchResults(searchTerm, newPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    setCurrentPage(1);
    updateUrlWithPage(1);
    fetchSearchResults(trimmedSearchTerm, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlWithPage(page);
    fetchSearchResults(searchTerm, page);
  };

  const updateUrlWithPage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url);
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
    <div className="App">
      <Search
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        onSearch={handleSearch}
      />
      {isLoading ? (
        <div className="loader"></div>
      ) : (
        <SearchResults
          searchResults={searchResults}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
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

export default App;
