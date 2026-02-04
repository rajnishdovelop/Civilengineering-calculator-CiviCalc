import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import StructuralPage from './pages/StructuralPage';
import GeotechPage from './pages/GeotechPage';
import FluidPage from './pages/FluidPage';
import TransportPage from './pages/TransportPage';
import EnvironmentalPage from './pages/EnvironmentalPage';
import SurveyingPage from './pages/SurveyingPage';
import About from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="structural" element={<StructuralPage />} />
          <Route path="geotech" element={<GeotechPage />} />
          <Route path="fluid" element={<FluidPage />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="environmental" element={<EnvironmentalPage />} />
          <Route path="surveying" element={<SurveyingPage />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
