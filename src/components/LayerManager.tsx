/**
 * LayerManager Component
 * Maneja la visualización de capas GIBS sobre el mapa
 */
import React, { useEffect } from 'react';
import { TileLayer, WMSTileLayer, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { useAppStore } from '../store/appStore';
import { useGIBSLayer } from '../hooks/useGIBSLayer';
import { getIndicatorById } from '../services/gibsConfig';

interface LayerManagerProps {
  onMapClick: (e: LeafletMouseEvent) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({ onMapClick }) => {
  const { indicator, date, opacity, setLoading } = useAppStore();
  const layerConfig = useGIBSLayer(indicator, date, opacity);
  
  useMapEvents({
    click: onMapClick,
  });
  
  useEffect(() => {
    // Simular carga de capa
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [indicator, date, setLoading]);
  
  if (!layerConfig) {
    return null;
  }
  
  const indicatorData = getIndicatorById(indicator);
  
  if (!indicatorData) {
    return null;
  }
  
  // Renderizar WMS Layer
  if (indicatorData.serviceType === 'WMS' && layerConfig.params) {
    return (
      <WMSTileLayer
        url={layerConfig.url}
        params={layerConfig.params}
        opacity={layerConfig.opacity}
        attribution={layerConfig.attribution}
        key={`${indicator}-${date}`}
      />
    );
  }
  
  // Renderizar WMTS/XYZ TileLayer
  if (indicatorData.serviceType === 'WMTS') {
    return (
      <TileLayer
        url={layerConfig.url}
        opacity={layerConfig.opacity}
        attribution={layerConfig.attribution}
        key={`${indicator}-${date}`}
        maxZoom={9}
      />
    );
  }
  
  return null;
};

export default LayerManager;
