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
  SURFACE_REFLECTANCE: {
    id: 'SURFACE_REFLECTANCE',
    friendlyName: 'Reflectancia superficial (MODIS — bandas 1,4,3)',
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
    friendlyName: 'Anomalías térmicas y detección de fuegos (VIIRS NOAA20)',
    gibsLayerName: 'VIIRS_NOAA20_Thermal_Anomalies_375m_All',
    serviceType: 'WMS',
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
    friendlyName: 'Tierras agrícolas (mapa global, año 2000)',
    gibsLayerName: 'Agricultural_Lands_Croplands_2000',
    serviceType: 'WMS',
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
  // NUEVOS INDICADORES PARA MONITOREO DE FLORACIÓN
  NDVI: {
    id: 'NDVI',
    friendlyName: 'NDVI — Índice de vegetación (salud y densidad)',
    gibsLayerName: 'MODIS_Terra_NDVI_8Day',
    serviceType: 'WMS',
    timeResolution: '8-day',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_NDVI_8Day.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '500m',
    description: 'Índice de Vegetación de Diferencia Normalizada - Mide la salud y densidad de la vegetación',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_NDVI_8Day',
    startDate: '2000-02-18',
    format: 'image/png',
  },
  EVI: {
    id: 'EVI',
    friendlyName: 'EVI — Índice de vegetación mejorado (alta biomasa)',
    gibsLayerName: 'MODIS_Terra_EVI_8Day',
    serviceType: 'WMS',
    timeResolution: '8-day',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_EVI_8Day.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '500m',
    description: 'Índice de Vegetación Mejorado - Optimizado para áreas de alta biomasa',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_EVI_8Day',
    startDate: '2000-02-18',
    format: 'image/png',
  },
  LST_DAY: {
    id: 'LST_DAY',
    friendlyName: 'Temperatura de superficie — Día',
    gibsLayerName: 'MODIS_Terra_Land_Surface_Temp_Day',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_Land_Surface_Temp_Day.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '1km',
    description: 'Temperatura de la superficie terrestre durante el día',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_Land_Surface_Temp_Day',
    startDate: '2000-03-05',
    format: 'image/png',
  },
  PRECIPITATION: {
    id: 'PRECIPITATION',
    friendlyName: 'Precipitación — Tasa (GPM IMERG)',
    gibsLayerName: 'IMERG_Precipitation_Rate',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/IMERG_Precipitation_Rate.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '10km',
    description: 'Tasa de precipitación - GPM IMERG',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=IMERG_Precipitation_Rate',
    startDate: '2000-06-01',
    format: 'image/png',
  },
  SNOW_COVER: {
    id: 'SNOW_COVER',
    friendlyName: 'Cobertura de nieve (mapa cada 8 días)',
    gibsLayerName: 'MODIS_Terra_NDSI_Snow_Cover',
    serviceType: 'WMS',
    timeResolution: '8-day',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_NDSI_Snow_Cover.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '500m',
    description: '⚠️ Cobertura de nieve y hielo (Solo visible en regiones con nieve, datos cada 8 días)',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_NDSI_Snow_Cover',
    startDate: '2000-02-24',
    format: 'image/png',
  },
  // VARIABLES ADICIONALES PARA ANÁLISIS DE APTITUD
  LST_NIGHT: {
    id: 'LST_NIGHT',
    friendlyName: 'Temperatura de superficie — Noche',
    gibsLayerName: 'MODIS_Terra_Land_Surface_Temp_Night',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Terra_Land_Surface_Temp_Night.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '1km',
    description: 'Temperatura de la superficie terrestre durante la noche',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_Land_Surface_Temp_Night',
    startDate: '2000-03-05',
    format: 'image/png',
  },
  SOIL_MOISTURE: {
    id: 'SOIL_MOISTURE',
    friendlyName: 'Humedad del suelo superficial (SMAP)',
    gibsLayerName: 'SMAP_L4_Analyzed_Surface_Soil_Moisture',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/SMAP_L4_Analyzed_Surface_Soil_Moisture.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '9km',
    description: 'Humedad del suelo superficial - SMAP',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=SMAP_L4_Analyzed_Surface_Soil_Moisture',
    startDate: '2015-03-31',
    format: 'image/png',
  },
  AEROSOL_OPTICAL_DEPTH: {
    id: 'AEROSOL_OPTICAL_DEPTH',
    friendlyName: 'Aerosoles — Profundidad óptica (calidad del aire)',
    gibsLayerName: 'MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth',
    serviceType: 'WMS',
    timeResolution: 'daily',
    legendURL: `${GIBS_BASE_URLS.LEGENDS}/MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth.png`,
    preferredCRS: 'EPSG:3857',
    spatialResolution: '1km',
    description: 'Profundidad óptica de aerosoles - calidad del aire',
    docURL: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth',
    startDate: '2000-02-24',
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
  const dateStr = date; // No quitar los guiones
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
