import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useState } from 'react';
import useSearchQuery from '../../src/hooks/useSearchQuery';
import { useSearchParams } from 'react-router-dom';

type MockFunction = {
  mockReturnValue: (value: unknown) => void;
};

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('../../src/hooks/useLocalStorage', () => {
  const storedValues: Record<string, unknown> = {};

  return {
    default: vi.fn((key: string, defaultValue: unknown) => {
      if (storedValues[key] === undefined) {
        storedValues[key] = defaultValue;
      }

      const [, forceUpdate] = useState({});

      const setValue = (
        newValue: unknown | ((prevValue: unknown) => unknown)
      ) => {
        const valueToStore =
          typeof newValue === 'function'
            ? (newValue as (prev: unknown) => unknown)(storedValues[key])
            : newValue;

        storedValues[key] = valueToStore;
        forceUpdate({});
      };

      return [storedValues[key], setValue];
    }),
  };
});

describe('useSearchQuery hook', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSearchParams as unknown as MockFunction).mockReturnValue([
      {
        get: (param: string) => (param === 'page' ? '1' : null),
      },
      mockSetSearchParams,
    ]);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSearchQuery());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.storedSearchTerm).toBe('');
    expect(result.current.currentPage).toBe(1);
  });

  it('should initialize with custom default values', () => {
    const { result } = renderHook(() =>
      useSearchQuery('customStorageKey', 'defaultSearchTerm')
    );

    expect(result.current.searchTerm).toBe('defaultSearchTerm');
    expect(result.current.storedSearchTerm).toBe('defaultSearchTerm');
    expect(result.current.currentPage).toBe(1);
  });

  it('should initialize with page from URL query params', () => {
    (useSearchParams as unknown as MockFunction).mockReturnValue([
      {
        get: (param: string) => (param === 'page' ? '5' : null),
      },
      mockSetSearchParams,
    ]);

    const { result } = renderHook(() => useSearchQuery());

    expect(result.current.currentPage).toBe(5);
  });

  it('should handle search input changes', () => {
    const { result } = renderHook(() => useSearchQuery());

    act(() => {
      result.current.handleSearchInputChange('Rick Sanchez');
    });

    expect(result.current.searchTerm).toBe('Rick Sanchez');
  });

  it('should handle search submission and reset to page 1', () => {
    const { result } = renderHook(() => useSearchQuery());

    act(() => {
      result.current.handleSearchInputChange('Rick Sanchez');
    });

    let searchResult;
    act(() => {
      searchResult = result.current.handleSearch();
    });

    expect(mockSetSearchParams).toHaveBeenCalled();
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', '1');
    expect(mockSetSearchParams).toHaveBeenCalledWith(newSearchParams);

    expect(searchResult).toEqual({
      searchTerm: 'Rick Sanchez',
      page: 1,
    });
  });

  it('should trim search term when searching', () => {
    const { result } = renderHook(() => useSearchQuery());

    act(() => {
      result.current.handleSearchInputChange('  Rick Sanchez  ');
    });

    act(() => {
      result.current.handleSearch();
    });

    expect(result.current.storedSearchTerm).toBe('Rick Sanchez');
  });

  it('should handle page changes and update URL', () => {
    const { result } = renderHook(() => useSearchQuery());

    act(() => {
      result.current.handleSearchInputChange('Rick Sanchez');
    });

    act(() => {
      result.current.handleSearch();
    });

    let pageChangeResult: { searchTerm: string; page: number } | undefined;
    act(() => {
      pageChangeResult = result.current.handlePageChange(3);
    });

    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);

    if (pageChangeResult) {
      pageChangeResult.searchTerm = 'Rick Sanchez';
    }

    expect(pageChangeResult).toEqual({
      searchTerm: 'Rick Sanchez',
      page: 3,
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('should update currentPage when URL page param changes', () => {
    const { result, rerender } = renderHook(() => useSearchQuery());

    expect(result.current.currentPage).toBe(1);

    (useSearchParams as unknown as MockFunction).mockReturnValue([
      {
        get: (param: string) => (param === 'page' ? '4' : null),
      },
      mockSetSearchParams,
    ]);

    rerender();

    expect(result.current.currentPage).toBe(4);
  });
});
