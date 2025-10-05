/**
 * Custom Hook para manejar capas GIBS
 */
import { useEffect, useState } from 'react';
import { getIndicatorById, getWMSParams, GIBS_BASE_URLS } from '../services/gibsConfig';
import { useAppStore } from '../store/appStore';

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
  usedDate?: string;
  outOfRange?: boolean;
}

/**
 * Ajusta la fecha según la resolución temporal de la capa
 */
const adjustDateForLayer = (date: string, timeResolution: string): string => {
  // Para capas anuales, usar el último año conocido (2023)
  if (timeResolution === 'annual') {
    const currentYear = new Date().getFullYear();
    const lastAvailableYear = currentYear - 2; // Datos anuales tienen 2 años de retraso
    return `${lastAvailableYear}-01-01`;
  }

  // Para capas de 8 días, alinear a inicio de periodo
  if (timeResolution === '8-day') {
    const targetDate = new Date(date);
    const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    // MODIS usa periodos de 8 días empezando en día 1 del año
    const periodNumber = Math.floor(dayOfYear / 8);
    const alignedDay = periodNumber * 8 + 1;
    
    const alignedDate = new Date(targetDate.getFullYear(), 0, alignedDay);
    return alignedDate.toISOString().split('T')[0];
  }

  // Para capas diarias, usar la fecha tal cual
  return date;
};

export const useGIBSLayer = (
  indicatorId: string,
  date: string,
  opacity: number
): GIBSLayerConfig | null => {
  const [baseConfig, setBaseConfig] = useState<Omit<GIBSLayerConfig, 'opacity'> | null>(null);
  const setError = useAppStore((s) => s.setError);

  // Efecto para calcular la configuración base (sin opacidad)
  useEffect(() => {
    const indicator = getIndicatorById(indicatorId);

    if (!indicator) {
      setBaseConfig(null);
      return;
    }

    const attribution = '© NASA GIBS / EOSDIS';

    // Ajustar fecha según resolución temporal
    const usedDate = adjustDateForLayer(date, indicator.timeResolution);
    let outOfRange = false;

    // Notificar si la fecha fue ajustada
    if (usedDate !== date) {
      outOfRange = true;
      if (indicator.timeResolution === 'annual') {
        setError(`Mostrando datos del último año disponible (${usedDate}) para ${indicator.friendlyName}`);
      } else if (indicator.timeResolution === '8-day') {
        setError(`Fecha ajustada al periodo de 8 días más cercano (${usedDate}) para ${indicator.friendlyName}`);
      }
    } else {
      setError(null);
    }

    if (indicator.serviceType === 'WMS') {
      // Configuración para WMS
      const params = getWMSParams(indicator, usedDate);

      setBaseConfig({
        url: GIBS_BASE_URLS.WMS_EPSG3857,
        params,
        attribution,
        usedDate,
        outOfRange,
      });
    } else if (indicator.serviceType === 'WMTS') {
      const dateStr = usedDate; // mantener guiones: YYYY-MM-DD
      const tileUrlTemplate = `${GIBS_BASE_URLS.WMTS_EPSG3857}/${indicator.gibsLayerName}/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;

      setBaseConfig({
        url: tileUrlTemplate,
        attribution,
        usedDate,
        outOfRange,
      });
    } else {
      setBaseConfig(null);
    }
  }, [indicatorId, date, setError]); // Removido 'opacity' de las dependencias

  // Retornar la configuración completa con la opacidad actual
  if (!baseConfig) return null;
  
  return {
    ...baseConfig,
    opacity
  };
};
