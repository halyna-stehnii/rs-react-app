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
        {this.props.searchResults.results.length === 0 ? (
          <div className="no-results-message">No results</div>
        ) : (
          <ul className="search-results">
            {this.props.searchResults.results.map((result, index) => (
              <li key={index}>
                <div className="character-container">
                  <div className="character-image">
                    <img
                      src={result.image || 'no-image.png'}
                      alt={result.name || 'No data'}
                    />
                  </div>
                  <div className="character-info">
                    <div>Name: {result.name || 'No data'}</div>
                    <div>Status: {result.status || 'No data'}</div>
                    <div>Species: {result.species || 'No data'}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default SearchResults;
