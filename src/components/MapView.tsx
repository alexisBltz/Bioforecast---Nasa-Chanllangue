/**
 * MapView Component
 * Componente principal del mapa usando react-leaflet
 */
import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useAppStore } from '../store/appStore';
import LayerManager from './LayerManager';
import PointDataModal from './PointDataModal';
import CropSuitabilityModal from './CropSuitabilityModal';
import 'leaflet/dist/leaflet.css';
import '../styles/MapView.css';

interface PopupContentProps {
  lat: number;
  lng: number;
  indicator: string;
  date: string;
  onShowDataClick: () => void;
  onShowSuitabilityClick: () => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ 
  lat, 
  lng, 
  indicator, 
  date, 
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
      <button className="popup-btn popup-suitability-btn" onClick={onShowSuitabilityClick}>
        🌾 Aptitud Quinua
      </button>
    </div>
    <small className="popup-note">Click en los botones para más información</small>
  </div>
);

const MapEventHandler: React.FC = () => {
  const { mapCenter, mapZoom } = useAppStore();
  const setMapView = useAppStore((state) => state.setMapView);
  
  useMapEvents({
    moveend(e) {
      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();

      // ⚠️ Solo actualizar si hay cambio real
      if (
        mapCenter[0] !== center.lat ||
        mapCenter[1] !== center.lng ||
        mapZoom !== zoom
      ) {
        setMapView([center.lat, center.lng], zoom);
      }
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
  const [showPointData, setShowPointData] = useState(false);
  const [showSuitability, setShowSuitability] = useState(false);

  // Efecto para actualizar el mapa cuando cambien las coordenadas o zoom del store
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      
      // Solo actualizar si hay una diferencia significativa para evitar loops infinitos
      const latDiff = Math.abs(currentCenter.lat - mapCenter[0]);
      const lngDiff = Math.abs(currentCenter.lng - mapCenter[1]);
      const zoomDiff = Math.abs(currentZoom - mapZoom);
      
      if (latDiff > 0.001 || lngDiff > 0.001 || zoomDiff > 0.1) {
        map.setView(mapCenter, mapZoom, { animate: true, duration: 0.5 });
      }
    }
  }, [mapCenter, mapZoom]);
  
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
              onShowDataClick={handleShowDataClick}
              onShowSuitabilityClick={handleShowSuitabilityClick}
            />
          </Popup>
        )}
      </MapContainer>

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
