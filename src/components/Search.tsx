import { ChangeEvent } from 'react';

interface SearchProps {
  searchTerm: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
}

const Search = ({ searchTerm, onSearchChange, onSearch }: SearchProps) => {
  return (
    <div>
      <input
        className="search-input"
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Find StarWars characters"
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
};

export default Search;
