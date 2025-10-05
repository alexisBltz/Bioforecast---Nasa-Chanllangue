/**
 * Services Index
 * Exporta todos los servicios de datos para fácil importación
 */

// GIBS Service (existente)
export * from './gibsConfig';

// NASA POWER Service - Clima y radiación solar
export {
  fetchNASAPowerData,
  getAverageSolarRadiation,
  getClimateStatistics,
  calculateAridityIndex,
  NASA_POWER_PARAMETERS,
  type NASAPowerParams,
  type NASAPowerResponse,
} from './nasaPowerService';

// SoilGrids Service - Propiedades del suelo
export {
  fetchSoilData,
  interpretSoilProperties,
  evaluateSoilForQuinoa,
  getSoilTexture,
  SOILGRIDS_PROPERTIES,
  type SoilGridsResponse,
} from './soilGridsService';

// Elevation Service - Elevación, pendiente y orientación
export {
  fetchElevation,
  fetchElevationBatch,
  calculateSlopeAndAspect,
  analyzeterrain,
  evaluateTerrainForQuinoa,
  type ElevationResponse,
  type TerrainAnalysis,
} from './elevationService';

// Crop Suitability Service - Análisis integrado
export {
  analyzeCropSuitability,
  generateSuitabilityReport,
  type CropSuitabilityAnalysis,
} from './cropSuitabilityService';
