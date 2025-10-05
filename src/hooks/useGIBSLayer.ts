/**
 * Custom Hook para manejar capas GIBS
 */
import { useEffect, useState } from 'react';
import { getIndicatorById, getWMSParams, GIBS_BASE_URLS } from '../services/gibsConfig';
import { generateRecentDates } from '../utils/dateUtils';
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

export const useGIBSLayer = (
  indicatorId: string,
  date: string,
  opacity: number
): GIBSLayerConfig | null => {
  const [layerConfig, setLayerConfig] = useState<GIBSLayerConfig | null>(null);
  const setError = useAppStore((s) => s.setError);

  useEffect(() => {
    const indicator = getIndicatorById(indicatorId);

    if (!indicator) {
      setLayerConfig(null);
      return;
    }

    const attribution = '© NASA GIBS / EOSDIS';

    // Determinar la fecha válida según la resolución temporal del indicador
    let usedDate = date;
    let outOfRange = false;

    if (indicator.timeResolution === 'static') {
      usedDate = indicator.startDate || date;
      if (date !== usedDate) outOfRange = true;
    } else if (indicator.timeResolution === '8-day') {
      // Generar rango de fechas 8-day y escoger la más cercana
      const candidates = generateRecentDates(90); // últimos ~90 entradas de 8-day (ajustado en store)
      // Buscar coincidencia exacta
      if (candidates.includes(date)) {
        usedDate = date;
      } else {
        // Buscar la fecha más cercana en días
        const target = new Date(date);
        let best = candidates[0];
        let bestDiff = Math.abs(new Date(best).getTime() - target.getTime());
        for (const c of candidates) {
          const diff = Math.abs(new Date(c).getTime() - target.getTime());
          if (diff < bestDiff) {
            best = c;
            bestDiff = diff;
          }
        }
        usedDate = best;
        outOfRange = true;
      }
    } else {
      // daily or others: intentar usar la fecha, pero validar contra start/end si existen
      if (indicator.startDate) {
        const start = new Date(indicator.startDate).getTime();
        const target = new Date(date).getTime();
        if (indicator.endDate) {
          const end = new Date(indicator.endDate).getTime();
          if (target < start || target > end) {
            // capear al rango
            outOfRange = true;
            usedDate = indicator.startDate;
          }
        } else if (target < start) {
          outOfRange = true;
          usedDate = indicator.startDate;
        }
      }
    }

    if (outOfRange) {
      setError(`La fecha ${date} no está disponible para ${indicatorId}. Usando ${usedDate}.`);
    } else {
      setError(null);
    }

    if (indicator.serviceType === 'WMS') {
      // Configuración para WMS
      const params = getWMSParams(indicator, usedDate);

      setLayerConfig({
        url: GIBS_BASE_URLS.WMS_EPSG3857,
        params,
        attribution,
        opacity,
        usedDate,
        outOfRange,
      });
    } else if (indicator.serviceType === 'WMTS') {
      const dateStr = usedDate; // mantener guiones: YYYY-MM-DD
      const tileUrlTemplate = `${GIBS_BASE_URLS.WMTS_EPSG3857}/${indicator.gibsLayerName}/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;

      setLayerConfig({
        url: tileUrlTemplate,
        attribution,
        opacity,
        usedDate,
        outOfRange,
      });
    } else {
      setLayerConfig(null);
    }
  }, [indicatorId, date, opacity, setError]);

  return layerConfig;
};
