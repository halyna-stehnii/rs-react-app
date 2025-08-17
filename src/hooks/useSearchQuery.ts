import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { useSearchParams } from 'react-router-dom';

function useSearchQuery(storageKey = 'searchTerm', defaultValue = '') {
  const [storedSearchTerm, setStoredSearchTerm] = useLocalStorage<string>(
    storageKey,
    defaultValue
  );

  const [searchTerm, setSearchTerm] = useState<string>(storedSearchTerm);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
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

    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);

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

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);

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
