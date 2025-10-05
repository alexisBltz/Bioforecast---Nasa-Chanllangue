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
import { useTranslation } from 'react-i18next';

function App() {
  const initializeFromURL = useAppStore((state) => state.initializeFromURL);
  // overlayOpen controls whether the dashboard is shown as an overlay on small screens
  const [overlayOpen, setOverlayOpen] = useState(false);
  const { t } = useTranslation();
  
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
            aria-label={overlayOpen ? t('close_panel') : t('open_panel')}
            onClick={() => setOverlayOpen((v) => !v)}
          >
            <svg className="hamburger-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
        {/* Backdrop shown only when overlayOpen */}
        {overlayOpen && <div className="overlay-backdrop" onClick={() => setOverlayOpen(false)} />}

        <div className="dashboard-section">
          {/* Close button visible in overlay mode */}
          {overlayOpen && (
            <button className="overlay-close" aria-label={t('close_panel')} onClick={() => setOverlayOpen(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          )}
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
