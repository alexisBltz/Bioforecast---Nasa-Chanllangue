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
    <div className="control-section metadata-card">
      <label className="control-label">Información de la Capa</label>
      
      <div className="metadata-content">
        <div className="metadata-item">
          <span className="metadata-key">Capa GIBS:</span>
          <span className="metadata-value">{indicatorData.gibsLayerName}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-key">Resolución Temporal:</span>
          <span className="metadata-value">{indicatorData.timeResolution}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-key">Resolución Espacial:</span>
          <span className="metadata-value">{indicatorData.spatialResolution}</span>
        </div>
        
        <div className="metadata-item">
          <span className="metadata-key">Tipo de Servicio:</span>
          <span className="metadata-value">{indicatorData.serviceType}</span>
        </div>
        
        {loading && (
          <div className="loading-indicator">
            <svg className="spinner" viewBox="0 0 50 50" width="18" height="18" aria-hidden="true">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4">
              </circle>
            </svg>
            Cargando capa...
          </div>
        )}
        {error && (
          <div className="metadata-error">
            <strong>⚠️ {error}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataCard;
