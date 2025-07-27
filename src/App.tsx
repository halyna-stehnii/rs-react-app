import { useState, useEffect, ChangeEvent } from 'react';
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
    next: '',
    previous: '',
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
      fetchSearchResults(savedSearchTerm);
    } else {
      fetchSearchResults();
    }
  }, []);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    fetchSearchResults(trimmedSearchTerm);
  };

  const fetchSearchResults = (searchTerm = '') => {
    const apiBaseUrl = 'https://rickandmortyapi.com/api/character';
    const searchUrl = `${apiBaseUrl}/?name=${searchTerm}`;

    setIsLoading(true);

    fetch(searchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No results found');
        }
        return response.json();
      })
      .then((data) => {
        setSearchResults(data);
        setIsLoading(false);
        if (data.results && data.results.length > 0) {
          localStorage.setItem('searchTerm', searchTerm);
        }
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
        setSearchResults({ count: 0, next: '', previous: '', results: [] });
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
        <SearchResults searchResults={searchResults} />
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
