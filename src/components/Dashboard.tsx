/**
 * Dashboard Component
 * Panel derecho con controles de la aplicación
 */
import React from 'react';
import MultiLayerSelector from './MultiLayerSelector';
import { useAppStore } from '../store/appStore';
import IndicatorSelector from './IndicatorSelector';
import DateControls from './DateControls';
import OpacityControl from './OpacityControl';
import LegendPanel from './LegendPanel';
import MetadataCard from './MetadataCard';
import ActionButtons from './ActionButtons';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const activeLayers = useAppStore((state) => state.activeLayers);
  const { t } = useTranslation();
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-layout">
          <div className="logo-section">
            <img src="/logo.png" alt="BioForecast Logo" className="title-logo" />
          </div>
          <div className="text-section">
            <div className="title-row">
              <h1 className="dashboard-title"><span className="logo-bio">Bio</span><span className="logo-forecast">Forecast</span></h1>
              <LanguageSwitcher />
            </div>
            <p className="subtitle">{t('dashboard.subtitle', 'Satellite Phenology Viewer')}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        <IndicatorSelector />
        {activeLayers.length > 1 && <MultiLayerSelector />}
        <OpacityControl />
        <DateControls />
        <LegendPanel />
        <MetadataCard />
      </div>
      <ActionButtons />
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
