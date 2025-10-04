/**
 * LegendPanel Component
 * Muestra la leyenda de la(s) capa(s) activa(s)
 */
import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { getIndicatorById } from '../services/gibsConfig';
import '../styles/LegendPanel.css';

const LegendPanel: React.FC = () => {
  const { indicator, activeLayers } = useAppStore();
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  // Determinar qué capas mostrar (activeLayers si existe, sino indicador actual)
  const layersToShow = activeLayers && activeLayers.length > 0 
    ? activeLayers.filter(l => l.visible).map(l => l.id)
    : [indicator];
  
  const toggleExpand = (layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };
  
  const handleImageError = (layerId: string) => {
    const newErrors = new Set(imageErrors);
    newErrors.add(layerId);
    setImageErrors(newErrors);
  };
  
  return (
    <div className="control-section legend-panel">
      <div className="legend-header">
        <label className="control-label">
          {layersToShow.length > 1 ? 'Leyendas' : 'Leyenda'}
        </label>
      </div>
      
      <div className="legends-container">
        {layersToShow.map((layerId) => {
          const indicatorData = getIndicatorById(layerId);
          
          if (!indicatorData) {
            return null;
          }
          
          const hasLegend = indicatorData.legendURL && indicatorData.legendURL !== '';
          const isExpanded = expandedLayers.has(layerId);
          const hasError = imageErrors.has(layerId);
          
          return (
            <div key={layerId} className="legend-item">
              <div className="legend-item-header">
                <span className="legend-item-title">{indicatorData.friendlyName}</span>
                {hasLegend && (
                  <button
                    onClick={() => toggleExpand(layerId)}
                    className="legend-toggle"
                    title={isExpanded ? 'Contraer' : 'Expandir'}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
              </div>
              
              {hasLegend && !hasError ? (
                <>
                  {!isExpanded && (
                    <div className="legend-preview">
                      <img
                        src={indicatorData.legendURL}
                        alt={`Leyenda de ${indicatorData.friendlyName}`}
                        onError={() => handleImageError(layerId)}
                        className="legend-image-small"
                      />
                    </div>
                  )}
                  
                  {isExpanded && (
                    <div className="legend-expanded">
                      <img
                        src={indicatorData.legendURL}
                        alt={`Leyenda de ${indicatorData.friendlyName}`}
                        onError={() => handleImageError(layerId)}
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
                  {hasError ? 'Leyenda no disponible' : 'Sin leyenda gráfica'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LegendPanel;
