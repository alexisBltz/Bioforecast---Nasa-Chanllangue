/**
 * Custom Hook para manejar capas GIBS
 */
import { useEffect, useState } from 'react';
import { getIndicatorById, getWMSParams, GIBS_BASE_URLS } from '../services/gibsConfig';

export interface GIBSLayerConfig {
  url: string;
  params?: {
    layers: string;
    time: string;
    format: string;
    transparent: boolean;
    version: string;
  };
  attribution: string;
  opacity: number;
}

export const useGIBSLayer = (
  indicatorId: string,
  date: string,
  opacity: number
): GIBSLayerConfig | null => {
  const [layerConfig, setLayerConfig] = useState<GIBSLayerConfig | null>(null);
  
  useEffect(() => {
    const indicator = getIndicatorById(indicatorId);
    
    if (!indicator) {
      setLayerConfig(null);
      return;
    }
    
    const attribution = '© NASA GIBS / EOSDIS';
    
    if (indicator.serviceType === 'WMS') {
      // Configuración para WMS
      const params = getWMSParams(indicator, date);
      
      setLayerConfig({
        url: GIBS_BASE_URLS.WMS_EPSG3857,
        params,
        attribution,
        opacity,
      });
    } else if (indicator.serviceType === 'WMTS') {
      // Configuración para WMTS como TileLayer
      const dateStr = date.replace(/-/g, '');
      const tileUrl = `${GIBS_BASE_URLS.WMTS_EPSG3857}/${indicator.gibsLayerName}/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;
      
      setLayerConfig({
        url: tileUrl,
        attribution,
        opacity,
      });
    } else {
      setLayerConfig(null);
    }
  }, [indicatorId, date, opacity]);
  
  return layerConfig;
};
