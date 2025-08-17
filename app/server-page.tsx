import { Suspense } from 'react';
import { getInitialCharacters } from './actions';
import ClientHomePage from './client-page';
import '../src/App.css';
import '../src/components/CharacterDetails/CharacterDetails.css';

interface HomePageProps {
  searchParams?: Promise<{
    page?: string;
    characterId?: string;
    search?: string;
  }>;
}

function LoadingFallback() {
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading character data...</p>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page, 10) : 1;
  const search = params?.search || '';
  const characterId = params?.characterId || null;

  const initialCharacters = await getInitialCharacters();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientHomePage
        initialCharacters={initialCharacters}
        initialPage={page}
        initialSearch={search}
        selectedCharacterId={characterId}
      />
    </Suspense>
  );
}
