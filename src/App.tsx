import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { useSearchParams, Outlet, useNavigate } from 'react-router-dom';
import SearchResults from './components/SearchResults';
import Search from './components/Search';
import './App.css';

export type SearchResult = {
  count: number;
  next: string;
  previous: string;
  results: Person[];
};

export type Person = {
  birth_year: string;
  created: string;
  edited: string;
  eye_color: string;
  films: string[];
  gender: string;
  hair_color: string;
  height: string;
  homeworld: string;
  mass: string;
  name: string;
  skin_color: string;
  species: string[];
  starships: string[];
  vehicles: string[];
};

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({
    count: 0,
    next: '',
    previous: '',
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentPage = Number(searchParams.get('page')) || 1;

  const navigate = useNavigate();

  const fetchSearchResults = useCallback(
    (term = '', page = 1) => {
      const apiBaseUrl = 'https://swapi.dev/api/people';
      const params = new URLSearchParams({
        search: term,
        page: page.toString(),
      });
      const searchUrl = `${apiBaseUrl}/?${params.toString()}`;

      setIsLoading(true);

      fetch(searchUrl)
        .then((response) => {
          if (!response.ok) {
            // If page not found, reset to page 1
            if (response.status === 404 && page > 1) {
              const params = new URLSearchParams(searchParams);
              params.delete('page');
              setSearchParams(params);
              fetchSearchResults(term, 1);
              return;
            }
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data: SearchResult | undefined) => {
          if (data) {
            setSearchResults({
              count: data.count,
              next: data.next || '',
              previous: data.previous || '',
              results: data.results,
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching search results', error);
          setIsLoading(false);
          setSearchResults({
            count: 0,
            next: '',
            previous: '',
            results: [],
          });
        });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const updateURLAndFetch = (search: string, page: number) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (page > 1) params.set('page', page.toString());
      setSearchParams(params);
      fetchSearchResults(search, page);
    };

    const savedSearchTerm = localStorage.getItem('searchTerm');
    const urlSearchTerm = searchParams.get('search') || '';
    const urlPage = Number(searchParams.get('page')) || 1;

    if (urlSearchTerm || urlPage > 1) {
      // If we have URL parameters, use them
      setSearchTerm(urlSearchTerm);
      fetchSearchResults(urlSearchTerm, urlPage);
    } else if (savedSearchTerm) {
      // If no URL parameters but we have saved search, use that
      setSearchTerm(savedSearchTerm);
      updateURLAndFetch(savedSearchTerm, 1);
    } else {
      // Default case: empty search, first page
      fetchSearchResults('', 1);
    }
  }, [searchParams, setSearchParams, fetchSearchResults]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    const params = new URLSearchParams(searchParams);

    if (trimmedSearchTerm) {
      params.set('search', trimmedSearchTerm);
    } else {
      params.delete('search');
    }

    params.delete('page'); // Reset to page 1 on new search
    setSearchParams(params);
    fetchSearchResults(trimmedSearchTerm, 1);
    localStorage.setItem('searchTerm', trimmedSearchTerm);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page'); // Remove page parameter when going back to page 1
    }
    setSearchParams(params);
    fetchSearchResults(searchTerm, newPage);
  };

  // Add this to handle background clicks
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      navigate('/');
    }
  };

  if (hasError) {
    throw new Error('Test error!');
  }

  return (
    <div className="App">
      <div className="split-view" onClick={handleBackgroundClick}>
        <div className="search-panel">
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
          <button onClick={() => setHasError(true)}>Throw Error</button>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default App;
