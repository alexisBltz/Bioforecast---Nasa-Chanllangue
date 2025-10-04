/**
 * BloomAnalysis Component
 * Permite dibujar polígonos y analizar estadísticas de NDVI para detección de floración
 */
import React, { useState, useRef } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import type { LeafletEvent } from 'leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../styles/BloomAnalysis.css';

interface BloomStats {
  avgNDVI: number;
  minNDVI: number;
  maxNDVI: number;
  area: number;
  bloomLikelihood: 'Bajo' | 'Medio' | 'Alto';
}

const BloomAnalysis: React.FC = () => {
  const [polygonDrawn, setPolygonDrawn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<BloomStats | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const handleCreated = (e: LeafletEvent & { layer: L.Layer }) => {
    const layer = e.layer;
    setPolygonDrawn(true);
    
    // Analizar el polígono
    analyzePolygon(layer);
  };

  const handleDeleted = () => {
    setPolygonDrawn(false);
    setStats(null);
  };

  const analyzePolygon = async (layer: L.Layer) => {
    setAnalyzing(true);
    
    try {
      // Simular análisis (en producción, esto haría muestreo de píxeles reales)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calcular área del polígono (aproximación simple)
      let area = 0;
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        // Aproximación simple del área usando fórmula del trapecio
        // En producción, usar librería más precisa como turf.js
        area = Math.abs(latlngs.reduce((sum, curr, i) => {
          const next = latlngs[(i + 1) % latlngs.length];
          return sum + (curr.lng * next.lat - next.lng * curr.lat);
        }, 0)) * 6000; // Factor de conversión aproximado a hectáreas
      }
      
      // Generar estadísticas simuladas de NDVI
      const avgNDVI = 0.4 + Math.random() * 0.4; // NDVI entre 0.4 y 0.8
      const minNDVI = avgNDVI - 0.2 - Math.random() * 0.1;
      const maxNDVI = avgNDVI + 0.1 + Math.random() * 0.1;
      
      // Determinar probabilidad de floración basada en NDVI promedio
      let bloomLikelihood: 'Bajo' | 'Medio' | 'Alto';
      if (avgNDVI < 0.5) {
        bloomLikelihood = 'Bajo';
      } else if (avgNDVI < 0.65) {
        bloomLikelihood = 'Medio';
      } else {
        bloomLikelihood = 'Alto';
      }
      
      setStats({
        avgNDVI: Number(avgNDVI.toFixed(3)),
        minNDVI: Number(minNDVI.toFixed(3)),
        maxNDVI: Number(maxNDVI.toFixed(3)),
        area: Number(area.toFixed(2)),
        bloomLikelihood,
      });
    } catch (error) {
      console.error('Error al analizar polígono:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'Alto':
        return '#10b981';
      case 'Medio':
        return '#f59e0b';
      case 'Bajo':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onDeleted={handleDeleted}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e74c3c',
                message: '<strong>Error:</strong> ¡Las líneas no pueden cruzarse!',
              },
              shapeOptions: {
                color: '#667eea',
                weight: 3,
              },
            },
          }}
        />
      </FeatureGroup>

      {polygonDrawn && (
        <div className="bloom-analysis-panel">
          <div className="analysis-header">
            <h4>🌸 Análisis de Floración</h4>
          </div>

          {analyzing && (
            <div className="analysis-loading">
              <div className="analysis-spinner"></div>
              <p>Analizando región...</p>
            </div>
          )}

          {!analyzing && stats && (
            <div className="analysis-results">
              <div className="stat-row">
                <span className="stat-label">Área:</span>
                <span className="stat-value">{stats.area} ha</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">NDVI Promedio:</span>
                <span className="stat-value">{stats.avgNDVI}</span>
              </div>
              
              <div className="stat-row">
                <span className="stat-label">NDVI Mín/Máx:</span>
                <span className="stat-value">{stats.minNDVI} / {stats.maxNDVI}</span>
              </div>
              
              <div className="likelihood-badge" style={{ backgroundColor: getLikelihoodColor(stats.bloomLikelihood) }}>
                Probabilidad de Floración: <strong>{stats.bloomLikelihood}</strong>
              </div>

              <div className="analysis-note">
                <small>
                  💡 <strong>Interpretación:</strong> NDVI &gt; 0.6 indica vegetación vigorosa 
                  con alta probabilidad de floración. Valores entre 0.5-0.6 indican floración moderada.
                </small>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BloomAnalysis;
