'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useGetCharacterByIdQuery } from '../../services/rickAndMortyApi';

const CharacterDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const characterId = searchParams?.get('characterId');

  const {
    data: character,
    isLoading,
    error,
    isFetching,
  } = useGetCharacterByIdQuery(characterId || '', {
    skip: !characterId,
  });

  const handleClose = () => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      params.delete('characterId');
      const newUrl = params.toString() ? `/?${params.toString()}` : '/';
      router.push(newUrl);
    } else {
      router.push('/');
    }
  };

  const isLoadingData = isLoading || isFetching;

  if (isLoadingData) {
    return (
      <div className="details-panel">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        <div className="character-loading">
          <div className="loader"></div>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Loading character details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="details-panel">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        <div className="character-error">
          <h3>{error ? 'Error loading character' : 'Character not found'}</h3>
          {error instanceof Error && <p>{error.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="details-panel">
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
      <div className="details-header">
        <h2>{character.name}</h2>
      </div>
      <div className="character-details">
        <img
          src={character.image || '/no-img.png'}
          alt={character.name}
          className="character-details-image"
        />
        <div className="character-info">
          <p>
            <strong>Status:</strong> {character.status}
          </p>
          <p>
            <strong>Species:</strong> {character.species}
          </p>
          <p>
            <strong>Episodes:</strong> {character.episode.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;
