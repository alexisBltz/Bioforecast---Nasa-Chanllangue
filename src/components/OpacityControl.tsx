/**
 * OpacityControl Component
 * Control de opacidad del overlay
 */
import React from 'react';
import Slider from 'rc-slider';
import { useAppStore } from '../store/appStore';
import 'rc-slider/assets/index.css';
import '../styles/OpacityControl.css';

const OpacityControl: React.FC = () => {
  const { opacity, setOpacity } = useAppStore();
  
  const handleChange = (value: number | number[]) => {
    const opacityValue = Array.isArray(value) ? value[0] : value;
    setOpacity(opacityValue / 100);
  };
  
  return (
    <div className="control-section">
      <label className="control-label">
        Opacidad ({Math.round(opacity * 100)}%)
      </label>
      <div className="slider-wrapper">
        <Slider
          min={0}
          max={100}
          value={opacity * 100}
          onChange={handleChange}
          className="opacity-slider"
        />
      </div>
    </div>
  );
};

export default OpacityControl;
