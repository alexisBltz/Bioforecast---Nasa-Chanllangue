/**
 * MultiLayerSelector Component
 * Selector multi-capa con checkboxes y controles de opacidad
 */
import React from 'react';
import { useAppStore } from '../store/appStore';
import { getIndicatorsList } from '../services/gibsConfig';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import '../styles/MultiLayerSelector.css';

const MultiLayerSelector: React.FC = () => {
  const { activeLayers, toggleLayer, setLayerOpacity, activateBloomPreset, bloomModeActive } = useAppStore();
  const indicators = getIndicatorsList();
  
  const isLayerActive = (layerId: string) => {
    const layer = activeLayers.find(l => l.id === layerId);
    return layer?.visible || false;
  };
  
  const getLayerOpacity = (layerId: string) => {
    const layer = activeLayers.find(l => l.id === layerId);
    return layer?.opacity || 0.8;
  };
  
  const handleToggle = (layerId: string) => {
    toggleLayer(layerId);
  };
  
  const handleOpacityChange = (layerId: string, value: number | number[]) => {
    const opacity = Array.isArray(value) ? value[0] : value;
    setLayerOpacity(layerId, opacity / 100);
  };
  
  const handleBloomPreset = () => {
    activateBloomPreset();
  };
  
  return (
    <div className="control-section multi-layer-selector">
      <div className="section-header">
        <label className="control-label">Capas Activas</label>
        <button
          onClick={handleBloomPreset}
          className="bloom-preset-button"
          title={
            bloomModeActive
              ? 'Desactiva el modo floración y restaura las capas previas'
              : 'Activa capas optimizadas para detección de floración'
          }
        >
          {bloomModeActive ? '❌ Desactivar Modo Floración' : '🌸 Activar Modo Floración'}
        </button>
      </div>
      
      <div className="bloom-preset-info">
        <small>💡 Modo Floración: Combina NDVI, temperatura superficial, precipitación y cultivos para identificar períodos de floración probable.</small>
      </div>
      
      <div className="layers-list">
        {indicators.map((indicator) => {
          const isActive = isLayerActive(indicator.id);
          const opacity = getLayerOpacity(indicator.id);
          
          return (
            <div key={indicator.id} className="layer-item">
              <div className="layer-header">
                <label className="layer-checkbox">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggle(indicator.id)}
                  />
                  <span className="layer-name" title={indicator.description}>
                    {indicator.friendlyName}
                  </span>
                </label>
              </div>
              
              {isActive && (
                <div className="layer-controls">
                  <div className="opacity-control-compact">
                    <label className="opacity-label">
                      Opacidad: {Math.round(opacity * 100)}%
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      value={opacity * 100}
                      onChange={(value) => handleOpacityChange(indicator.id, value)}
                      className="opacity-slider-compact"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiLayerSelector;
