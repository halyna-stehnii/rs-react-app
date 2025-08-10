import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CharacterDetails from '../../src/components/CharacterDetails/CharacterDetails';
import React from 'react';
import { renderWithRedux } from '../utils/test-utils';
import { useGetCharacterByIdQuery } from '../../src/services/rickAndMortyApi';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn().mockReturnValue({ characterId: '1' });
const mockSearchParams = new URLSearchParams({ page: '1' });

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

vi.mock('../../src/services/rickAndMortyApi', () => {
  const mockCharacterData = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['episode1', 'episode2', 'episode3'],
  };

  return {
    rickAndMortyApi: {
      endpoints: {},
      reducerPath: 'rickAndMortyApi',
      reducer: () => ({}),
      middleware: () => () => {},
    },
    useGetCharacterByIdQuery: vi.fn().mockReturnValue({
      data: mockCharacterData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    }),
  };
});

describe('CharacterDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays character details', () => {
    renderWithRedux(<CharacterDetails />);

    // Check character details are displayed
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Alive')).toBeInTheDocument();
    expect(screen.getByText('Species:')).toBeInTheDocument();
    expect(screen.getByText('Human')).toBeInTheDocument();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute(
      'src',
      'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
    );
    expect(image).toHaveAttribute('alt', 'Rick Sanchez');
  });

  it('shows loading state when data is loading', () => {
    vi.mocked(useGetCharacterByIdQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithRedux(<CharacterDetails />);
    expect(screen.getByText(/loading character details/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    vi.mocked(useGetCharacterByIdQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithRedux(<CharacterDetails />);
    expect(screen.getByText(/error loading character/i)).toBeInTheDocument();
  });

  it('has a working close button', async () => {
    renderWithRedux(<CharacterDetails />);

    const closeButton = screen.getByRole('button', { name: /×/i });
    expect(closeButton).toBeInTheDocument();

    await userEvent.click(closeButton);
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/',
      search: 'page=1',
    });
  });
});
