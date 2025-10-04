/**
 * App Component
 * Componente raíz de la aplicación
 */
import { useEffect } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import { useAppStore } from './store/appStore';
import './styles/App.css';

function App() {
  const initializeFromURL = useAppStore((state) => state.initializeFromURL);
  
  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);
  
  return (
    <div className="app">
      <div className="app-layout">
        <div className="map-section">
          <MapView />
        </div>
        <div className="dashboard-section">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
