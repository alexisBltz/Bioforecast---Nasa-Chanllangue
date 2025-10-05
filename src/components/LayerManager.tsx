/**
 * LayerManager Component
 * Maneja la visualización de capas GIBS sobre el mapa
 */
import React, { useEffect } from 'react';
import { TileLayer, WMSTileLayer, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/appStore';
import { useGIBSLayer } from '../hooks/useGIBSLayer';
import { getIndicatorById } from '../services/gibsConfig';

interface LayerManagerProps {
  onMapClick: (e: LeafletMouseEvent) => void;
  onMapRightClick: () => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({ onMapClick, onMapRightClick }) => {
  const { indicator, date, setLoading, activeLayers } = useAppStore();

  useMapEvents({
    click: onMapClick,
    contextmenu: () => onMapRightClick(), // Manejar clic derecho por separado
  });

  useEffect(() => {
    // Simular carga de capa
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [indicator, date, setLoading]);

  const layersToRender = (activeLayers && activeLayers.length > 0)
    ? activeLayers.filter(l => l.visible)
    : [{ id: indicator, opacity: 1.0, visible: true }];

  return (
    <>
      {layersToRender.map((layer) => (
        <LayerTile
          key={`${layer.id}-${date}`}
          indicatorId={layer.id}
          date={date}
          opacity={layer.opacity}
          visible={layer.visible}
        />
      ))}
    </>
  );
};

interface LayerTileProps {
  indicatorId: string;
  date: string;
  opacity: number;
  visible: boolean;
}

const LayerTile: React.FC<LayerTileProps> = ({ indicatorId, date, opacity, visible }) => {
  const layerConfig = useGIBSLayer(indicatorId, date, opacity);
  const indicatorData = getIndicatorById(indicatorId);

  if (!visible || !layerConfig || !indicatorData) return null;

  // Usar usedDate en la key si está disponible para forzar nueva petición
  const keyBase = `${indicatorId}-${layerConfig.usedDate || date}`;

  if (indicatorData.serviceType === 'WMS' && layerConfig.params) {
    // Límites específicos de Web Mercator (EPSG:3857)
    const webMercatorBounds = L.latLngBounds(
      L.latLng(-85.051128, -180), // Suroeste
      L.latLng(85.051128, 180)    // Noreste
    );
    
    return (
      <WMSTileLayer
        url={layerConfig.url}
        params={layerConfig.params}
        opacity={opacity}
        attribution={layerConfig.attribution}
        key={keyBase}
        bounds={webMercatorBounds}
        noWrap={true}
        minZoom={2}
        maxZoom={18}
      />
    );
  }

  if (indicatorData.serviceType === 'WMTS') {
    // Límites específicos de Web Mercator (EPSG:3857)
    const webMercatorBounds = L.latLngBounds(
      L.latLng(-85.051128, -180), // Suroeste
      L.latLng(85.051128, 180)    // Noreste
    );
    
    return (
      <TileLayer
        url={layerConfig.url}
        opacity={opacity}
        attribution={layerConfig.attribution}
        key={keyBase}
        bounds={webMercatorBounds}
        noWrap={true}
        minZoom={2}
        maxZoom={9}
      />
    );
  }

  return null;
};

export default LayerManager;
