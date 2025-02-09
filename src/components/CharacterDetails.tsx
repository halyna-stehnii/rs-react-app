import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Person } from '../App';

const CharacterDetails = () => {
  const [character, setCharacter] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await fetch(`https://swapi.dev/api/people/${id}`);
        if (!response.ok) throw new Error('Character not found');
        const data = await response.json();
        setCharacter(data);
      } catch (error) {
        console.error('Error fetching character:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('details');

    navigate({
      pathname: '/',
      search: params.toString(),
    });
  };

  if (isLoading) {
    return (
      <div className="details-panel">
        <div className="loader"></div>
      </div>
    );
  }

  if (!character) {
    return <div className="details-panel">Character not found</div>;
  }

  return (
    <div className="details-panel">
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
      <h2>{character.name}</h2>
      <div className="character-details">
        <p>
          <strong>Height:</strong> {character.height}
        </p>
        <p>
          <strong>Mass:</strong> {character.mass}
        </p>
        <p>
          <strong>Hair Color:</strong> {character.hair_color}
        </p>
        <p>
          <strong>Eye Color:</strong> {character.eye_color}
        </p>
        <p>
          <strong>Birth Year:</strong> {character.birth_year}
        </p>
        <p>
          <strong>Gender:</strong> {character.gender}
        </p>
      </div>
    </div>
  );
};

export default CharacterDetails;
