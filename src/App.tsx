/**
 * App Component
 * Componente raíz de la aplicación
 */
import { useEffect } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import { useAppStore } from './store/appStore';
import './styles/App.css';
import { useState } from 'react';

function App() {
  const initializeFromURL = useAppStore((state) => state.initializeFromURL);
  // overlayOpen controls whether the dashboard is shown as an overlay on small screens
  const [overlayOpen, setOverlayOpen] = useState(false);
  
  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);
  
  return (
    <div className="app">
      <div className={`app-layout ${overlayOpen ? 'overlay-open' : ''}`}>
        <div className="map-section">
          <MapView />
          {/* Hamburger toggle */}
          <button
            className="hamburger-toggle"
            aria-label={overlayOpen ? 'Cerrar panel' : 'Abrir panel'}
            onClick={() => setOverlayOpen((v) => !v)}
          >
            <span className="hamburger-icon">☰</span>
          </button>
        </div>
        {/* Backdrop shown only when overlayOpen */}
        {overlayOpen && <div className="overlay-backdrop" onClick={() => setOverlayOpen(false)} />}

        <div className="dashboard-section">
          {/* Close button visible in overlay mode */}
          {overlayOpen && (
            <button className="overlay-close" aria-label="Cerrar panel" onClick={() => setOverlayOpen(false)}>
              ✕
            </button>
          )}
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
