import { SearchResult } from '../App';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const totalPages = Math.ceil(searchResults.count / 10); // SWAPI returns 10 results per page

  const handleCharacterClick = (index: number) => {
    const itemsPerPage = 10;
    const id = (currentPage - 1) * itemsPerPage + index + 1;

    // Update search params to include both page and details
    const params = new URLSearchParams(searchParams);
    params.set('details', id.toString());
    if (currentPage > 1) params.set('page', currentPage.toString());

    navigate({
      pathname: `/character/${id}`,
      search: params.toString(),
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  const renderPaginationControls = () => {
    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!searchResults.next || currentPage >= totalPages}
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
          <li
            key={index}
            onClick={() => handleCharacterClick(index)}
            className="character-item"
          >
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
