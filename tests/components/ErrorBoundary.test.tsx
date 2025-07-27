import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useState } from 'react';
import ErrorBoundary from '../../src/components/ErrorBoundary';

const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

const ComponentWithErrorButton = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  const handleClick = () => {
    setShouldThrow(true);
  };

  if (shouldThrow) {
    throw new Error('Error from button click');
  }

  return <button onClick={handleClick}>Throw Error</button>;
};

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-component">Test Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
  });

  it('displays fallback UI when child component throws an error', () => {
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /reload page/i })
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it('calls componentDidCatch when an error occurs', () => {
    const componentDidCatchSpy = vi.spyOn(
      ErrorBoundary.prototype,
      'componentDidCatch'
    );

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(componentDidCatchSpy).toHaveBeenCalled();
    expect(componentDidCatchSpy.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(componentDidCatchSpy.mock.calls[0][0].message).toBe(
      'Test error message'
    );

    componentDidCatchSpy.mockRestore();
  });

  it('reloads the page when the reload button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));

    expect(reloadMock).toHaveBeenCalled();
  });

  it('logs error to console when an error occurs', () => {
    console.error = originalConsoleError;

    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();

    const errorCatchCall = consoleErrorSpy.mock.calls.find(
      (call) => call[0] === 'ErrorBoundary caught an error:'
    );
    const errorInfoCall = consoleErrorSpy.mock.calls.find(
      (call) => call[0] === 'Error info:'
    );

    expect(errorCatchCall).toBeTruthy();
    expect(errorInfoCall).toBeTruthy();

    if (errorCatchCall) {
      expect(errorCatchCall[1]).toBeInstanceOf(Error);
      expect(errorCatchCall[1].message).toBe('Test error message');
    }

    if (errorInfoCall) {
      expect(errorInfoCall[1]).toHaveProperty('componentStack');
    }

    consoleErrorSpy.mockRestore();
  });

  it('catches errors when a button click causes an error', () => {
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ComponentWithErrorButton />
      </ErrorBoundary>
    );

    const errorButton = screen.getByRole('button', { name: 'Throw Error' });
    expect(errorButton).toBeInTheDocument();

    fireEvent.click(errorButton);

    expect(
      screen.queryByRole('button', { name: 'Throw Error' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Error from button click')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /reload page/i })
    ).toBeInTheDocument();

    spy.mockRestore();
  });
});
