/**
 * MapView Component
 * Componente principal del mapa usando react-leaflet
 */
import React, { useRef } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useAppStore } from '../store/appStore';
import LayerManager from './LayerManager';
import 'leaflet/dist/leaflet.css';
import '../styles/MapView.css';

interface PopupContentProps {
  lat: number;
  lng: number;
  indicator: string;
  date: string;
}

const PopupContent: React.FC<PopupContentProps> = ({ lat, lng, indicator, date }) => (
  <div className="popup-content">
    <h3>Información del punto</h3>
    <p><strong>Coordenadas:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
    <p><strong>Indicador:</strong> {indicator}</p>
    <p><strong>Fecha:</strong> {date}</p>
    <small>Visualización — no valores numéricos</small>
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
  const [popupInfo, setPopupInfo] = React.useState<PopupContentProps | null>(null);
  const [popupPosition, setPopupPosition] = React.useState<[number, number] | null>(null);
  
  const handleMapClick = (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setPopupPosition([lat, lng]);
    setPopupInfo({
      lat,
      lng,
      indicator,
      date,
    });
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
            <PopupContent {...popupInfo} />
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
