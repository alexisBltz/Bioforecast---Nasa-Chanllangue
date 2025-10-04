/**
 * LegendPanel Component
 * Muestra la leyenda de la capa activa
 */
import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { getIndicatorById } from '../services/gibsConfig';
import '../styles/LegendPanel.css';

const LegendPanel: React.FC = () => {
  const { indicator } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const indicatorData = getIndicatorById(indicator);
  
  if (!indicatorData) {
    return null;
  }
  
  const hasLegend = indicatorData.legendURL && indicatorData.legendURL !== '';
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div className="control-section legend-panel">
      <div className="legend-header">
        <label className="control-label">Leyenda</label>
        {hasLegend && (
          <button
            onClick={toggleExpand}
            className="legend-toggle"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {hasLegend && !imageError ? (
        <>
          {!isExpanded && (
            <div className="legend-preview">
              <img
                src={indicatorData.legendURL}
                alt={`Leyenda de ${indicatorData.friendlyName}`}
                onError={handleImageError}
                className="legend-image-small"
              />
            </div>
          )}
          
          {isExpanded && (
            <div className="legend-expanded">
              <img
                src={indicatorData.legendURL}
                alt={`Leyenda de ${indicatorData.friendlyName}`}
                onError={handleImageError}
                className="legend-image-large"
              />
              <p className="legend-description">
                {indicatorData.description}
              </p>
              <a
                href={indicatorData.docURL}
                target="_blank"
                rel="noopener noreferrer"
                className="legend-link"
              >
                Más información →
              </a>
            </div>
          )}
        </>
      ) : (
        <p className="legend-unavailable">
          {imageError ? 'Leyenda no disponible' : 'Este indicador no tiene leyenda gráfica'}
        </p>
      )}
    </div>
  );
};

export default LegendPanel;
