import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import CharacterDetails from './components/CharacterDetails';
import NotFound from './components/NotFound';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="character/:id" element={<CharacterDetails />} />
        </Route>
        <Route path="not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
