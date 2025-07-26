import { Component, ChangeEvent } from 'react';
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

interface State {
  searchTerm: string;
  searchResults: SearchResult;
  isLoading: boolean;
  hasError: boolean;
}

class App extends Component<object, State> {
  constructor(props: object) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: { count: 0, next: '', previous: '', results: [] },
      isLoading: false,
      hasError: false,
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
  };

  fetchSearchResults(searchTerm = '') {
    const apiBaseUrl = 'https://rickandmortyapi.com/api/character';
    const searchUrl = `${apiBaseUrl}/?name=${searchTerm}`;

    this.setState({ isLoading: true });

    fetch(searchUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No results found');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ searchResults: data, isLoading: false });
        if (data.results && data.results.length > 0) {
          localStorage.setItem('searchTerm', searchTerm);
        }
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
        this.setState({
          searchResults: { count: 0, next: '', previous: '', results: [] },
          isLoading: false,
        });
      });
  }

  render() {
    if (this.state.hasError) {
      throw new Error('Test error!');
    }

    return (
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
            this.setState({ hasError: true });
          }}
        >
          Throw Error
        </button>
      </div>
    );
  }
}

export default App;
