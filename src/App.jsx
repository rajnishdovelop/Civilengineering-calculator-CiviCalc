import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy load all pages to reduce initial bundle size
const Home = React.lazy(() => import('./pages/Home'));
const StructuralPage = React.lazy(() => import('./pages/StructuralPage'));
const GeotechPage = React.lazy(() => import('./pages/GeotechPage'));
const FluidPage = React.lazy(() => import('./pages/FluidPage'));
const TransportPage = React.lazy(() => import('./pages/TransportPage'));
const EnvironmentalPage = React.lazy(() => import('./pages/EnvironmentalPage'));
const SurveyingPage = React.lazy(() => import('./pages/SurveyingPage'));
const About = React.lazy(() => import('./pages/About'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          } />
          <Route path="structural" element={
            <Suspense fallback={<PageLoader />}>
              <StructuralPage />
            </Suspense>
          } />
          <Route path="geotech" element={
            <Suspense fallback={<PageLoader />}>
              <GeotechPage />
            </Suspense>
          } />
          <Route path="fluid" element={
            <Suspense fallback={<PageLoader />}>
              <FluidPage />
            </Suspense>
          } />
          <Route path="transport" element={
            <Suspense fallback={<PageLoader />}>
              <TransportPage />
            </Suspense>
          } />
          <Route path="environmental" element={
            <Suspense fallback={<PageLoader />}>
              <EnvironmentalPage />
            </Suspense>
          } />
          <Route path="surveying" element={
            <Suspense fallback={<PageLoader />}>
              <SurveyingPage />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
