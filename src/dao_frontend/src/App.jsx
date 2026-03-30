import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import VaultDashboard from './components/VaultDashboard';
import UploadPage from './components/UploadPage';
import ConsentPage from './components/ConsentPage';
import AccessLogPage from './components/AccessLogPage';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import BackgroundParticles from './components/BackgroundParticles';
import './app.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
          <ScrollToTop />

          {/* Create a stacking context so the fixed background sits behind everything */}
          <div className="App relative" style={{ isolation: 'isolate', minHeight: '100vh' }}>
            {/* Background mounted once, never re-mounts across routes */}
            <BackgroundParticles zIndex={-1} />

            {/* Foreground UI (Navbar + Routes) */}
            <div className="relative z-0">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/vault" element={<VaultDashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/consent" element={<ConsentPage />} />
                <Route path="/access-log" element={<AccessLogPage />} />
              </Routes>
            </div>
          </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
