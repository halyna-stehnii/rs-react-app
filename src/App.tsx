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
    localStorage.setItem('searchTerm', trimmedSearchTerm);
  };

  const fetchSearchResults = (term = '') => {
    const apiBaseUrl = 'https://swapi.dev/api/people/';
    const searchUrl = `${apiBaseUrl}/?search=${term}`;

    setIsLoading(true);

    fetch(searchUrl)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data);
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
        <SearchResults searchResults={searchResults} />
      )}
      <button onClick={() => setHasError(true)}>Throw Error</button>
    </div>
  );
};

export default App;
