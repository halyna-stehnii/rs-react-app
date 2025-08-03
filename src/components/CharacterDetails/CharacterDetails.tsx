import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Person } from '../../App';

const CharacterDetails = () => {
  const [character, setCharacter] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId) {
        setError('No character ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/${characterId}`
        );
        if (!response.ok) throw new Error('Character not found');
        const data = await response.json();
        setCharacter(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch character details'
        );
        setCharacter(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

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
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Loading character details...
        </p>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="details-panel">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        {error || 'Character not found'}
      </div>
    );
  }

  return (
    <div className="details-panel">
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
      <h2>{character.name}</h2>
      <div className="character-details">
        <img
          src={character.image || '/no-img.png'}
          alt={character.name}
          className="character-details-image"
        />
        <p>
          <strong>Status:</strong> {character.status}
        </p>
        <p>
          <strong>Species:</strong> {character.species}
        </p>
      </div>
    </div>
  );
};

export default CharacterDetails;
