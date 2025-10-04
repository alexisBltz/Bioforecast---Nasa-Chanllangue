/**
 * IndicatorSelector Component
 * Selector de indicador/producto satelital
 */
import React from 'react';
import { useAppStore } from '../store/appStore';
import { getIndicatorsList } from '../services/gibsConfig';
import '../styles/IndicatorSelector.css';

const IndicatorSelector: React.FC = () => {
  const { indicator, setIndicator, activateBloomPreset } = useAppStore();
  const indicators = getIndicatorsList();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIndicator(e.target.value);
  };
  
  const handleBloomPreset = () => {
    activateBloomPreset();
  };
  
  return (
    <div className="control-section">
      <label htmlFor="indicator-select" className="control-label">
        Indicador
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
        title="Activa capas recomendadas para monitoreo de floración (NDVI + EVI + LST)"
      >
        🌸 Activar Modo Floración
      </button>
    </div>
  );
};

export default IndicatorSelector;
