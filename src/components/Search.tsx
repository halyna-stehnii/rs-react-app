import { Component, ChangeEvent } from 'react';

interface SearchProps {
  searchTerm: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

class Search extends Component<SearchProps> {
  render() {
    return (
      <div>
        <input
          className="search-input"
          type="text"
          value={this.props.searchTerm}
          onChange={this.props.onSearchChange}
          placeholder="Find StarWars characters"
        />
        <button onClick={this.props.onSearch}>Search</button>
      </div>
    );
  }
}

export default Search;
