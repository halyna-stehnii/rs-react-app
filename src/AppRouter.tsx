import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import CharacterDetails from './components/CharacterDetails';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="character/:id" element={<CharacterDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
