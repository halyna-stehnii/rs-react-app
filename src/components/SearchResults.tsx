import { SearchResult } from '../App';
import Pagination from './Pagination';
import './SearchResults.css';

interface SearchResultsProps {
  searchResults: SearchResult;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const SearchResults = ({
  searchResults,
  currentPage,
  onPageChange,
}: SearchResultsProps) => {
  const totalPages = searchResults.info?.pages || searchResults.pages || 1;

  return (
    <div className="results-container">
      <h2 className="search-title">Search Results</h2>
      {searchResults.results.length === 0 ? (
        <div className="no-results-message">No results</div>
      ) : (
        <>
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default SearchResults;
