import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useLocalStorage from '../../src/hooks/useLocalStorage';

describe('useLocalStorage hook', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    const mockLocalStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        localStorageMock = Object.fromEntries(
          Object.entries(localStorageMock).filter(([k]) => k !== key)
        );
      },
      clear: () => {
        localStorageMock = {};
      },
      length: 0,
      key: (): string => '',
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    const originalAddEventListener = window.addEventListener;
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event, handler, options) => {
        if (event === 'storage') {
          return;
        }
        return originalAddEventListener(
          event,
          handler as EventListener,
          options
        );
      }
    );
  });

  it('should initialize with initial value if localStorage is empty', () => {
    const initialValue = 'initial value';
    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );
    const [storedValue] = result.current;

    expect(storedValue).toBe(initialValue);
  });

  it('should use value from localStorage if available', () => {
    const initialValue = 'initial value';
    const localStorageValue = 'value from storage';
    localStorageMock['testKey'] = JSON.stringify(localStorageValue);

    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );
    const [storedValue] = result.current;

    expect(storedValue).toBe(localStorageValue);
  });

  it('should update localStorage when setValue is called', () => {
    const initialValue = 'initial value';
    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );

    const newValue = 'new value';
    act(() => {
      const setValue = result.current[1];
      setValue(newValue);
    });

    expect(result.current[0]).toBe(newValue);
    expect(JSON.parse(localStorageMock['testKey'])).toBe(newValue);
  });

  it('should handle function updates correctly', () => {
    const initialValue = { count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );

    act(() => {
      const setValue = result.current[1];
      setValue((prev) => ({ count: prev.count + 1 }));
    });

    expect(result.current[0]).toEqual({ count: 1 });
    expect(JSON.parse(localStorageMock['testKey'])).toEqual({ count: 1 });
  });

  it('should handle errors when reading from localStorage', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('getItem error');
    });

    const initialValue = 'initial value';
    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );

    expect(result.current[0]).toBe(initialValue);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when writing to localStorage', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('setItem error');
    });

    const initialValue = 'initial value';
    const { result } = renderHook(() =>
      useLocalStorage('testKey', initialValue)
    );

    act(() => {
      const setValue = result.current[1];
      setValue('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
