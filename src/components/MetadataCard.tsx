/**
 * MetadataCard Component
 * Muestra metadata de la capa activa
 */
import React from 'react';
import { useAppStore } from '../store/appStore';
import { getIndicatorById } from '../services/gibsConfig';
import '../styles/MetadataCard.css';

const MetadataCard: React.FC = () => {
  const { indicator, loading, error } = useAppStore();
  const indicatorData = getIndicatorById(indicator);
  
  if (!indicatorData) {
    return null;
  }
  
  return (
    <div className="control-section metadata-card-compact">
      <label className="control-label">Info Capa</label>
      
      <div className="metadata-content-compact">
        <div className="metadata-row">
          <span className="metadata-label">Capa:</span>
          <span className="metadata-value-short">{indicatorData.gibsLayerName}</span>
        </div>
        
        <div className="metadata-grid">
          <div className="metadata-mini">
            <span className="mini-label">Temporal:</span>
            <span className="mini-value">{indicatorData.timeResolution}</span>
          </div>
          <div className="metadata-mini">
            <span className="mini-label">Espacial:</span>
            <span className="mini-value">{indicatorData.spatialResolution}</span>
          </div>
        </div>
        
        {loading && (
          <div className="loading-indicator-compact">
            <svg className="spinner" viewBox="0 0 50 50" width="14" height="14" aria-hidden="true">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4">
              </circle>
            </svg>
            <span>Cargando...</span>
          </div>
        )}
        {error && (
          <div className="metadata-error-compact">
            <strong>⚠️ {error}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataCard;
