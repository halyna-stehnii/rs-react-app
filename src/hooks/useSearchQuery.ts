'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useLocalStorage from './useLocalStorage';

function useSearchQuery(storageKey = 'searchTerm', defaultValue = '') {
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage<string>(
    storageKey,
    defaultValue
  );

  const [searchTerm, setSearchTerm] = useState<string>(storedSearchTerm);

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams?.get('page');
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1
  );

  useEffect(() => {
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
    setCurrentPage(initialPage);
  }, [pageParam]);

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`/?${params.toString()}`);

    if (trimmedSearchTerm) {
      setStoredSearchTerm(trimmedSearchTerm);
    }

    return {
      searchTerm: trimmedSearchTerm,
      page: 1,
    };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL with new page
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', page.toString());
    router.push(`/?${params.toString()}`);

    return {
      searchTerm: storedSearchTerm,
      page,
    };
  };

  return {
    searchTerm,
    storedSearchTerm,
    currentPage,
    handleSearchInputChange,
    handleSearch,
    handlePageChange,
  };
}

export default useSearchQuery;
