/**
 * NASA POWER API Service
 * Obtiene datos de radiación solar, temperatura, precipitación y otros parámetros climáticos
 * API Documentation: https://power.larc.nasa.gov/docs/services/api/
 */

const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

export interface NASAPowerParams {
  latitude: number;
  longitude: number;
  start: string; // Format: YYYYMMDD
  end: string; // Format: YYYYMMDD
  parameters: string[]; // e.g., ['ALLSKY_SFC_SW_DWN', 'T2M', 'PRECTOTCORR']
}

export interface NASAPowerResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    parameter: {
      [key: string]: {
        [date: string]: number;
      };
    };
  };
  messages?: string[];
  parameters?: {
    [key: string]: {
      units: string;
      longname: string;
    };
  };
}

/**
 * Parámetros disponibles en NASA POWER:
 * - ALLSKY_SFC_SW_DWN: Radiación solar de onda corta (W/m²)
 * - T2M: Temperatura a 2m (°C)
 * - T2M_MAX: Temperatura máxima (°C)
 * - T2M_MIN: Temperatura mínima (°C)
 * - PRECTOTCORR: Precipitación corregida (mm/day)
 * - RH2M: Humedad relativa (%)
 * - WS2M: Velocidad del viento a 2m (m/s)
 * - EVPTRNS: Evapotranspiración (mm/day)
 */

export const NASA_POWER_PARAMETERS = {
  SOLAR_RADIATION: 'ALLSKY_SFC_SW_DWN',
  TEMPERATURE: 'T2M',
  TEMP_MAX: 'T2M_MAX',
  TEMP_MIN: 'T2M_MIN',
  PRECIPITATION: 'PRECTOTCORR',
  HUMIDITY: 'RH2M',
  WIND_SPEED: 'WS2M',
  EVAPOTRANSPIRATION: 'EVPTRNS',
};

/**
 * Obtiene datos climáticos de NASA POWER para un punto y rango de fechas
 */
export const fetchNASAPowerData = async (
  params: NASAPowerParams
): Promise<NASAPowerResponse> => {
  const { latitude, longitude, start, end, parameters } = params;

  const url = new URL(NASA_POWER_BASE_URL);
  url.searchParams.append('latitude', latitude.toString());
  url.searchParams.append('longitude', longitude.toString());
  url.searchParams.append('start', start);
  url.searchParams.append('end', end);
  url.searchParams.append('parameters', parameters.join(','));
  url.searchParams.append('community', 'AG'); // Agricultural community
  url.searchParams.append('format', 'JSON');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`NASA POWER API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Obtiene el promedio de radiación solar para un período
 */
export const getAverageSolarRadiation = async (
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<number> => {
  const data = await fetchNASAPowerData({
    latitude,
    longitude,
    start: startDate,
    end: endDate,
    parameters: [NASA_POWER_PARAMETERS.SOLAR_RADIATION],
  });

  const values = Object.values(
    data.properties.parameter[NASA_POWER_PARAMETERS.SOLAR_RADIATION]
  ).filter((v) => v !== -999); // Filtrar valores faltantes

  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Obtiene estadísticas climáticas completas para un punto
 */
export const getClimateStatistics = async (
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
) => {
  const data = await fetchNASAPowerData({
    latitude,
    longitude,
    start: startDate,
    end: endDate,
    parameters: [
      NASA_POWER_PARAMETERS.SOLAR_RADIATION,
      NASA_POWER_PARAMETERS.TEMPERATURE,
      NASA_POWER_PARAMETERS.TEMP_MAX,
      NASA_POWER_PARAMETERS.TEMP_MIN,
      NASA_POWER_PARAMETERS.PRECIPITATION,
      NASA_POWER_PARAMETERS.EVAPOTRANSPIRATION,
    ],
  });

  const calculateStats = (paramName: string) => {
    const values = Object.values(data.properties.parameter[paramName]).filter(
      (v) => v !== -999
    );
    return {
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      sum: values.reduce((sum, val) => sum + val, 0),
    };
  };

  return {
    solarRadiation: calculateStats(NASA_POWER_PARAMETERS.SOLAR_RADIATION),
    temperature: calculateStats(NASA_POWER_PARAMETERS.TEMPERATURE),
    tempMax: calculateStats(NASA_POWER_PARAMETERS.TEMP_MAX),
    tempMin: calculateStats(NASA_POWER_PARAMETERS.TEMP_MIN),
    precipitation: calculateStats(NASA_POWER_PARAMETERS.PRECIPITATION),
    evapotranspiration: calculateStats(NASA_POWER_PARAMETERS.EVAPOTRANSPIRATION),
    metadata: data.parameters,
  };
};

/**
 * Calcula el índice de aridez simplificado (P/ETP)
 */
export const calculateAridityIndex = async (
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<number> => {
  const stats = await getClimateStatistics(latitude, longitude, startDate, endDate);
  
  const totalPrecipitation = stats.precipitation.sum;
  const totalEvapotranspiration = stats.evapotranspiration.sum;

  // Índice de aridez = P/ETP
  // < 0.05: Hyper-arid
  // 0.05-0.20: Arid
  // 0.20-0.50: Semi-arid
  // 0.50-0.65: Dry sub-humid
  // > 0.65: Humid
  return totalPrecipitation / totalEvapotranspiration;
};
