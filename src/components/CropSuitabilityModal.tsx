/**
 * CropSuitabilityModal Component
 * Modal para mostrar análisis completo de aptitud de cultivo (quinua)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Analyzing crop suitability for:', { lat, lon });
      const result = await analyzeCropSuitability(lat, lon);
      console.log('Analysis result:', result);
      setAnalysis(result);
    } catch (err) {
      console.error('Error fetching crop suitability:', err);

      let errorMessage = t('crop.error_generic', 'Error analyzing crop suitability');

      if (err instanceof Error) {
        if (err.message.includes('422')) {
          errorMessage = t('crop.error_422', 'Error 422: Coordinates may be out of valid range or over the ocean. Try terrestrial coordinates.');
        } else if (err.message.includes('NASA POWER')) {
          errorMessage = t('crop.error_nasa_power', `Climate data error: ${err.message}. Ensure coordinates are terrestrial.`);
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, t]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

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

  const translateSuitability = (suitabilityText: string): string => {
    const suitabilityMap: Record<string, string> = {
      'Altamente apto': t('crop.suitability_levels.highly_suitable', 'Altamente apto'),
      'Apto': t('crop.suitability_levels.suitable', 'Apto'),
      'Moderadamente apto': t('crop.suitability_levels.moderately_suitable', 'Moderadamente apto'),
      'Marginalmente apto': t('crop.suitability_levels.marginally_suitable', 'Marginalmente apto'),
      'No apto': t('crop.suitability_levels.not_suitable', 'No apto'),
    };
    return suitabilityMap[suitabilityText] || suitabilityText;
  };

  const translateLimitation = (limitationText: string): string => {
    const limitationMap: Record<string, string> = {
      'Temperatura fuera del rango óptimo': t('crop.limitations_common.temp_out_range', 'Temperatura fuera del rango óptimo'),
      'Precipitación insuficiente o excesiva': t('crop.limitations_common.precip_insufficient', 'Precipitación insuficiente o excesiva'),
      'Elevación no ideal': t('crop.limitations_common.elevation_not_ideal', 'Elevación no ideal'),
      'Pendiente pronunciada': t('crop.limitations_common.steep_slope', 'Pendiente pronunciada'),
      'pH del suelo no óptimo': t('crop.limitations_common.ph_not_optimal', 'pH del suelo no óptimo'),
      'Drenaje deficiente': t('crop.limitations_common.poor_drainage', 'Drenaje deficiente'),
    };
    return limitationMap[limitationText] || limitationText;
  };

  const translateStrength = (strengthText: string): string => {
    const strengthMap: Record<string, string> = {
      'Temperatura adecuada': t('crop.strengths_common.temp_adequate', 'Temperatura adecuada'),
      'Precipitación adecuada': t('crop.strengths_common.precip_adequate', 'Precipitación adecuada'),
      'Elevación óptima para quinua': t('crop.strengths_common.elevation_optimal', 'Elevación óptima para quinua'),
      'Topografía favorable': t('crop.strengths_common.favorable_topography', 'Topografía favorable'),
      'pH del suelo adecuado': t('crop.strengths_common.ph_adequate', 'pH del suelo adecuado'),
      'Buen drenaje del suelo': t('crop.strengths_common.good_drainage', 'Buen drenaje del suelo'),
    };
    return strengthMap[strengthText] || strengthText;
  };

  const translateRecommendation = (recommendationText: string): string => {
    const recommendationMap: Record<string, string> = {
      'Excelente ubicación para cultivo de quinua. Condiciones óptimas en la mayoría de variables.': t('crop.recommendations_text.excellent', 'Excelente ubicación para cultivo de quinua. Condiciones óptimas en la mayoría de variables.'),
      'Buena ubicación para quinua. Algunas variables pueden mejorarse con manejo agronómico.': t('crop.recommendations_text.good', 'Buena ubicación para quinua. Algunas variables pueden mejorarse con manejo agronómico.'),
      'Ubicación moderadamente apta. Requiere manejo cuidadoso y posibles mejoras del suelo.': t('crop.recommendations_text.moderate', 'Ubicación moderadamente apta. Requiere manejo cuidadoso y posibles mejoras del suelo.'),
      'Ubicación marginalmente apta. Alto riesgo de rendimientos bajos. Considerar variedades resistentes.': t('crop.recommendations_text.marginal', 'Ubicación marginalmente apta. Alto riesgo de rendimientos bajos. Considerar variedades resistentes.'),
      'Ubicación no recomendada para quinua. Considerar otros cultivos más adaptados.': t('crop.recommendations_text.not_recommended', 'Ubicación no recomendada para quinua. Considerar otros cultivos más adaptados.'),
    };
    return recommendationMap[recommendationText] || recommendationText;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content crop-suitability-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🌾 {t('crop.modal_title', 'Crop Suitability Analysis for Quinoa')}</h2>
            <button className="modal-close" onClick={onClose} aria-label={t('close')}>×</button>
          </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t('crop.loading', 'Analyzing agroclimatic conditions...')}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-icon">⚠️</p>
              <p className="error-message">{error}</p>
              <button onClick={fetchAnalysis} className="retry-button">
                🔄 {t('crop.retry', 'Retry')}
              </button>
            </div>
          )}

          {analysis && !loading && !error && (
            <div className="analysis-content">
              {/* Ubicación */}
              <div className="location-section">
                <p><strong>📍 {t('crop.location', 'Location')}:</strong> {lat.toFixed(4)}, {lon.toFixed(4)}</p>
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
                  {translateSuitability(analysis.overall.suitability)}
                </h3>
              </div>

              {/* Scores por Categoría */}
              <div className="category-scores">
                <div className="category-card">
                    <h4>🌡️ {t('crop.climate_title', 'Climate')} (40%)</h4>
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
                    {analysis.climate.suitabilityPercent.toFixed(0)}% - {translateSuitability(analysis.climate.suitability)}
                  </p>
                </div>

                <div className="category-card">
                  <h4>🌱 {t('crop.soil_title', 'Soil')} (35%)</h4>
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
                    {analysis.soil.suitabilityPercent.toFixed(0)}% - {translateSuitability(analysis.soil.suitability)}
                  </p>
                </div>

                <div className="category-card">
                  <h4>⛰️ {t('crop.terrain_title', 'Terrain')} (25%)</h4>
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
                    {analysis.terrain.suitabilityPercent.toFixed(0)}% - {translateSuitability(analysis.terrain.suitability)}
                  </p>
                </div>
              </div>

              {/* Detalles Climáticos */}
              <div className="details-section">
                <h4>🌡️ {t('crop.climate_data', 'Climate Data')}</h4>
                <div className="details-grid">
                  <div className="detail-item">
              <span className="detail-label">{t('crop.avg_temp', 'Average Temperature')}:</span>
                    <span className="detail-value">{analysis.climate.temperature.mean.toFixed(1)}°C</span>
                    <span className="detail-score">({analysis.climate.scores.temperature.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.min_temp', 'Min. Temp.')}:</span>
                    <span className="detail-value">{analysis.climate.temperature.min.toFixed(1)}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.max_temp', 'Max. Temp.')}:</span>
                    <span className="detail-value">{analysis.climate.temperature.max.toFixed(1)}°C</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.annual_precip', 'Annual Precipitation')}:</span>
                    <span className="detail-value">{analysis.climate.precipitation.annual.toFixed(0)} mm</span>
                    <span className="detail-score">({analysis.climate.scores.precipitation.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.solar_radiation', 'Solar Radiation')}:</span>
                    <span className="detail-value">{analysis.climate.solarRadiation.mean.toFixed(1)} MJ/m²</span>
                    <span className="detail-score">({analysis.climate.scores.solar.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.aridity_index', 'Aridity Index')}:</span>
                    <span className="detail-value">{analysis.climate.aridityIndex.toFixed(2)} ({analysis.climate.aridityClass})</span>
                    <span className="detail-score">({analysis.climate.scores.aridity.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Detalles de Suelo */}
              <div className="details-section">
                <h4>🌱 {t('crop.soil_data', 'Soil Data')}</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.texture', 'Texture')}:</span>
                    <span className="detail-value">{analysis.soil.texture}</span>
                    <span className="detail-score">({analysis.soil.scores.texture.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">pH:</span>
                    <span className="detail-value">{analysis.soil.pH.toFixed(1)}</span>
                    <span className="detail-score">({analysis.soil.scores.pH.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.organic_matter', 'Organic Matter')}:</span>
                    <span className="detail-value">{analysis.soil.organicMatter.toFixed(1)}%</span>
                    <span className="detail-score">({analysis.soil.scores.organicMatter.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Detalles de Terreno */}
              <div className="details-section">
                <h4>⛰️ {t('crop.terrain_data', 'Terrain Data')}</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.elevation', 'Elevación')}:</span>
                    <span className="detail-value">{analysis.terrain.elevation.toFixed(0)} m</span>
                    <span className="detail-score">({analysis.terrain.scores.elevation.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.slope', 'Pendiente')}:</span>
                    <span className="detail-value">{analysis.terrain.slope.toFixed(1)}%</span>
                    <span className="detail-score">({analysis.terrain.scores.slope.toFixed(0)}%)</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('crop.aspect', 'Aspecto')}:</span>
                    <span className="detail-value">{analysis.terrain.aspect}</span>
                    <span className="detail-score">({analysis.terrain.scores.aspect.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Fortalezas */}
              {analysis.overall.strengths.length > 0 && (
                <div className="recommendations-section strengths">
                  <h4>✅ {t('crop.strengths', 'Strengths')}</h4>
                  <ul>
                    {analysis.overall.strengths.map((strength, index) => (
                      <li key={index}>{translateStrength(strength)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitaciones */}
              {analysis.overall.limitations.length > 0 && (
                <div className="recommendations-section limitations">
                  <h4>⚠️ {t('crop.limitations', 'Limitations')}</h4>
                  <ul>
                    {analysis.overall.limitations.map((limitation, index) => (
                      <li key={index}>{translateLimitation(limitation)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.overall.recommendation && (
                <div className="recommendations-section recommendations">
                  <h4>💡 {t('crop.recommendation', 'Recommendation')}</h4>
                  <p>{translateRecommendation(analysis.overall.recommendation)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropSuitabilityModal;
