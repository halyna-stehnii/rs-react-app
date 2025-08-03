import { Person } from '../../model/types';

interface CardProps {
  character: Person;
  onClick?: (character: Person) => void;
}

const Card = ({ character, onClick }: CardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(character);
    }
  };

  return (
    <div className="character-container character-item" onClick={handleClick}>
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
