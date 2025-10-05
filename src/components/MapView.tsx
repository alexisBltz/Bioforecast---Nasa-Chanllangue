/**
 * MapView Component
 * Componente principal del mapa usando react-leaflet
 */
import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, useMapEvents } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { DEFAULT_MIN_ZOOM } from '../config/constants';
import { LandSeaService } from '../services/landSeaService';
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
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="popup-content">
      <h3>📍 {t('map.selected_point', 'Punto Seleccionado')}</h3>
      <p><strong>{t('map.coordinates', 'Coordenadas')}:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}</p>
      <p><strong>{t('indicator.label', 'Indicador')}:</strong> {indicator}</p>
      <p><strong>{t('date_controls.select_date', 'Fecha')}:</strong> {date}</p>
      <div className="popup-actions">
        <button className="popup-btn popup-data-btn" onClick={onShowDataClick}>
          📊 {t('map.point_data', 'Datos del Punto')}
        </button>
        <button className="popup-btn popup-suitability-btn" onClick={onShowSuitabilityClick}>
          🌾 {t('map.quinoa_suitability', 'Aptitud Quinua')}
        </button>
      </div>
      <small className="popup-note">{t('map.click_buttons_info', 'Click en los botones para más información')}</small>
    </div>
  );
};

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
  const { t } = useTranslation();
  const mapRef = useRef<LeafletMap | null>(null);
  const { mapCenter, mapZoom, indicator, date } = useAppStore();
  const setClickedCoords = useAppStore((state) => state.setClickedCoords);
  const [popupInfo, setPopupInfo] = useState<{ lat: number; lng: number; indicator: string; date: string } | null>(null);
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null);
  const [showPointData, setShowPointData] = useState(false);
  const [showSuitability, setShowSuitability] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Efecto para configurar límites del mapa cuando se monte
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      
      // Configurar límites estrictos para Web Mercator una sola vez
      const webMercatorBounds = L.latLngBounds(
        L.latLng(-85.051128, -180), // Suroeste
        L.latLng(85.051128, 180)    // Noreste
      );
      
      map.setMaxBounds(webMercatorBounds);
      map.options.maxBoundsViscosity = 1.0;
      map.options.worldCopyJump = true;
    }
  }, []); // Solo ejecutar una vez al montar

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
  
  const handleMapClick = async (e: LeafletMouseEvent) => {
    // Si ya hay un modal abierto, cerrarlo en lugar de abrir uno nuevo
    if (showPointData || showSuitability) {
      closeAllModals();
      return;
    }

    // Si está validando, no procesar nuevos clicks
    if (isValidating) {
      return;
    }

    const { lat, lng } = e.latlng;

    try {
      setIsValidating(true);
      
      // Validar si el punto está en tierra
      const validation = await LandSeaService.validateLandPoint(lat, lng);
      
      if (!validation.isLand) {
        // Mostrar mensaje de error específico
        const message = validation.confidence === 'high' 
          ? t('map.ocean_point_error', 'No se puede obtener información de puntos en el océano')
          : t('map.ocean_point_warning', 'Este punto parece estar en el océano. No se puede obtener información.');
        
        console.log(`${message}\n\n${t('map.validation_source', 'Verificado con')}: ${validation.source}`);
        return;
      }
      
      // Si la confianza es baja, mostrar advertencia pero permitir continuar
      if (validation.confidence === 'low') {
        const proceed = confirm(
          `${t('map.low_confidence_warning', 'No se pudo verificar completamente la ubicación.')}\n\n` +
          `${validation.message}\n\n` +
          `${t('map.continue_anyway', '¿Continuar de todas formas?')}`
        );
        if (!proceed) return;
      }
      
      // Proceder normalmente si está en tierra
      setPopupPosition([lat, lng]);
      setClickedCoords([lat, lng]);
      setPopupInfo({
        lat,
        lng,
        indicator,
        date,
      });
      
    } catch (error) {
      console.error('Error validando ubicación:', error);
      console.log(t('map.validation_error', 'Error al validar la ubicación. Intente nuevamente.'));
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleMapRightClick = () => {
    // Clic derecho siempre cierra los modales
    if (showPointData || showSuitability || popupPosition) {
      closeAllModals();
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

  // Función para cerrar todos los modales
  const closeAllModals = () => {
    setShowPointData(false);
    setShowSuitability(false);
    setPopupPosition(null);
  };

  // Efecto para manejar la tecla Escape para cerrar modales
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (showPointData || showSuitability)) {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPointData, showSuitability]);
  
  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="leaflet-map"
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
        // Prevenir repetición del mapa al cruzar la línea de fecha internacional
        worldCopyJump={true}
        // Limitar el mapa a las coordenadas mundiales válidas
        maxBounds={[
          [-90, -180], // Suroeste: latitud mínima, longitud mínima
          [90, 180]    // Noreste: latitud máxima, longitud máxima
        ]}
        // Rigidez de los límites (1.0 = completamente rígido)
        maxBoundsViscosity={1.0}
        // Zoom mínimo para evitar duplicación de tiles
        minZoom={DEFAULT_MIN_ZOOM}
      >
        {/* Basemap: OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          bounds={[[-85.051128, -180], [85.051128, 180]]}
          noWrap={true}
          minZoom={2}
          maxZoom={18}
        />
        
        {/* GIBS Overlay Layer */}
        <LayerManager onMapClick={handleMapClick} onMapRightClick={handleMapRightClick} />
        
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
