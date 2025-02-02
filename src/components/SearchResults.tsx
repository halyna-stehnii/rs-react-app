import React from 'react';
import { SearchResult } from '../App';

interface SearchResultsProps {
  searchResults: SearchResult;
}

class SearchResults extends React.Component<SearchResultsProps> {
  render() {
    console.log('SearchResults ', this.props.searchResults);

    return (
      <div className="bottom-section">
        <h2>Search Results</h2>
        <ul>
          {this.props.searchResults.results.map((result, index) => (
            <li key={index}>
              <div>Name: {result.name}</div>
              <div>Gender: {result.gender}</div>
              <div>Birth year: {result.birth_year}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default SearchResults;
