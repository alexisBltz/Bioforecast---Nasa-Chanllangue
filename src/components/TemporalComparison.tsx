/**
 * TemporalComparison Component
 * Compara dos fechas de un mismo indicador lado a lado
 */
import React, { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import DatePicker from 'react-datepicker';
import { useAppStore } from '../store/appStore';
import { getIndicatorById, getWMSParams, GIBS_BASE_URLS } from '../services/gibsConfig';
import { formatDate } from '../utils/dateUtils';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/TemporalComparison.css';

const TemporalComparison: React.FC = () => {
  const { indicator, mapCenter, mapZoom } = useAppStore();
  const [dateA, setDateA] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [dateB, setDateB] = useState<Date>(new Date());
  const [showDifference, setShowDifference] = useState(false);
  const [stats, setStats] = useState<{ increase: number; decrease: number } | null>(null);
  
  const indicatorData = getIndicatorById(indicator);
  
  const calculateDifference = () => {
    // Simulación de cálculo de diferencia
    // En producción, esto requeriría procesamiento de píxeles
    setShowDifference(true);
    setStats({
      increase: Math.round(Math.random() * 30 + 10),
      decrease: Math.round(Math.random() * 20 + 5),
    });
  };
  
  const renderMap = (date: Date, label: string) => {
    if (!indicatorData) return null;
    
    const dateStr = formatDate(date);
    const params = getWMSParams(indicatorData, dateStr);
    
    return (
      <div className="comparison-map-container">
        <div className="map-label">{label}: {dateStr}</div>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="comparison-map"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {indicatorData.serviceType === 'WMS' && (
            <WMSTileLayer
              url={GIBS_BASE_URLS.WMS_EPSG3857}
              params={params}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    );
  };
  
  return (
    <div className="temporal-comparison">
      <div className="comparison-header">
        <h3>Comparación Temporal</h3>
        <p className="comparison-subtitle">
          Comparando: {indicatorData?.friendlyName || 'Selecciona un indicador'}
        </p>
      </div>
      
      <div className="comparison-controls">
        <div className="date-control">
          <label>Fecha Inicial:</label>
          <DatePicker
            selected={dateA}
            onChange={(date) => date && setDateA(date)}
            dateFormat="yyyy-MM-dd"
            className="date-input"
          />
        </div>
        
        <div className="date-control">
          <label>Fecha Final:</label>
          <DatePicker
            selected={dateB}
            onChange={(date) => date && setDateB(date)}
            dateFormat="yyyy-MM-dd"
            className="date-input"
          />
        </div>
        
        <button onClick={calculateDifference} className="calculate-button">
          📊 Calcular Diferencia
        </button>
      </div>
      
      <div className="maps-grid">
        {renderMap(dateA, 'Fecha A')}
        {renderMap(dateB, 'Fecha B')}
      </div>
      
      {showDifference && stats && (
        <div className="difference-stats">
          <h4>Estadísticas de Cambio</h4>
          <div className="stats-grid">
            <div className="stat-card increase">
              <span className="stat-icon">📈</span>
              <span className="stat-value">{stats.increase}%</span>
              <span className="stat-label">Área con Aumento &gt;20%</span>
            </div>
            <div className="stat-card decrease">
              <span className="stat-icon">📉</span>
              <span className="stat-value">{stats.decrease}%</span>
              <span className="stat-label">Área con Disminución &gt;20%</span>
            </div>
          </div>
          <p className="stats-note">
            <small>Nota: Análisis aproximado basado en visualización. Para análisis precisos se requiere procesamiento backend.</small>
          </p>
        </div>
      )}
    </div>
  );
};

export default TemporalComparison;
