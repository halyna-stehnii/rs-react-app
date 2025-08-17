export type SearchResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Person[];
  pages?: number;
  info?: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
};

export type Person = {
  id?: number;
  name: string;
  status: string;
  species: string;
  image: string;
  episode: string[];
};
