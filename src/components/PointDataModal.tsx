/**
 * PointDataModal Component
 * Modal para mostrar datos detallados del punto seleccionado en el mapa
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  fetchElevation,
  fetchNASAPowerData,
  NASA_POWER_PARAMETERS,
  fetchSoilData,
  SOILGRIDS_PROPERTIES
} from '../services';
import '../styles/PointDataModal.css';

interface PointDataModalProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

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

const PointDataModal: React.FC<PointDataModalProps> = ({ lat, lon, onClose }) => {
  const { t } = useTranslation();
  const [pointData, setPointData] = useState<PointData>({ loading: true });

  const fetchPointData = useCallback(async () => {
    setPointData({ loading: true });

    try {
      // Fetch elevation
      const elevation = await fetchElevation(lat, lon);

      // Fetch recent climate data (last year average to avoid API delays)
      // NASA POWER tiene retraso de ~7-15 días, usamos datos del año anterior
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 15); // Retraso de 15 días
      const startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1); // 1 año de datos
      
      const formatDate = (date: Date) =>
        date.toISOString().split('T')[0].replace(/-/g, '');

      console.log('Fetching NASA POWER data:', {
        lat,
        lon,
        start: formatDate(startDate),
        end: formatDate(endDate)
      });

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
        const values = Object.values(climateData.properties.parameter[paramName] || {}).filter(
          (v) => typeof v === 'number' && v !== -999 && !isNaN(v)
        ) as number[];
        
        if (values.length === 0) {
          console.warn(`No valid values for parameter: ${paramName}`);
          return 0;
        }
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      };

      const climate = {
        temperature: calcAvg(NASA_POWER_PARAMETERS.TEMPERATURE),
        precipitation: calcAvg(NASA_POWER_PARAMETERS.PRECIPITATION),
        solarRadiation: calcAvg(NASA_POWER_PARAMETERS.SOLAR_RADIATION),
      };

      // Fetch soil data
      const soilData = await fetchSoilData(lat, lon, [
        SOILGRIDS_PROPERTIES.SAND,
        SOILGRIDS_PROPERTIES.SILT,
        SOILGRIDS_PROPERTIES.CLAY,
        SOILGRIDS_PROPERTIES.PH,
        SOILGRIDS_PROPERTIES.ORGANIC_CARBON,
      ]);

      console.log('Soil data received:', soilData);
      console.log('Soil data structure:', {
        hasProperties: !!soilData.properties,
        hasLayers: !!soilData.properties?.layers,
        layersIsArray: Array.isArray(soilData.properties?.layers),
        layersLength: soilData.properties?.layers?.length || 0,
        fullStructure: JSON.stringify(soilData, null, 2)
      });
      console.log('Soil layers:', soilData.properties.layers.map(l => ({
        name: l.name,
        d_factor: l.unit_measure.d_factor,
        has_depths: l.depths.length > 0,
        mean: l.depths[0]?.values?.mean
      })));

      const extractValue = (propertyName: string): number => {
        const layer = soilData.properties.layers.find((l) => l.name === propertyName);
        
        if (!layer) {
          console.warn(`Layer not found: ${propertyName}`);
          return 0;
        }
        
        if (layer.depths.length === 0) {
          console.warn(`No depths for layer: ${propertyName}`);
          return 0;
        }
        
        const surfaceDepth = layer.depths[0];
        const meanValue = surfaceDepth.values.mean;
        const dFactor = layer.unit_measure.d_factor;
        
        // Verificar valores válidos
        if (meanValue === null || meanValue === undefined || isNaN(meanValue)) {
          console.warn(`Invalid mean value for ${propertyName}: ${meanValue}`);
          return 0;
        }
        
        // Si d_factor es 0 o no existe, no dividir (algunos valores ya vienen en unidades correctas)
        if (!dFactor || dFactor === 0) {
          console.log(`${propertyName}: Using mean value directly (d_factor=${dFactor}): ${meanValue}`);
          return meanValue;
        }
        
        const value = meanValue / dFactor;
        
        console.log(`${propertyName}: mean=${meanValue}, d_factor=${dFactor}, result=${value}`);
        
        return value;
      };

      const sand = extractValue(SOILGRIDS_PROPERTIES.SAND);
      const silt = extractValue(SOILGRIDS_PROPERTIES.SILT);
      const clay = extractValue(SOILGRIDS_PROPERTIES.CLAY);
      const ph = extractValue(SOILGRIDS_PROPERTIES.PH);
      const organicCarbon = extractValue(SOILGRIDS_PROPERTIES.ORGANIC_CARBON);

      console.log('Extracted values:', { sand, silt, clay, ph, organicCarbon });

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
      console.error('Error fetching point data:', error);
      
      let errorMessage = 'Error al cargar datos';
      
      if (error instanceof Error) {
        if (error.message.includes('422')) {
          errorMessage = 'Error 422: Las coordenadas pueden estar fuera del rango válido o en el océano. NASA POWER requiere coordenadas terrestres.';
        } else if (error.message.includes('NASA POWER')) {
          errorMessage = `Error de NASA POWER: ${error.message}. Intenta con otras coordenadas o verifica tu conexión.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      setPointData({
        loading: false,
        error: errorMessage,
      });
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchPointData();
  }, [fetchPointData]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="point-data-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📊 {t('point_data.title', 'Datos del Punto Seleccionado')}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="coordinates-info">
            <strong>📍 {t('map.coordinates', 'Coordenadas')}:</strong>
            <div className="coord-values">
              <span>Lat: {lat.toFixed(4)}°</span>
              <span>Lon: {lon.toFixed(4)}°</span>
            </div>
          </div>

          {pointData.loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t('point_data.collecting_data', 'Recopilando datos del punto...')}</p>
            </div>
          )}

          {pointData.error && (
            <div className="error-state">
              <span className="error-icon">❌</span>
              <p>{pointData.error}</p>
              <button onClick={fetchPointData} className="retry-btn">
                🔄 {t('point_data.retry', 'Reintentar')}
              </button>
            </div>
          )}

          {!pointData.loading && !pointData.error && pointData.elevation && (
            <div className="data-grid">
              {/* Elevación */}
              <div className="data-card">
                <div className="card-icon">⛰️</div>
                <h4>{t('point_data.elevation', 'Elevación')}</h4>
                <div className="card-value">
                  {pointData.elevation.toFixed(0)}
                  <span className="unit">{t('point_data.elevation_unit', 'm.s.n.m.')}</span>
                </div>
              </div>

              {/* Clima */}
              {pointData.climate && (
                <>
                  <div className="data-card">
                    <div className="card-icon">🌡️</div>
                    <h4>{t('point_data.temperature', 'Temperatura')}</h4>
                    <div className="card-value">
                      {pointData.climate.temperature.toFixed(1)}
                      <span className="unit">{t('point_data.temperature_unit', '°C')}</span>
                    </div>
                    <small className="card-note">{t('point_data.annual_average', 'Promedio anual')}</small>
                  </div>

                  <div className="data-card">
                    <div className="card-icon">💧</div>
                    <h4>{t('point_data.precipitation', 'Precipitación')}</h4>
                    <div className="card-value">
                      {pointData.climate.precipitation.toFixed(2)}
                      <span className="unit">{t('point_data.precipitation_unit', 'mm/día')}</span>
                    </div>
                    <small className="card-note">{t('point_data.annual_average', 'Promedio anual')}</small>
                  </div>

                  <div className="data-card">
                    <div className="card-icon">☀️</div>
                    <h4>{t('point_data.solar_radiation', 'Radiación Solar')}</h4>
                    <div className="card-value">
                      {pointData.climate.solarRadiation.toFixed(1)}
                      <span className="unit">{t('point_data.solar_unit', 'W/m²')}</span>
                    </div>
                    <small className="card-note">{t('point_data.annual_average', 'Promedio anual')}</small>
                  </div>
                </>
              )}

              {/* Suelo */}
              {pointData.soil && (
                <>
                  <div className="data-card">
                    <div className="card-icon">🌱</div>
                    <h4>{t('point_data.soil_texture', 'Textura del Suelo')}</h4>
                    <div className="card-value text-value">
                      {pointData.soil.texture}
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="card-icon">🧪</div>
                    <h4>{t('point_data.soil_ph', 'pH del Suelo')}</h4>
                    <div className="card-value">
                      {pointData.soil.ph.toFixed(2)}
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="card-icon">🍂</div>
                    <h4>{t('point_data.organic_carbon', 'Carbono Orgánico')}</h4>
                    <div className="card-value">
                      {pointData.soil.organicCarbon.toFixed(1)}
                      <span className="unit">{t('point_data.carbon_unit', 'g/kg')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            💡 {t('point_data.climate_note', 'Los datos climáticos son promedios anuales (NASA POWER)')}
          </p>
          <button className="close-footer-btn" onClick={onClose}>
            {t('close', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointDataModal;
