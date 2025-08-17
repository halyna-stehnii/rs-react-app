'use server';

import fs from 'fs';
import path from 'path';
import { SearchResult, Person } from '../src/model/types';

const BASE_URL = 'https://rickandmortyapi.com/api';

export async function getCharacters(searchParams?: {
  name?: string;
  page?: number;
}): Promise<SearchResult> {
  const { name = '', page = 1 } = searchParams || {};

  try {
    const url = `${BASE_URL}/character/?name=${name}&page=${page}`;
    const response = await fetch(url, {
      cache: 'force-cache',
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      count: data.info?.count || 0,
      next: data.info?.next || null,
      previous: data.info?.prev || null,
      results: data.results || [],
    };
  } catch (error) {
    console.error('Error fetching characters:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

export async function getCharacterById(id: string): Promise<Person | null> {
  try {
    const response = await fetch(`${BASE_URL}/character/${id}`, {
      cache: 'force-cache',
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const character = await response.json();
    return character;
  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
}

export async function getInitialCharacters(): Promise<SearchResult> {
  return getCharacters();
}

export async function generateCSVReport(): Promise<string> {
  const csvPath = path.join(process.cwd(), 'data', 'characters.csv');
  const csvContent = await fs.promises.readFile(csvPath, 'utf-8');

  return csvContent;
}
