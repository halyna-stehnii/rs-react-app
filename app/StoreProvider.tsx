'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../src/redux/store';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reduxStore] = useState(() => store);

  return <Provider store={reduxStore}>{children}</Provider>;
}
