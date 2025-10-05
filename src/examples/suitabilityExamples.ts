/**
 * Ejemplo de uso de los servicios de análisis de aptitud
 * Este archivo demuestra cómo usar cada servicio individualmente
 */

import {
  getClimateStatistics,
  calculateAridityIndex,
  NASA_POWER_PARAMETERS,
} from '../services/nasaPowerService';

import {
  interpretSoilProperties,
  evaluateSoilForQuinoa,
} from '../services/soilGridsService';

import {
  fetchElevation,
  analyzeterrain,
  evaluateTerrainForQuinoa,
} from '../services/elevationService';

import {
  analyzeCropSuitability,
  generateSuitabilityReport,
} from '../services/cropSuitabilityService';

// Coordenadas de ejemplo: La Paz, Bolivia (zona altiplánica)
const EXAMPLE_LAT = -16.5;
const EXAMPLE_LON = -68.15;

// Fechas para análisis climático (último año)
const getDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);
  
  const format = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
  
  return {
    start: format(start),
    end: format(end),
  };
};

/**
 * Ejemplo 1: Obtener datos climáticos
 */
export const exampleClimateData = async () => {
  console.log('📊 EXAMPLE 1: Climate Data\n');
  
  const { start, end } = getDateRange();
  
  const stats = await getClimateStatistics(EXAMPLE_LAT, EXAMPLE_LON, start, end);
  
  console.log('🌡️ Temperatura:');
  console.log(`  - Media: ${stats.temperature.mean.toFixed(1)}°C`);
  console.log(`  - Mínima: ${stats.tempMin.min.toFixed(1)}°C`);
  console.log(`  - Máxima: ${stats.tempMax.max.toFixed(1)}°C`);
  
  console.log('\n💧 Precipitación:');
  console.log(`  - Anual: ${stats.precipitation.sum.toFixed(0)} mm`);
  console.log(`  - Media diaria: ${stats.precipitation.mean.toFixed(2)} mm`);
  
  console.log('\n☀️ Radiación Solar:');
  console.log(`  - Media: ${stats.solarRadiation.mean.toFixed(1)} W/m²`);
  
  console.log('\n🌵 Evapotranspiración:');
  console.log(`  - Total: ${stats.evapotranspiration.sum.toFixed(0)} mm`);
  
  const aridityIndex = await calculateAridityIndex(EXAMPLE_LAT, EXAMPLE_LON, start, end);
  console.log(`\n📈 Índice de Aridez: ${aridityIndex.toFixed(2)}`);
  
  return stats;
};

/**
 * Ejemplo 2: Obtener propiedades del suelo
 */
export const exampleSoilData = async () => {
  console.log('\n\n🌱 EXAMPLE 2: Soil Properties\n');
  
  const soil = await interpretSoilProperties(EXAMPLE_LAT, EXAMPLE_LON);
  
  console.log('📋 Composición:');
  console.log(`  - Textura: ${soil.texture}`);
  console.log(`  - Arena: ${soil.sand.toFixed(1)}%`);
  console.log(`  - Limo: ${soil.silt.toFixed(1)}%`);
  console.log(`  - Arcilla: ${soil.clay.toFixed(1)}%`);
  
  console.log('\n🧪 Química:');
  console.log(`  - pH: ${soil.pH.toFixed(2)}`);
  console.log(`  - Carbono orgánico: ${soil.organicCarbon.toFixed(1)} g/kg`);
  console.log(`  - Materia orgánica: ${soil.organicMatter.toFixed(1)} g/kg`);
  console.log(`  - Nitrógeno: ${soil.nitrogen.toFixed(2)} g/kg`);
  console.log(`  - CEC: ${soil.cec.toFixed(1)} mmol(c)/kg`);
  
  console.log('\n💡 Interpretación:');
  console.log(`  - Fertilidad: ${soil.interpretation.fertility}`);
  console.log(`  - Drenaje: ${soil.interpretation.drainage}`);
  console.log(`  - Retención de agua: ${soil.interpretation.retention}`);
  console.log(`  - Nivel de pH: ${soil.interpretation.pHLevel}`);
  
  const evaluation = await evaluateSoilForQuinoa(EXAMPLE_LAT, EXAMPLE_LON);
  console.log(`\n🌾 Aptitud para Quinua: ${evaluation.suitability} (${evaluation.suitabilityPercent.toFixed(0)}%)`);
  
  return soil;
};

/**
 * Ejemplo 3: Obtener datos de terreno
 */
export const exampleTerrainData = async () => {
  console.log('\n\n⛰️ EXAMPLE 3: Topography\n');
  
  const elevation = await fetchElevation(EXAMPLE_LAT, EXAMPLE_LON);
  console.log(`📍 Elevación: ${elevation.toFixed(0)} m.s.n.m.`);
  
  const terrain = await analyzeterrain(EXAMPLE_LAT, EXAMPLE_LON);
  
  console.log('\n📐 Pendiente:');
  console.log(`  - Ángulo: ${terrain.slope.toFixed(2)}°`);
  console.log(`  - Clasificación: ${terrain.slopeClass}`);
  
  console.log('\n🧭 Orientación:');
  console.log(`  - Dirección: ${terrain.aspectDirection}`);
  console.log(`  - Azimut: ${terrain.aspect.toFixed(1)}°`);
  
  const evaluation = await evaluateTerrainForQuinoa(EXAMPLE_LAT, EXAMPLE_LON);
  console.log(`\n🌾 Aptitud para Quinua: ${evaluation.suitability} (${evaluation.suitabilityPercent.toFixed(0)}%)`);
  
  return terrain;
};

/**
 * Ejemplo 4: Análisis completo de aptitud
 */
export const exampleFullAnalysis = async () => {
  console.log('\n\n🎯 EXAMPLE 4: Full Suitability Analysis\n');
  
  const analysis = await analyzeCropSuitability(EXAMPLE_LAT, EXAMPLE_LON);
  
  console.log('📍 Location:');
  console.log(`  Lat: ${analysis.location.latitude.toFixed(4)}°`);
  console.log(`  Lon: ${analysis.location.longitude.toFixed(4)}°`);
  
  console.log('\n🌡️ Climate:');
  console.log(`  Suitability: ${analysis.climate.suitability} (${analysis.climate.suitabilityPercent.toFixed(0)}%)`);
  
  console.log('\n🌱 Soil:');
  console.log(`  Suitability: ${analysis.soil.suitability} (${analysis.soil.suitabilityPercent.toFixed(0)}%)`);
  
  console.log('\n⛰️ Terrain:');
  console.log(`  Suitability: ${analysis.terrain.suitability} (${analysis.terrain.suitabilityPercent.toFixed(0)}%)`);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 APTITUD GENERAL: ${analysis.overall.suitability}`);
  console.log(`📈 Puntuación: ${analysis.overall.suitabilityPercent.toFixed(0)}% (${analysis.overall.totalScore}/${analysis.overall.maxScore})`);
  console.log('='.repeat(60));
  
  if (analysis.overall.strengths.length > 0) {
    console.log('\n✅ Fortalezas:');
    analysis.overall.strengths.forEach((s) => console.log(`  • ${s}`));
  }
  
  if (analysis.overall.limitations.length > 0) {
    console.log('\n⚠️ Limitaciones:');
    analysis.overall.limitations.forEach((l) => console.log(`  • ${l}`));
  }
  
  console.log('\n💡 Recomendación:');
  console.log(`  ${analysis.overall.recommendation}`);
  
  console.log('\n\n📄 FULL REPORT:\n');
  const report = generateSuitabilityReport(analysis);
  console.log(report);
  
  return analysis;
};

/**
 * Ejecutar todos los ejemplos
 */
export const runAllExamples = async () => {
  console.log('🚀 Starting suitability service examples...\n');
  console.log('Example location: La Paz, Bolivia');
  console.log(`Coordinates: ${EXAMPLE_LAT}°, ${EXAMPLE_LON}°\n`);
  console.log('='.repeat(60));
  
  try {
    await exampleClimateData();
    await exampleSoilData();
    await exampleTerrainData();
    await exampleFullAnalysis();
    
    console.log('\n\n✅ Todos los ejemplos completados exitosamente!');
  } catch (error) {
    console.error('\n❌ Error ejecutando ejemplos:', error);
    throw error;
  }
};

// Exportar todas las constantes útiles
export {
  EXAMPLE_LAT,
  EXAMPLE_LON,
  NASA_POWER_PARAMETERS,
};
