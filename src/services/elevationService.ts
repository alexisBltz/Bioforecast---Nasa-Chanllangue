/**
 * Elevation Service
 * Obtiene datos de elevación, pendiente y orientación usando Open-Elevation API
 * También soporta cálculos derivados de elevación
 */

// Open-Elevation API (gratuita y open source)
const OPEN_ELEVATION_API = 'https://api.open-elevation.com/api/v1/lookup';

// Alternativa: USGS Elevation Point Query Service
const USGS_ELEVATION_API = 'https://epqs.nationalmap.gov/v1/json';

export interface ElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}

export interface TerrainAnalysis {
  elevation: number;
  slope: number; // En grados
  aspect: number; // En grados (0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste)
  aspectDirection: string; // N, NE, E, SE, S, SW, W, NW
  slopeClass: string; // Plano, Suave, Moderado, Pronunciado, Muy pronunciado
}

/**
 * Obtiene elevación de un punto usando Open-Elevation API
 */
export const fetchElevation = async (
  latitude: number,
  longitude: number
): Promise<number> => {
  const url = `${OPEN_ELEVATION_API}?locations=${latitude},${longitude}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback a USGS si Open-Elevation falla
      return fetchElevationUSGS(latitude, longitude);
    }

    const data: ElevationResponse = await response.json();
    return data.results[0].elevation;
  } catch (error) {
    console.error('Error fetching elevation from Open-Elevation:', error);
    // Fallback a USGS
    return fetchElevationUSGS(latitude, longitude);
  }
};

/**
 * Obtiene elevación usando USGS Elevation Point Query Service (fallback)
 */
const fetchElevationUSGS = async (
  latitude: number,
  longitude: number
): Promise<number> => {
  const url = `${USGS_ELEVATION_API}?x=${longitude}&y=${latitude}&units=Meters&output=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`USGS Elevation API error: ${response.status}`);
  }

  const data = await response.json();
  return data.value || 0;
};

/**
 * Obtiene elevaciones de múltiples puntos
 */
export const fetchElevationBatch = async (
  points: Array<{ latitude: number; longitude: number }>
): Promise<number[]> => {
  const locations = points.map((p) => `${p.latitude},${p.longitude}`).join('|');
  const url = `${OPEN_ELEVATION_API}?locations=${locations}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Elevation API error: ${response.status}`);
  }

  const data: ElevationResponse = await response.json();
  return data.results.map((r) => r.elevation);
};

/**
 * Calcula pendiente y orientación usando una cuadrícula 3x3 alrededor del punto
 * Utiliza el algoritmo de Horn para calcular pendiente y aspecto
 */
export const calculateSlopeAndAspect = async (
  latitude: number,
  longitude: number,
  cellSize: number = 0.001 // ~111 metros en el ecuador
): Promise<{ slope: number; aspect: number; aspectDirection: string }> => {
  // Crear cuadrícula 3x3
  const points = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      points.push({
        latitude: latitude + i * cellSize,
        longitude: longitude + j * cellSize,
      });
    }
  }

  const elevations = await fetchElevationBatch(points);

  // Algoritmo de Horn para calcular gradientes
  // z1 z2 z3
  // z4 z5 z6
  // z7 z8 z9
  const [z1, z2, z3, z4, , z6, z7, z8, z9] = elevations;

  const dz_dx = ((z3 + 2 * z6 + z9) - (z1 + 2 * z4 + z7)) / (8 * cellSize * 111000);
  const dz_dy = ((z7 + 2 * z8 + z9) - (z1 + 2 * z2 + z3)) / (8 * cellSize * 111000);

  // Calcular pendiente en grados
  const slope = Math.atan(Math.sqrt(dz_dx ** 2 + dz_dy ** 2)) * (180 / Math.PI);

  // Calcular aspecto (orientación)
  let aspect = Math.atan2(dz_dy, -dz_dx) * (180 / Math.PI);

  // Convertir a rango 0-360 (0 = Norte)
  if (aspect < 0) {
    aspect = 90.0 - aspect;
  } else if (aspect > 90.0) {
    aspect = 360.0 - aspect + 90.0;
  } else {
    aspect = 90.0 - aspect;
  }

  const aspectDirection = getAspectDirection(aspect);

  return { slope, aspect, aspectDirection };
};

/**
 * Convierte aspecto numérico a dirección cardinal
 */
const getAspectDirection = (aspect: number): string => {
  if (aspect >= 337.5 || aspect < 22.5) return 'N';
  if (aspect >= 22.5 && aspect < 67.5) return 'NE';
  if (aspect >= 67.5 && aspect < 112.5) return 'E';
  if (aspect >= 112.5 && aspect < 157.5) return 'SE';
  if (aspect >= 157.5 && aspect < 202.5) return 'S';
  if (aspect >= 202.5 && aspect < 247.5) return 'SW';
  if (aspect >= 247.5 && aspect < 292.5) return 'W';
  if (aspect >= 292.5 && aspect < 337.5) return 'NW';
  return 'N';
};

/**
 * Clasifica la pendiente
 */
const getSlopeClass = (slope: number): string => {
  if (slope < 2) return 'Plano';
  if (slope < 5) return 'Suave';
  if (slope < 10) return 'Moderado';
  if (slope < 15) return 'Moderadamente pronunciado';
  if (slope < 30) return 'Pronunciado';
  return 'Muy pronunciado';
};

/**
 * Análisis completo del terreno
 */
export const analyzeterrain = async (
  latitude: number,
  longitude: number
): Promise<TerrainAnalysis> => {
  const elevation = await fetchElevation(latitude, longitude);
  const { slope, aspect, aspectDirection } = await calculateSlopeAndAspect(
    latitude,
    longitude
  );

  return {
    elevation,
    slope,
    aspect,
    aspectDirection,
    slopeClass: getSlopeClass(slope),
  };
};

/**
 * Evalúa aptitud del terreno para cultivo de quinua
 */
export const evaluateTerrainForQuinoa = async (
  latitude: number,
  longitude: number
) => {
  const terrain = await analyzeterrain(latitude, longitude);

  const scores = {
    elevation: 0,
    slope: 0,
    aspect: 0,
  };

  // Elevación óptima para quinua: 2500-4000 m.s.n.m.
  if (terrain.elevation >= 2500 && terrain.elevation <= 4000) {
    scores.elevation = 10;
  } else if (terrain.elevation >= 2000 && terrain.elevation <= 4500) {
    scores.elevation = 7;
  } else if (terrain.elevation >= 1500 || terrain.elevation <= 5000) {
    scores.elevation = 4;
  } else {
    scores.elevation = 1;
  }

  // Pendiente: prefiere < 15%
  if (terrain.slope < 5) {
    scores.slope = 10;
  } else if (terrain.slope < 10) {
    scores.slope = 8;
  } else if (terrain.slope < 15) {
    scores.slope = 6;
  } else if (terrain.slope < 30) {
    scores.slope = 3;
  } else {
    scores.slope = 1;
  }

  // Orientación: prefiere exposición norte/este en hemisferio sur, sur/oeste en hemisferio norte
  const preferredAspects =
    latitude < 0 ? ['N', 'NE', 'E', 'NW'] : ['S', 'SE', 'SW', 'E'];
  if (preferredAspects.includes(terrain.aspectDirection)) {
    scores.aspect = 10;
  } else {
    scores.aspect = 6;
  }

  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = 30;
  const suitabilityPercent = (totalScore / maxScore) * 100;

  return {
    terrain,
    scores,
    suitabilityPercent,
    suitability:
      suitabilityPercent >= 75
        ? 'Altamente apto'
        : suitabilityPercent >= 50
        ? 'Moderadamente apto'
        : 'Poco apto',
  };
};
