import { Person } from '../../model/types';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleCharacterSelection,
  selectSelectedCharacters,
} from '../../redux/charactersSlice';

interface CardProps {
  character: Person;
  onClick?: (character: Person) => void;
}

const Card = ({ character, onClick }: CardProps) => {
  const dispatch = useDispatch();
  const selectedCharacters = useSelector(selectSelectedCharacters);

  const isSelected = character.id ? !!selectedCharacters[character.id] : false;

  const handleClick = () => {
    if (onClick) {
      onClick(character);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleCharacterSelection(character));
  };

  return (
    <div className="character-container character-item" onClick={handleClick}>
      <div className="checkbox-container">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="character-image">
        <img
          src={character.image || 'no-img.png'}
          alt={character.name || 'No data'}
        />
      </div>
      <div className="character-info">
        <div>Name: {character.name || 'No data'}</div>
        <div>Status: {character.status || 'No data'}</div>
        <div>Species: {character.species || 'No data'}</div>
      </div>
    </div>
  );
};

export default Card;
