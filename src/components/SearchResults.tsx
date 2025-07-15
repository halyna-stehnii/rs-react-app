import React from 'react';
import { SearchResult } from '../App';
import './SearchResults.css';

interface SearchResultsProps {
  searchResults: SearchResult;
}

class SearchResults extends React.Component<SearchResultsProps> {
  render() {
    return (
      <div className="results-container">
        <h2 className="search-title">Search Results</h2>
        <ul className="search-results">
          {this.props.searchResults.results.map((result, index) => (
            <li key={index}>
              <div className="character-container">
                <div className="character-image">
                  <img src={result.image} alt={result.name} />
                </div>
                <div className="character-info">
                  <div>Name: {result.name}</div>
                  <div>Status: {result.status}</div>
                  <div>Species: {result.species}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default SearchResults;
