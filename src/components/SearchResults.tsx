import { SearchResult } from '../App';
import './SearchResults.css';

interface SearchResultsProps {
  searchResults: SearchResult;
}

const SearchResults = ({ searchResults }: SearchResultsProps) => {
  return (
    <div className="results-container">
      <h2 className="search-title">Search Results</h2>
      {searchResults.results.length === 0 ? (
        <div className="no-results-message">No results</div>
      ) : (
        <ul className="search-results">
          {searchResults.results.map((result, index) => (
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
};

export default SearchResults;
