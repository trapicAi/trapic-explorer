import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { TracePage } from '@/pages/TracePage';
import { ChainPage } from '@/pages/ChainPage';

function App() {
  return (
    <BrowserRouter basename="/trapic-explorer">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/d/:dataset" element={<ExplorePage />} />
        <Route path="/d/:dataset/trace/:id" element={<TracePage />} />
        <Route path="/d/:dataset/chain/:id" element={<ChainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
