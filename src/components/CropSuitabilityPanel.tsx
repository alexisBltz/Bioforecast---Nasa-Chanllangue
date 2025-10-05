/**
 * CropSuitabilityPanel Component
 * Panel para analizar aptitud de cultivo en ubicaciones específicas
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeCropSuitability, type CropSuitabilityAnalysis } from '../services/cropSuitabilityService';
import '../styles/CropSuitabilityPanel.css';

interface CropSuitabilityPanelProps {
  latitude?: number;
  longitude?: number;
}

const CropSuitabilityPanel: React.FC<CropSuitabilityPanelProps> = ({ latitude, longitude }) => {
  const [analysis, setAnalysis] = useState<CropSuitabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputLat, setInputLat] = useState(latitude?.toString() || '-16.5');
  const [inputLon, setInputLon] = useState(longitude?.toString() || '-68.15');
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const handleAnalyze = async () => {
    const lat = parseFloat(inputLat);
    const lon = parseFloat(inputLon);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Coordenadas inválidas');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCropSuitability(lat, lon);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar aptitud');
      console.error('Error en análisis de aptitud:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (percent: number): string => {
    if (percent >= 80) return '#10b981'; // Verde
    if (percent >= 65) return '#22c55e'; // Verde claro
    if (percent >= 50) return '#f59e0b'; // Amarillo
    if (percent >= 35) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  };

  const getSuitabilityIcon = (suitability: string): string => {
    if (suitability.includes('Altamente')) return '🌟';
    if (suitability === 'Apto') return '✅';
    if (suitability.includes('Moderadamente')) return '⚠️';
    if (suitability.includes('Marginalmente')) return '⚡';
    return '❌';
  };

  return (
    <div className="crop-suitability-panel">
      <div className="panel-header" onClick={() => setExpanded(!expanded)}>
        <h3>🌾 {t('crop.panel_title', 'Crop Suitability Analysis for Quinoa')}</h3>
        <button className="toggle-button">{expanded ? '▼' : '▶'}</button>
      </div>

      {expanded && (
        <div className="panel-content">
          <div className="coordinates-input">
            <div className="input-group">
              <label>{t('crop.latitude', 'Latitude')}:</label>
              <input
                type="number"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                step="0.0001"
                placeholder="-16.5"
              />
            </div>
            <div className="input-group">
              <label>{t('crop.longitude', 'Longitude')}:</label>
              <input
                type="number"
                value={inputLon}
                onChange={(e) => setInputLon(e.target.value)}
                step="0.0001"
                placeholder="-68.15"
              />
            </div>
          </div>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? `⏳ ${t('crop.analyzing', 'Analyzing...')}` : `🔍 ${t('crop.analyze_location', 'Analyze Location')}`}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {loading && (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>{t('crop.collecting_data', 'Collecting data from multiple sources...')}</p>
              <small>
                • NASA POWER (clima y radiación)
                <br />
                • SoilGrids (propiedades del suelo)
                <br />
                • Open-Elevation (topografía)
              </small>
            </div>
          )}

          {analysis && (
            <div className="analysis-results">
              <div
                className="overall-suitability"
                style={{
                  backgroundColor: getSuitabilityColor(analysis.overall.suitabilityPercent),
                }}
              >
                <div className="suitability-header">
                  <span className="icon">{getSuitabilityIcon(analysis.overall.suitability)}</span>
                  <div>
                                <h4>{analysis.overall.suitability}</h4>
                                <p className="suitability-percent">
                                  {analysis.overall.suitabilityPercent.toFixed(0)}% {t('crop.suitability', 'suitability')}
                                </p>
                  </div>
                </div>
              </div>

              <div className="recommendation-box">
                <h5>💡 {t('crop.recommendation', 'Recommendation')}</h5>
                <p>{analysis.overall.recommendation}</p>
              </div>

              <div className="analysis-sections">
                {/* Sección Clima */}
                <div className="analysis-section">
                  <div className="section-header">
                    <h5>🌡️ {t('crop.climate_title', 'Climate')}</h5>
                    <span
                      className="section-badge"
                      style={{
                        backgroundColor: getSuitabilityColor(
                          analysis.climate.suitabilityPercent
                        ),
                      }}
                    >
                      {analysis.climate.suitabilityPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="section-details">
                    <div className="detail-row">
                      <span>{t('crop.avg_temp', 'Average Temperature')}:</span>
                      <strong>{analysis.climate.temperature.mean.toFixed(1)}°C</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.annual_precip', 'Annual Precipitation')}:</span>
                      <strong>{analysis.climate.precipitation.annual.toFixed(0)} mm</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.solar_radiation', 'Solar Radiation')}:</span>
                      <strong>{analysis.climate.solarRadiation.mean.toFixed(1)} W/m²</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.aridity_index', 'Aridity Index')}:</span>
                      <strong>
                        {analysis.climate.aridityIndex.toFixed(2)} ({analysis.climate.aridityClass})
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sección Suelo */}
                <div className="analysis-section">
                  <div className="section-header">
                    <h5>🌱 Suelo</h5>
                    <span
                      className="section-badge"
                      style={{
                        backgroundColor: getSuitabilityColor(
                          analysis.soil.suitabilityPercent
                        ),
                      }}
                    >
                      {analysis.soil.suitabilityPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="section-details">
                    <div className="detail-row">
                      <span>{t('crop.texture', 'Texture')}:</span>
                      <strong>{analysis.soil.texture}</strong>
                    </div>
                    <div className="detail-row">
                      <span>pH:</span>
                      <strong>{analysis.soil.pH.toFixed(1)}</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.organic_matter', 'Organic Matter')}:</span>
                      <strong>{analysis.soil.organicMatter.toFixed(1)} g/kg</strong>
                    </div>
                  </div>
                </div>

                {/* Sección Terreno */}
                <div className="analysis-section">
                  <div className="section-header">
                    <h5>⛰️ Terreno</h5>
                    <span
                      className="section-badge"
                      style={{
                        backgroundColor: getSuitabilityColor(
                          analysis.terrain.suitabilityPercent
                        ),
                      }}
                    >
                      {analysis.terrain.suitabilityPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="section-details">
                    <div className="detail-row">
                      <span>{t('crop.elevation', 'Elevation')}:</span>
                      <strong>{analysis.terrain.elevation.toFixed(0)} m.s.n.m.</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.slope', 'Slope')}:</span>
                      <strong>{analysis.terrain.slope.toFixed(1)}°</strong>
                    </div>
                    <div className="detail-row">
                      <span>{t('crop.aspect', 'Aspect')}:</span>
                      <strong>{analysis.terrain.aspect}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fortalezas y Limitaciones */}
              {(analysis.overall.strengths.length > 0 ||
                analysis.overall.limitations.length > 0) && (
                <div className="strengths-limitations">
                  {analysis.overall.strengths.length > 0 && (
                    <div className="strengths">
                      <h5>✅ Fortalezas</h5>
                      <ul>
                        {analysis.overall.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.overall.limitations.length > 0 && (
                    <div className="limitations">
                      <h5>⚠️ Limitaciones</h5>
                      <ul>
                        {analysis.overall.limitations.map((limitation, idx) => (
                          <li key={idx}>{limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="data-sources">
                <h5>📊 Fuentes de Datos</h5>
                <ul>
                  <li>
                    <strong>NASA POWER:</strong> Datos climáticos y radiación solar
                  </li>
                  <li>
                    <strong>ISRIC SoilGrids:</strong> Propiedades del suelo
                  </li>
                  <li>
                    <strong>Open-Elevation:</strong> Elevación y topografía
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CropSuitabilityPanel;
