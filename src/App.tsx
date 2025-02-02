import { Component, ChangeEvent } from 'react';
import SearchResults from './components/SearchResults';
import Search from './components/Search';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

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

interface State {
  searchTerm: string;
  searchResults: SearchResult;
  isLoading: boolean;
}

class App extends Component<object, State> {
  constructor(props: object) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: { count: 0, next: '', previous: '', results: [] },
      isLoading: false,
    };
  }

  componentDidMount() {
    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm) {
      this.setState({ searchTerm: savedSearchTerm });
      this.fetchSearchResults(savedSearchTerm);
    } else {
      this.fetchSearchResults();
    }
  }
  handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSearch = () => {
    const trimmedSearchTerm = this.state.searchTerm.trim();
    this.fetchSearchResults(trimmedSearchTerm);
    localStorage.setItem('searchTerm', trimmedSearchTerm);
  };

  fetchSearchResults(searchTerm = '') {
    const apiBaseUrl = 'https://swapi.dev/api/people/';
    const searchUrl = `${apiBaseUrl}/?search=${searchTerm}`;

    this.setState({ isLoading: true });

    fetch(searchUrl)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ searchResults: data, isLoading: false });
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
        this.setState({ isLoading: false });
      });
  }

  render() {
    return (
      <ErrorBoundary>
        <div className="App">
          <Search
            searchTerm={this.state.searchTerm}
            onSearchChange={this.handleSearchInputChange}
            onSearch={this.handleSearch}
          />
          {this.state.isLoading ? (
            <div className="loader"></div>
          ) : (
            <SearchResults searchResults={this.state.searchResults} />
          )}
          <button
            onClick={() => {
              throw new Error('Test error!');
            }}
          >
            Throw Error
          </button>
        </div>
      </ErrorBoundary>
    );
  }
}

export default App;
