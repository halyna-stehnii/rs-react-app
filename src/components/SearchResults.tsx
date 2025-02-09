import { SearchResult } from '../App';

interface SearchResultsProps {
  searchResults: SearchResult;
}

const SearchResults = ({ searchResults }: SearchResultsProps) => {
  return (
    <div>
      <h2>Search Results</h2>
      <ul className="search-results">
        {searchResults.results.map((result, index) => (
          <li key={index}>
            <div>Name: {result.name}</div>
            <div>Gender: {result.gender}</div>
            <div>Birth year: {result.birth_year}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
