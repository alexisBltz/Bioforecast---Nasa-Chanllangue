/**
 * CropSuitabilityModal Component
 * Modal para mostrar análisis completo de aptitud de cultivo (quinua)
 */
import React, { useState, useEffect } from 'react';
import { analyzeCropSuitability } from '../services/cropSuitabilityService';
import type { CropSuitabilityAnalysis } from '../services/cropSuitabilityService';
import '../styles/CropSuitabilityModal.css';

interface CropSuitabilityModalProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

const CropSuitabilityModal: React.FC<CropSuitabilityModalProps> = ({ lat, lon, onClose }) => {
  const [analysis, setAnalysis] = useState<CropSuitabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [lat, lon]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Analyzing crop suitability for:', { lat, lon });
      const result = await analyzeCropSuitability(lat, lon);
      console.log('Analysis result:', result);
      setAnalysis(result);
    } catch (err) {
      console.error('Error fetching crop suitability:', err);
      
      let errorMessage = 'Error al analizar aptitud del cultivo';
      
      if (err instanceof Error) {
        if (err.message.includes('422')) {
          errorMessage = 'Error 422: Las coordenadas pueden estar fuera del rango válido o en el océano. Intenta con coordenadas terrestres.';
        } else if (err.message.includes('NASA POWER')) {
          errorMessage = `Error de datos climáticos: ${err.message}. Verifica que las coordenadas sean terrestres.`;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (percent: number): string => {
    if (percent >= 80) return '#22c55e'; // verde
    if (percent >= 60) return '#84cc16'; // verde lima
    if (percent >= 40) return '#eab308'; // amarillo
    if (percent >= 20) return '#f97316'; // naranja
    return '#ef4444'; // rojo
  };

  const getSuitabilityIcon = (percent: number): string => {
    if (percent >= 80) return '🌟';
    if (percent >= 60) return '✅';
    if (percent >= 40) return '⚠️';
    if (percent >= 20) return '❌';
    return '🚫';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content crop-suitability-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌾 Análisis de Aptitud para Quinua</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analizando condiciones agroclimáticas...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-icon">⚠️</p>
              <p className="error-message">{error}</p>
              <button onClick={fetchAnalysis} className="retry-button">
                🔄 Reintentar
              </button>
            </div>
          )}

          {analysis && !loading && !error && (
            <div className="analysis-content">
              {/* Ubicación */}
              <div className="location-section">
                <p><strong>📍 Ubicación:</strong> {lat.toFixed(4)}, {lon.toFixed(4)}</p>
              </div>

              {/* Score General */}
              <div className="overall-score-section">
                <div 
                  className="score-circle"
                  style={{ borderColor: getSuitabilityColor(analysis.overall.suitabilityPercent) }}
                >
                  <div className="score-value">
                    {analysis.overall.suitabilityPercent.toFixed(0)}%
                  </div>
                  <div className="score-icon">
                    {getSuitabilityIcon(analysis.overall.suitabilityPercent)}
                  </div>
                </div>
                <h3 
                  className="suitability-label"
                  style={{ color: getSuitabilityColor(analysis.overall.suitabilityPercent) }}
                >
                  {analysis.overall.suitability}
                </h3>
              </div>

              {/* Scores por Categoría */}
              <div className="category-scores">
                <div className="category-card">
                  <h4>🌡️ Clima (40%)</h4>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${analysis.climate.suitabilityPercent}%`,
                        backgroundColor: getSuitabilityColor(analysis.climate.suitabilityPercent)
                      }}
                    ></div>
                  </div>
                  <p className="category-percent">
                    {analysis.climate.suitabilityPercent.toFixed(0)}% - {analysis.climate.suitability}
                  </p>
                </div>

                <div className="category-card">
                  <h4>🌱 Suelo (35%)</h4>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${analysis.soil.suitabilityPercent}%`,
                        backgroundColor: getSuitabilityColor(analysis.soil.suitabilityPercent)
                      }}
                    ></div>
                  </div>
                  <p className="category-percent">
                    {analysis.soil.suitabilityPercent.toFixed(0)}% - {analysis.soil.suitability}
                  </p>
                </div>

                <div className="category-card">
                  <h4>⛰️ Terreno (25%)</h4>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${analysis.terrain.suitabilityPercent}%`,
                        backgroundColor: getSuitabilityColor(analysis.terrain.suitabilityPercent)
                      }}
                    ></div>
                  </div>
                  <p className="category-percent">
                    {analysis.terrain.suitabilityPercent.toFixed(0)}% - {analysis.terrain.suitability}
                  </p>
                </div>
              </div>

              {/* Detalles Climáticos */}
              <div className="details-section">
                <h4>🌡️ Datos Climáticos</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Temperatura Media:</span>
                    <span className="detail-value">{analysis.climate.temperature.mean.toFixed(1)}°C</span>
                    <span className="detail-score">({analysis.climate.scores.temperature.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Temp. Mínima:</span>
                    <span className="detail-value">{analysis.climate.temperature.min.toFixed(1)}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Temp. Máxima:</span>
                    <span className="detail-value">{analysis.climate.temperature.max.toFixed(1)}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Precipitación Anual:</span>
                    <span className="detail-value">{analysis.climate.precipitation.annual.toFixed(0)} mm</span>
                    <span className="detail-score">({analysis.climate.scores.precipitation.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Radiación Solar:</span>
                    <span className="detail-value">{analysis.climate.solarRadiation.mean.toFixed(1)} MJ/m²</span>
                    <span className="detail-score">({analysis.climate.scores.solar.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Índice de Aridez:</span>
                    <span className="detail-value">{analysis.climate.aridityIndex.toFixed(2)} ({analysis.climate.aridityClass})</span>
                    <span className="detail-score">({analysis.climate.scores.aridity.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Detalles de Suelo */}
              <div className="details-section">
                <h4>🌱 Datos de Suelo</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Textura:</span>
                    <span className="detail-value">{analysis.soil.texture}</span>
                    <span className="detail-score">({analysis.soil.scores.texture.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">pH:</span>
                    <span className="detail-value">{analysis.soil.pH.toFixed(1)}</span>
                    <span className="detail-score">({analysis.soil.scores.pH.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Materia Orgánica:</span>
                    <span className="detail-value">{analysis.soil.organicMatter.toFixed(1)}%</span>
                    <span className="detail-score">({analysis.soil.scores.organicMatter.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Detalles de Terreno */}
              <div className="details-section">
                <h4>⛰️ Datos de Terreno</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Elevación:</span>
                    <span className="detail-value">{analysis.terrain.elevation.toFixed(0)} m</span>
                    <span className="detail-score">({analysis.terrain.scores.elevation.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pendiente:</span>
                    <span className="detail-value">{analysis.terrain.slope.toFixed(1)}%</span>
                    <span className="detail-score">({analysis.terrain.scores.slope.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Aspecto:</span>
                    <span className="detail-value">{analysis.terrain.aspect}</span>
                    <span className="detail-score">({analysis.terrain.scores.aspect.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Fortalezas */}
              {analysis.overall.strengths.length > 0 && (
                <div className="recommendations-section strengths">
                  <h4>✅ Fortalezas</h4>
                  <ul>
                    {analysis.overall.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitaciones */}
              {analysis.overall.limitations.length > 0 && (
                <div className="recommendations-section limitations">
                  <h4>⚠️ Limitaciones</h4>
                  <ul>
                    {analysis.overall.limitations.map((limitation, index) => (
                      <li key={index}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.overall.recommendation && (
                <div className="recommendations-section recommendations">
                  <h4>💡 Recomendación</h4>
                  <p>{analysis.overall.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropSuitabilityModal;
