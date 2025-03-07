import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CarListingPage from './pages/CarListingPage';
import CarDetailPage from './pages/CarDetailPage';
import ScraperPage from './pages/ScraperPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 128px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars" element={<CarListingPage />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/scraper" element={<ScraperPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

export default App; 