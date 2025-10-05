/**
 * IndicatorSelector Component
 * Selector de indicador/producto satelital
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { getIndicatorsList } from '../services/gibsConfig';
import '../styles/IndicatorSelector.css';

const IndicatorSelector: React.FC = () => {
  const { indicator, setIndicator, activateBloomPreset, bloomModeActive } = useAppStore();
  const indicators = getIndicatorsList();
  const { t } = useTranslation();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIndicator(e.target.value);
  };
  
  const handleBloomPreset = () => {
    activateBloomPreset();
  };
  
  return (
    <div className="control-section">
      <label htmlFor="indicator-select" className="control-label">
        {t('indicator.label', 'Indicator')}
      </label>
      <select
        id="indicator-select"
        value={indicator}
        onChange={handleChange}
        className="control-select"
      >
        {indicators.map((ind) => (
          <option key={ind.id} value={ind.id}>
            {ind.friendlyName}
          </option>
        ))}
      </select>
      
      <button 
        className="bloom-preset-btn"
        onClick={handleBloomPreset}
        title={
          bloomModeActive
            ? t('bloom.deactivate_title', 'Disable bloom mode and restore previous configuration')
            : t('bloom.activate_title', 'Activate recommended layers for bloom monitoring (NDVI + LST + Precipitation + Crops)')
        }
      >
        {bloomModeActive ? (`❌ ${t('bloom.deactivate', 'Disable Bloom Mode')}`) : (`🌸 ${t('bloom.activate', 'Enable Bloom Mode')}`)}
      </button>
    </div>
  );
};

export default IndicatorSelector;
