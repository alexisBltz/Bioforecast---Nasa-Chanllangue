/**
 * TimeSeriesModal Component
 * Modal que muestra un gráfico de serie temporal para un punto específico
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/appStore';
import { getIndicatorById } from '../services/gibsConfig';
import '../styles/TimeSeriesModal.css';

interface TimeSeriesModalProps {
  lat: number;
  lon: number;
  onClose: () => void;
}

interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

const TimeSeriesModal: React.FC<TimeSeriesModalProps> = ({ lat, lon, onClose }) => {
  const { indicator } = useAppStore();
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const indicatorData = getIndicatorById(indicator);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Simular la obtención de datos de serie temporal
    // En una implementación real, aquí se haría una llamada a una API
    const fetchTimeSeries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generar datos simulados para los últimos 12 meses
        const mockData: TimeSeriesDataPoint[] = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          
          // Generar valores simulados basados en el indicador
          let value = 0;
          switch (indicator) {
            case 'NDVI':
            case 'EVI':
              // NDVI/EVI típicamente entre 0-1
              value = 0.3 + Math.random() * 0.5 + Math.sin(i * Math.PI / 6) * 0.15;
              break;
            case 'LST_DAY':
              // Temperatura en grados Celsius
              value = 15 + Math.random() * 10 + Math.sin(i * Math.PI / 6) * 5;
              break;
            case 'PRECIPITATION':
              // Precipitación en mm
              value = Math.random() * 50 + Math.sin(i * Math.PI / 6) * 20;
              break;
            case 'SNOW_COVER':
              // Cobertura de nieve en porcentaje
              value = Math.max(0, Math.min(100, 30 + Math.random() * 40 - Math.cos(i * Math.PI / 6) * 30));
              break;
            default:
              value = Math.random() * 100;
          }
          
          mockData.push({
            date: date.toISOString().split('T')[0],
            value: Number(value.toFixed(2))
          });
        }
        
        setData(mockData);
      } catch (err) {
        setError('Error al cargar la serie temporal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSeries();
  }, [lat, lon, indicator]);

  const getYAxisLabel = () => {
    switch (indicator) {
      case 'NDVI':
      case 'EVI':
        return t('timeseries.yaxis_index', 'Index');
      case 'LST_DAY':
        return t('timeseries.yaxis_temperature', 'Temperature (°C)');
      case 'PRECIPITATION':
        return t('timeseries.yaxis_precipitation', 'Precipitation (mm)');
      case 'SNOW_COVER':
        return t('timeseries.yaxis_snow', 'Cover (%)');
      default:
        return t('timeseries.yaxis_value', 'Value');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="timeseries-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{t('timeseries.title', 'Time Series')} - {indicatorData?.friendlyName || indicator}</h3>
            <p className="modal-coordinates">
              📍 Lat: {lat.toFixed(4)}° | Lon: {lon.toFixed(4)}°
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t('close') }>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t('loading', 'Loading data...')}</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>⚠️ {t(error) || error}</p>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                          return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: '2-digit' });
                      }}
                    />
                    <YAxis 
                      label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), indicatorData?.friendlyName || indicator]}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return date.toLocaleDateString('es-ES', { 
                          day: 'numeric',
                          month: 'long', 
                          year: 'numeric' 
                        });
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name={indicatorData?.friendlyName || indicator}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="timeseries-stats">
                <h4>{t('timeseries.stats_title', 'Statistics (Last 12 months)')}</h4>
                <div className="stats-row">
                  <div className="stat-item">
                    <span className="stat-label">{t('timeseries.avg', 'Average')}:</span>
                    <span className="stat-value">
                      {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('timeseries.min', 'Minimum')}:</span>
                    <span className="stat-value">
                      {Math.min(...data.map(d => d.value)).toFixed(2)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('timeseries.max', 'Maximum')}:</span>
                    <span className="stat-value">
                      {Math.max(...data.map(d => d.value)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-note">
                <p>
                  ℹ️ <strong>Nota:</strong> Los datos mostrados son simulados para demostración. 
                  En producción, se integrarían APIs como Google Earth Engine, MODIS, o Sentinel Hub.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesModal;
