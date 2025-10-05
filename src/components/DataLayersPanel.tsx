/**
 * DataLayersPanel Component
 * Panel para visualizar capas de datos adicionales (clima, suelo, elevación)
 * Muestra información puntual sobre el mapa para las variables de aptitud
 */
import React, { useState, useEffect } from 'react';
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
  const clickedCoords = useAppStore((state) => state.clickedCoords);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const [pointData, setPointData] = useState<PointData>({ loading: false });
  const [showPanel, setShowPanel] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);

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
        error: error instanceof Error ? error.message : 'Error al cargar datos',
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
        title={clickedCoords ? "Mostrar datos del punto seleccionado" : "Mostrar datos del centro del mapa"}
      >
        📊 {clickedCoords ? 'Datos del Punto Seleccionado' : 'Datos del Centro'}
      </button>

      {showPanel && (
        <div className="data-panel-content">
          <div className="panel-header">
            <h4>📍 {clickedCoords ? 'Datos del Punto Seleccionado' : 'Datos del Centro del Mapa'}</h4>
            <button className="close-btn" onClick={() => setShowPanel(false)}>
              ✕
            </button>
          </div>

          <div className="coordinates">
            <strong>Coordenadas:</strong>
            <br />
            Lat: {activeCoords[0].toFixed(4)}° | Lon: {activeCoords[1].toFixed(4)}°
            {clickedCoords && (
              <div className="coord-note">
                <small>✓ Coordenada clickeada en el mapa</small>
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
              Actualizar automáticamente
            </label>
          </div>

          {!autoUpdate && (
            <button
              className="fetch-btn"
              onClick={fetchPointData}
              disabled={pointData.loading}
            >
              {pointData.loading ? '⏳ Cargando...' : '🔄 Actualizar Datos'}
            </button>
          )}

          {pointData.loading && (
            <div className="loading-indicator">
              <div className="spinner-small"></div>
              <p>Recopilando datos...</p>
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
                <h5>⛰️ Elevación</h5>
                <div className="data-value">
                  {pointData.elevation.toFixed(0)} m.s.n.m.
                </div>
              </div>

              {/* Clima */}
              {pointData.climate && (
                <div className="data-section">
                  <h5>🌡️ Clima (últimos 30 días)</h5>
                  <div className="data-item">
                    <span>Temperatura:</span>
                    <strong>{pointData.climate.temperature.toFixed(1)}°C</strong>
                  </div>
                  <div className="data-item">
                    <span>Precipitación:</span>
                    <strong>{pointData.climate.precipitation.toFixed(2)} mm/día</strong>
                  </div>
                  <div className="data-item">
                    <span>Radiación solar:</span>
                    <strong>{pointData.climate.solarRadiation.toFixed(1)} W/m²</strong>
                  </div>
                </div>
              )}

              {/* Suelo */}
              {pointData.soil && (
                <div className="data-section">
                  <h5>🌱 Suelo</h5>
                  <div className="data-item">
                    <span>Textura:</span>
                    <strong>{pointData.soil.texture}</strong>
                  </div>
                  <div className="data-item">
                    <span>pH:</span>
                    <strong>{pointData.soil.ph.toFixed(2)}</strong>
                  </div>
                  <div className="data-item">
                    <span>Carbono orgánico:</span>
                    <strong>{pointData.soil.organicCarbon.toFixed(1)} g/kg</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="panel-footer">
            <small>
              💡 Tip: {clickedCoords 
                ? 'Haz click en otro punto del mapa para ver sus datos' 
                : 'Haz click en el mapa para seleccionar un punto específico'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLayersPanel;
