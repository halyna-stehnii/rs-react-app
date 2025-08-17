import type { Metadata } from 'next';
import StoreProvider from './StoreProvider';
import ErrorBoundary from '../src/components/ErrorBoundary/ErrorBoundary';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Rick and Morty Characters',
  description: 'A Rick and Morty character search application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </StoreProvider>
      </body>
    </html>
  );
}
