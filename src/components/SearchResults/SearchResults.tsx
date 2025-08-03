import { SearchResult, Person } from '../../model/types';
import Pagination from '../Pagination/Pagination';
import Card from '../Card/Card';
import './SearchResults.css';

interface SearchResultsProps {
  searchResults: SearchResult;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSelectCharacter?: (characterId: string) => void;
}

const SearchResults = ({
  searchResults,
  currentPage,
  onPageChange,
  onSelectCharacter,
}: SearchResultsProps) => {
  const totalPages = searchResults.info?.pages || searchResults.pages || 1;

  const handleCharacterClick = (character: Person) => {
    if (onSelectCharacter && character.id) {
      onSelectCharacter(character.id.toString());
    }
  };

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
                <Card character={result} onClick={handleCharacterClick} />
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
