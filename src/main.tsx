import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <AppRouter />
  </Provider>
);
