import { SearchResult } from '../App';

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
  const totalPages = Math.ceil(searchResults.count / 10); // SWAPI returns 10 results per page

  const renderPaginationControls = () => {
    return (
      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      <h2>Search Results</h2>
      {searchResults.count > 0 && (
        <p className="results-count">Found {searchResults.count} results</p>
      )}
      <ul className="search-results">
        {searchResults.results.map((result, index) => (
          <li key={index}>
            <div>Name: {result.name}</div>
            <div>Gender: {result.gender}</div>
            <div>Birth year: {result.birth_year}</div>
          </li>
        ))}
      </ul>
      {searchResults.count > 10 && renderPaginationControls()}
    </div>
  );
};

export default SearchResults;
