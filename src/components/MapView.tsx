/**
 * MapView Component
 * Componente principal del mapa usando react-leaflet
 */
import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useAppStore } from '../store/appStore';
import LayerManager from './LayerManager';
import TimeSeriesModal from './TimeSeriesModal';
import PointDataModal from './PointDataModal';
import CropSuitabilityModal from './CropSuitabilityModal';
import 'leaflet/dist/leaflet.css';
import '../styles/MapView.css';

interface PopupContentProps {
  lat: number;
  lng: number;
  indicator: string;
  date: string;
  onAnalyzeClick: () => void;
  onShowDataClick: () => void;
  onShowSuitabilityClick: () => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ 
  lat, 
  lng, 
  indicator, 
  date, 
  onAnalyzeClick,
  onShowDataClick,
  onShowSuitabilityClick
}) => (
  <div className="popup-content">
    <h3>📍 Punto Seleccionado</h3>
    <p><strong>Coordenadas:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
    <p><strong>Indicador:</strong> {indicator}</p>
    <p><strong>Fecha:</strong> {date}</p>
    <div className="popup-actions">
      <button className="popup-btn popup-data-btn" onClick={onShowDataClick}>
        📊 Datos del Punto
      </button>
      <button className="popup-btn popup-analyze-btn" onClick={onAnalyzeClick}>
        📈 Serie Temporal
      </button>
      <button className="popup-btn popup-suitability-btn" onClick={onShowSuitabilityClick}>
        🌾 Aptitud Quinua
      </button>
    </div>
    <small className="popup-note">Click en los botones para más información</small>
  </div>
);

const MapEventHandler: React.FC = () => {
  const setMapView = useAppStore((state) => state.setMapView);
  
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();
      setMapView([center.lat, center.lng], zoom);
    },
  });
  
  return null;
};

const MapView: React.FC = () => {
  const mapRef = useRef<LeafletMap | null>(null);
  const { mapCenter, mapZoom, indicator, date } = useAppStore();
  const setClickedCoords = useAppStore((state) => state.setClickedCoords);
  const [popupInfo, setPopupInfo] = useState<{ lat: number; lng: number; indicator: string; date: string } | null>(null);
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null);
  const [showTimeSeries, setShowTimeSeries] = useState(false);
  const [showPointData, setShowPointData] = useState(false);
  const [showSuitability, setShowSuitability] = useState(false);
  const [timeSeriesCoords, setTimeSeriesCoords] = useState<{ lat: number; lon: number } | null>(null);
  
  const handleMapClick = (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setPopupPosition([lat, lng]);
    setClickedCoords([lat, lng]); // Guardar coordenadas clickeadas en el store
    setPopupInfo({
      lat,
      lng,
      indicator,
      date,
    });
  };
  
  const handleAnalyzeClick = () => {
    if (popupInfo) {
      setTimeSeriesCoords({ lat: popupInfo.lat, lon: popupInfo.lng });
      setShowTimeSeries(true);
      setPopupPosition(null); // Cerrar el popup
    }
  };

  const handleShowDataClick = () => {
    setShowPointData(true);
    setPopupPosition(null); // Cerrar el popup
  };

  const handleShowSuitabilityClick = () => {
    setShowSuitability(true);
    setPopupPosition(null); // Cerrar el popup
  };
  
  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="leaflet-map"
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Basemap: OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* GIBS Overlay Layer */}
        <LayerManager onMapClick={handleMapClick} />
        
        {/* Map Events Handler */}
        <MapEventHandler />
        
        {/* Popup */}
        {popupPosition && popupInfo && (
          <Popup position={popupPosition} eventHandlers={{
            remove: () => setPopupPosition(null)
          }}>
            <PopupContent 
              {...popupInfo} 
              onAnalyzeClick={handleAnalyzeClick}
              onShowDataClick={handleShowDataClick}
              onShowSuitabilityClick={handleShowSuitabilityClick}
            />
          </Popup>
        )}
      </MapContainer>
      
      {/* Time Series Modal */}
      {showTimeSeries && timeSeriesCoords && (
        <TimeSeriesModal
          lat={timeSeriesCoords.lat}
          lon={timeSeriesCoords.lon}
          onClose={() => setShowTimeSeries(false)}
        />
      )}

      {/* Point Data Modal */}
      {showPointData && popupInfo && (
        <PointDataModal
          lat={popupInfo.lat}
          lon={popupInfo.lng}
          onClose={() => setShowPointData(false)}
        />
      )}

      {/* Crop Suitability Modal */}
      {showSuitability && popupInfo && (
        <CropSuitabilityModal
          lat={popupInfo.lat}
          lon={popupInfo.lng}
          onClose={() => setShowSuitability(false)}
        />
      )}
    </div>
  );
};

export default MapView;
