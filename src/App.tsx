import { Component } from 'react';
import SearchResults from './components/SearchResults';
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

interface State {
  searchTerm: string;
  searchResults: SearchResult;
}

class App extends Component<object, State> {
  constructor(props: object) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: { count: 0, next: '', previous: '', results: [] },
    };
  }

  componentDidMount() {
    this.fetchSearchResults();
  }

  fetchSearchResults() {
    const searchUrl = 'https://swapi.dev/api/people/';

    fetch(searchUrl)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ searchResults: data });
      })
      .catch((error) => {
        console.error('Error fetching search results', error);
      });
  }

  render() {
    console.log(this.state.searchResults.results);
    return (
      <div className="App">
        <SearchResults searchResults={this.state.searchResults} />
      </div>
    );
  }
}

export default App;
