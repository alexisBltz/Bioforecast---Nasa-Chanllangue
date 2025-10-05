/**
 * OpacityControl Component
 * Control de opacidad del overlay
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'rc-slider';
import { useAppStore } from '../store/appStore';
import 'rc-slider/assets/index.css';
import '../styles/OpacityControl.css';

const OpacityControl: React.FC = () => {
  const { opacity, setOpacity, indicator, activeLayers, setLayerOpacity } = useAppStore();
  
  // Obtener la opacidad de la capa actual del indicador activo
  const getCurrentOpacity = () => {
    const currentLayer = activeLayers.find(layer => layer.id === indicator);
    return currentLayer ? currentLayer.opacity : opacity;
  };
  
  const handleChange = (value: number | number[]) => {
    const opacityValue = Array.isArray(value) ? value[0] : value;
    const normalizedOpacity = opacityValue / 100;
    
    // Actualizar tanto la opacidad global como la de la capa específica
    setOpacity(normalizedOpacity);
    
    // Si existe la capa del indicador actual en activeLayers, actualizar su opacidad
    const currentLayer = activeLayers.find(layer => layer.id === indicator);
    if (currentLayer) {
      setLayerOpacity(indicator, normalizedOpacity);
    }
  };
  
  const currentOpacity = getCurrentOpacity();
  const { t } = useTranslation();
  
  return (
    <div className="control-section opacity-control-compact">
      <div className="opacity-header">
        <label className="control-label">Opacidad</label>
        <span className="opacity-value">{Math.round(currentOpacity * 100)}%</span>
      </div>
      <div className="slider-wrapper">
        <Slider
          min={0}
          max={100}
          value={Math.round(currentOpacity * 100)}
          onChange={handleChange}
          className="opacity-slider"
          step={1}
          trackStyle={{ backgroundColor: '#1976d2' }}
          handleStyle={{
            borderColor: '#1976d2',
            backgroundColor: '#1976d2'
          }}
        />
      </div>
    </div>
  );
};

export default OpacityControl;
