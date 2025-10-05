/**
 * DataLayersPanel Component
 * Panel para visualizar capas de datos adicionales (clima, suelo, elevación)
 * Muestra información puntual sobre el mapa para las variables de aptitud
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { 
  fetchElevation,
  fetchNASAPowerData,
  NASA_POWER_PARAMETERS,
  fetchSoilData,
  SOILGRIDS_PROPERTIES
} from '../services';
import '../styles/DataLayersPanel.css';

interface PointData {
  elevation?: number;
  climate?: {
    temperature: number;
    precipitation: number;
    solarRadiation: number;
  };
  soil?: {
    texture: string;
    ph: number;
    organicCarbon: number;
  };
  loading: boolean;
  error?: string;
}

const DataLayersPanel: React.FC = () => {
  const { t } = useTranslation();
  const clickedCoords = useAppStore((state) => state.clickedCoords);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const [pointData, setPointData] = useState<PointData>({ loading: false });
  const [showPanel, setShowPanel] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const translateSoilTexture = (textureKey: string): string => {
    const textureMap: Record<string, string> = {
      'Arenoso': 'sandy',
      'Arcilloso': 'clayey', 
      'Limoso': 'silty',
      'Franco Arenoso': 'sandy_loam',
      'Franco Limoso': 'silty_loam',
      'Franco': 'loam'
    };
    
    const translationKey = textureMap[textureKey];
    if (translationKey) {
      return t(`data_layers.soil_textures.${translationKey}`);
    }
    return textureKey;
  };

  // Usar coordenadas clickeadas si existen, sino usar el centro del mapa
  const activeCoords = clickedCoords || mapCenter;

  const fetchPointData = async () => {
    setPointData({ loading: true });
    const [lat, lon] = activeCoords;

    try {
      // Fetch elevation
      const elevation = await fetchElevation(lat, lon);

      // Fetch recent climate data (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const formatDate = (date: Date) =>
        date.toISOString().split('T')[0].replace(/-/g, '');

      const climateData = await fetchNASAPowerData({
        latitude: lat,
        longitude: lon,
        start: formatDate(startDate),
        end: formatDate(endDate),
        parameters: [
          NASA_POWER_PARAMETERS.TEMPERATURE,
          NASA_POWER_PARAMETERS.PRECIPITATION,
          NASA_POWER_PARAMETERS.SOLAR_RADIATION,
        ],
      });

      // Calculate averages
      const calcAvg = (paramName: string) => {
        const values = Object.values(climateData.properties.parameter[paramName]).filter(
          (v) => v !== -999
        );
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      };

      const climate = {
        temperature: calcAvg(NASA_POWER_PARAMETERS.TEMPERATURE),
        precipitation: calcAvg(NASA_POWER_PARAMETERS.PRECIPITATION),
        solarRadiation: calcAvg(NASA_POWER_PARAMETERS.SOLAR_RADIATION),
      };

      // Fetch soil data (simplified)
      const soilData = await fetchSoilData(lat, lon, [
        SOILGRIDS_PROPERTIES.SAND,
        SOILGRIDS_PROPERTIES.SILT,
        SOILGRIDS_PROPERTIES.CLAY,
        SOILGRIDS_PROPERTIES.PH,
        SOILGRIDS_PROPERTIES.ORGANIC_CARBON,
      ]);

      const extractValue = (propertyName: string): number => {
        const layer = soilData.properties.layers.find((l) => l.name === propertyName);
        if (!layer || layer.depths.length === 0) return 0;
        const surfaceDepth = layer.depths[0];
        return surfaceDepth.values.mean / layer.unit_measure.d_factor;
      };

      const sand = extractValue(SOILGRIDS_PROPERTIES.SAND);
      const silt = extractValue(SOILGRIDS_PROPERTIES.SILT);
      const clay = extractValue(SOILGRIDS_PROPERTIES.CLAY);
      const ph = extractValue(SOILGRIDS_PROPERTIES.PH);
      const organicCarbon = extractValue(SOILGRIDS_PROPERTIES.ORGANIC_CARBON);

      const getSoilTexture = (s: number, si: number, c: number): string => {
        if (s >= 85 && c <= 10) return 'Arenoso';
        if (c >= 40) return 'Arcilloso';
        if (si >= 80 && c < 12) return 'Limoso';
        if (s >= 45 && s <= 80 && c <= 20) return 'Franco Arenoso';
        if (si >= 50 && c >= 12 && c < 27) return 'Franco Limoso';
        return 'Franco';
      };

      const soil = {
        texture: getSoilTexture(sand, silt, clay),
        ph,
        organicCarbon,
      };

      setPointData({
        elevation,
        climate,
        soil,
        loading: false,
      });
    } catch (error) {
      setPointData({
        loading: false,
        error: error instanceof Error ? error.message : t('errors.data_load'),
      });
    }
  };

  useEffect(() => {
    if (autoUpdate && showPanel) {
      fetchPointData();
    }
  }, [activeCoords, autoUpdate, showPanel]);

  return (
    <div className="data-layers-panel">
      <button
        className="toggle-panel-btn"
        onClick={() => setShowPanel(!showPanel)}
        title={clickedCoords ? t('data_layers.toggle_panel') : t('data_layers.toggle_center')}
      >
        📊 {clickedCoords ? t('data_layers.selected_point_data') : t('data_layers.center_data')}
      </button>

      {showPanel && (
        <div className="data-panel-content">
          <div className="panel-header">
            <h4>📍 {clickedCoords ? t('data_layers.selected_point_data') : t('data_layers.center_data')}</h4>
            <button className="close-btn" onClick={() => setShowPanel(false)}>
              ✕
            </button>
          </div>

          <div className="coordinates">
            <strong>{t('data_layers.coordinates')}:</strong>
            <br />
            Lat: {activeCoords[0].toFixed(4)}° | Lon: {activeCoords[1].toFixed(4)}°
            {clickedCoords && (
              <div className="coord-note">
                <small>✓ {t('data_layers.clicked_coordinate')}</small>
              </div>
            )}
          </div>

          <div className="auto-update">
            <label>
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
              />
              {t('data_layers.auto_update')}
            </label>
          </div>

          {!autoUpdate && (
            <button
              className="fetch-btn"
              onClick={fetchPointData}
              disabled={pointData.loading}
            >
              {pointData.loading ? `⏳ ${t('data_layers.loading_data')}` : `🔄 ${t('data_layers.update_data')}`}
            </button>
          )}

          {pointData.loading && (
            <div className="loading-indicator">
              <div className="spinner-small"></div>
              <p>{t('data_layers.collecting_data')}</p>
            </div>
          )}

          {pointData.error && (
            <div className="error-box">
              ❌ {pointData.error}
            </div>
          )}

          {!pointData.loading && !pointData.error && pointData.elevation && (
            <div className="data-sections">
              {/* Elevación */}
              <div className="data-section">
                <h5>⛰️ {t('data_layers.elevation_section')}</h5>
                <div className="data-value">
                  {pointData.elevation.toFixed(0)} {t('data_layers.elevation_unit')}
                </div>
              </div>

              {/* Clima */}
              {pointData.climate && (
                <div className="data-section">
                  <h5>🌡️ {t('data_layers.climate_section')}</h5>
                  <div className="data-item">
                    <span>{t('data_layers.temperature_label')}:</span>
                    <strong>{pointData.climate.temperature.toFixed(1)}{t('data_layers.temperature_unit')}</strong>
                  </div>
                  <div className="data-item">
                    <span>{t('data_layers.precipitation_label')}:</span>
                    <strong>{pointData.climate.precipitation.toFixed(2)} {t('data_layers.precipitation_unit')}</strong>
                  </div>
                  <div className="data-item">
                    <span>{t('data_layers.solar_radiation_label')}:</span>
                    <strong>{pointData.climate.solarRadiation.toFixed(1)} {t('data_layers.solar_unit')}</strong>
                  </div>
                </div>
              )}

              {/* Suelo */}
              {pointData.soil && (
                <div className="data-section">
                  <h5>🌱 {t('data_layers.soil_section')}</h5>
                  <div className="data-item">
                    <span>{t('data_layers.texture_label')}:</span>
                    <strong>{translateSoilTexture(pointData.soil.texture)}</strong>
                  </div>
                  <div className="data-item">
                    <span>{t('data_layers.ph_label')}:</span>
                    <strong>{pointData.soil.ph.toFixed(2)}</strong>
                  </div>
                  <div className="data-item">
                    <span>{t('data_layers.organic_carbon_label')}:</span>
                    <strong>{pointData.soil.organicCarbon.toFixed(1)} {t('data_layers.carbon_unit')}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="panel-footer">
            <small>
              💡 Tip: {clickedCoords 
                ? t('data_layers.tip_selected')
                : t('data_layers.tip_center')}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLayersPanel;
