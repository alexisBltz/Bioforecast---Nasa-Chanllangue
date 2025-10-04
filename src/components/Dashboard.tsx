/**
 * Dashboard Component
 * Panel derecho con controles de la aplicación
 */
import React from 'react';
import IndicatorSelector from './IndicatorSelector';
import DateControls from './DateControls';
import OpacityControl from './OpacityControl';
import LegendPanel from './LegendPanel';
import MetadataCard from './MetadataCard';
import ActionButtons from './ActionButtons';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
           <h1 className="dashboard-title"><span className="logo-bio">Bio</span><span className="logo-forecast">Forecast</span></h1>
        <p className="subtitle">Visualizador de Fenología Satelital</p>
        <div className="badge-visual">
          <span>📊 Visualización — no valores numéricos</span>
        </div>
      </div>
      
      <div className="dashboard-content">
        <IndicatorSelector />
        <DateControls />
        <OpacityControl />
        <LegendPanel />
        <MetadataCard />
        <ActionButtons />
      </div>
      
      <div className="dashboard-footer">
        <p className="attribution">
          <small>
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
            {' | '}
            © <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a> / EOSDIS
          </small>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
