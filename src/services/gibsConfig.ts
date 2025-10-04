/**
 * GIBS Configuration
 * Mapping de indicadores a capas GIBS con metadata y endpoints
 */

export interface GIBSIndicator {
  id: string;
  friendlyName: string;
  gibsLayerName: string;
  serviceType: 'WMS' | 'WMTS' | 'MVT';
  timeResolution: 'daily' | '8-day' | 'annual' | 'static';
  legendURL: string;
  preferredCRS: string;
  spatialResolution: string;
  description: string;
  docURL: string;
  startDate?: string;
  endDate?: string;
  format?: string;
}

export const GIBS_BASE_URLS = {
  WMS_EPSG3857: 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi',
  WMTS_EPSG3857: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best',
  LEGENDS: 'https://gibs.earthdata.nasa.gov/legends',
};

export const INDICATORS: Record<string, GIBSIndicator> = {
  TRUE_COLOR: {
    id: 'TRUE_COLOR',
    friendlyName: 'True Color (MODIS Terra)',
    gibsLayerName: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    serviceType: 'WMTS',
    timeResolution: 'daily',
    legendURL: '',
    preferredCRS: 'EPSG:3857',
    spatialResolution: '250m',
    description: 'Imagen de color real de la superficie terrestre captada por MODIS Terra',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_CorrectedReflectance_TrueColor',
    startDate: '2000-02-24',
    format: 'image/jpeg',
  },
  SURFACE_REFLECTANCE: {
    id: 'SURFACE_REFLECTANCE',
    friendlyName: 'Surface Reflectance (MODIS Bands 1-4)',
    gibsLayerName: 'MODIS_Terra_SurfaceReflectance_Bands143',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_SurfaceReflectance_Bands143_H.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '500m',
    description: 'Reflectancia superficial multi-banda (Bands 1-4-3) útil para análisis de vegetación',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_SurfaceReflectance_Bands143',
    startDate: '2000-02-24',
    format: 'image/png',
  },
  THERMAL_ANOMALIES: {
    id: 'THERMAL_ANOMALIES',
    friendlyName: 'Thermal Anomalies (VIIRS/NOAA20)',
    gibsLayerName: 'VIIRS_NOAA20_Thermal_Anomalies_375m_All',
    serviceType: 'WMTS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/VIIRS_NOAA20_Thermal_Anomalies_375m_H.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '375m',
    description: 'Anomalías térmicas y detección de fuegos activos',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=VIIRS_NOAA20_Thermal_Anomalies_375m_All',
    startDate: '2018-01-01',
    format: 'image/png',
  },
  CROPLANDS: {
    id: 'CROPLANDS',
    friendlyName: 'Croplands (Global)',
    gibsLayerName: 'Agricultural_Lands_Croplands_2000',
    serviceType: 'WMTS',
    timeResolution: 'static',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/Agricultural_Lands_Croplands_2000_H.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '1km',
    description: 'Mapa global de tierras agrícolas y cultivos (año 2000)',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=Agricultural_Lands_Croplands_2000',
    startDate: '2000-01-01',
    endDate: '2000-12-31',
    format: 'image/png',
  },
};

export const getIndicatorsList = (): GIBSIndicator[] => {
  return Object.values(INDICATORS);
};

export const getIndicatorById = (id: string): GIBSIndicator | undefined => {
  return INDICATORS[id];
};

/**
 * Genera la URL de tiles WMTS para un indicador, fecha y coordenadas
 */
export const getWMTSTileURL = (
  indicator: GIBSIndicator,
  date: string,
  z: number,
  x: number,
  y: number
): string => {
  const dateStr = date.replace(/-/g, '');
  const tileMatrixSet = 'GoogleMapsCompatible_Level9';
  
  return `${GIBS_BASE_URLS.WMTS_EPSG3857}/${indicator.gibsLayerName}/default/${dateStr}/${tileMatrixSet}/${z}/${y}/${x}.png`;
};

/**
 * Genera los parámetros WMS para un indicador y fecha
 */
export const getWMSParams = (indicator: GIBSIndicator, date: string) => {
  return {
    layers: indicator.gibsLayerName,
    time: date,
    format: indicator.format || 'image/png',
    transparent: true,
    version: '1.3.0',
  };
};
