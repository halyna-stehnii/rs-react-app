import { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  const updateURL = (search: string, page: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

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
  }, [searchParams, setSearchParams]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    updateURL(trimmedSearchTerm, 1);
    fetchSearchResults(trimmedSearchTerm, 1);
    localStorage.setItem('searchTerm', trimmedSearchTerm);
  };

  const handlePageChange = (newPage: number) => {
    updateURL(searchTerm, newPage);
    fetchSearchResults(searchTerm, newPage);
  };

  const fetchSearchResults = (term = '', page = 1) => {
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
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: SearchResult) => {
        setSearchResults({
          count: data.count,
          next: data.next || '',
          previous: data.previous || '',
          results: data.results,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
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
      <button onClick={() => setHasError(true)}>Throw Error</button>
    </div>
  );
};

export default App;
