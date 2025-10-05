/**
 * Crop Suitability Analysis Service
 * Integra datos de clima, suelo, elevación y vegetación para evaluar aptitud de cultivo
 */

import { getClimateStatistics, calculateAridityIndex } from './nasaPowerService';
import { evaluateSoilForQuinoa } from './soilGridsService';
import { evaluateTerrainForQuinoa } from './elevationService';

export interface CropSuitabilityAnalysis {
  location: {
    latitude: number;
    longitude: number;
  };
  climate: {
    temperature: {
      mean: number;
      min: number;
      max: number;
    };
    precipitation: {
      annual: number;
      mean: number;
    };
    solarRadiation: {
      mean: number;
    };
    aridityIndex: number;
    aridityClass: string;
    scores: {
      temperature: number;
      precipitation: number;
      aridity: number;
      solar: number;
    };
    suitability: string;
    suitabilityPercent: number;
  };
  soil: {
    texture: string;
    pH: number;
    organicMatter: number;
    scores: {
      texture: number;
      pH: number;
      organicMatter: number;
      drainage: number;
    };
    suitability: string;
    suitabilityPercent: number;
  };
  terrain: {
    elevation: number;
    slope: number;
    aspect: string;
    scores: {
      elevation: number;
      slope: number;
      aspect: number;
    };
    suitability: string;
    suitabilityPercent: number;
  };
  overall: {
    totalScore: number;
    maxScore: number;
    suitabilityPercent: number;
    suitability: string;
    recommendation: string;
    limitations: string[];
    strengths: string[];
  };
}

/**
 * Realiza análisis completo de aptitud para cultivo de quinua
 */
export const analyzeCropSuitability = async (
  latitude: number,
  longitude: number
): Promise<CropSuitabilityAnalysis> => {
  // Calcular fechas: 1 año de datos con retraso de 15 días
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 15); // Retraso de 15 días
  const startDate = new Date(endDate);
  startDate.setFullYear(endDate.getFullYear() - 1); // 1 año de datos
  
  const formatDate = (date: Date) =>
    date.toISOString().split('T')[0].replace(/-/g, '');
  
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  console.log('Crop suitability analysis dates:', { start, end, latitude, longitude });
  
  // Ejecutar análisis en paralelo para mayor eficiencia
  const [climateStats, aridityIndex, soilEval, terrainEval] = await Promise.all([
    getClimateStatistics(latitude, longitude, start, end),
    calculateAridityIndex(latitude, longitude, start, end),
    evaluateSoilForQuinoa(latitude, longitude),
    evaluateTerrainForQuinoa(latitude, longitude),
  ]);

  // Evaluar clima para quinua
  const climateScores = {
    temperature: 0,
    precipitation: 0,
    aridity: 0,
    solar: 0,
  };

  // Temperatura óptima: 10-20°C
  const avgTemp = climateStats.temperature.mean;
  if (avgTemp >= 10 && avgTemp <= 20) {
    climateScores.temperature = 10;
  } else if (avgTemp >= 5 && avgTemp <= 25) {
    climateScores.temperature = 7;
  } else if (avgTemp >= 0 && avgTemp <= 30) {
    climateScores.temperature = 4;
  } else {
    climateScores.temperature = 1;
  }

  // Precipitación anual: 300-800 mm
  const annualPrecip = climateStats.precipitation.sum;
  if (annualPrecip >= 300 && annualPrecip <= 800) {
    climateScores.precipitation = 10;
  } else if (annualPrecip >= 200 && annualPrecip <= 1000) {
    climateScores.precipitation = 7;
  } else if (annualPrecip >= 150 && annualPrecip <= 1200) {
    climateScores.precipitation = 4;
  } else {
    climateScores.precipitation = 1;
  }

  // Índice de aridez: prefiere semi-árido a sub-húmedo (0.2-0.65)
  if (aridityIndex >= 0.2 && aridityIndex <= 0.65) {
    climateScores.aridity = 10;
  } else if (aridityIndex >= 0.15 && aridityIndex <= 0.8) {
    climateScores.aridity = 7;
  } else {
    climateScores.aridity = 4;
  }

  // Radiación solar: prefiere alta (> 15 MJ/m²/día)
  const avgSolar = climateStats.solarRadiation.mean;
  if (avgSolar > 15) {
    climateScores.solar = 10;
  } else if (avgSolar > 12) {
    climateScores.solar = 7;
  } else {
    climateScores.solar = 4;
  }

  const climateTotal = Object.values(climateScores).reduce((sum, val) => sum + val, 0);
  const climateMax = 40;
  const climateSuitabilityPercent = (climateTotal / climateMax) * 100;

  // Clasificar índice de aridez
  const getAridityClass = (ai: number): string => {
    if (ai < 0.05) return 'Hiper-árido';
    if (ai < 0.2) return 'Árido';
    if (ai < 0.5) return 'Semi-árido';
    if (ai < 0.65) return 'Sub-húmedo seco';
    return 'Húmedo';
  };

  // Calcular puntuación total
  const totalScore =
    climateTotal +
    Object.values(soilEval.scores).reduce((sum, val) => sum + val, 0) +
    Object.values(terrainEval.scores).reduce((sum, val) => sum + val, 0);

  const maxScore = climateMax + 40 + 30; // clima + suelo + terreno
  const overallSuitabilityPercent = (totalScore / maxScore) * 100;

  // Determinar aptitud general
  let overallSuitability: string;
  if (overallSuitabilityPercent >= 80) {
    overallSuitability = 'Altamente apto';
  } else if (overallSuitabilityPercent >= 65) {
    overallSuitability = 'Apto';
  } else if (overallSuitabilityPercent >= 50) {
    overallSuitability = 'Moderadamente apto';
  } else if (overallSuitabilityPercent >= 35) {
    overallSuitability = 'Marginalmente apto';
  } else {
    overallSuitability = 'No apto';
  }

  // Identificar limitaciones y fortalezas
  const limitations: string[] = [];
  const strengths: string[] = [];

  if (climateScores.temperature < 7) limitations.push('Temperatura fuera del rango óptimo');
  else if (climateScores.temperature >= 9) strengths.push('Temperatura adecuada');

  if (climateScores.precipitation < 7) limitations.push('Precipitación insuficiente o excesiva');
  else if (climateScores.precipitation >= 9) strengths.push('Precipitación adecuada');

  if (terrainEval.scores.elevation < 7) limitations.push('Elevación no ideal');
  else if (terrainEval.scores.elevation >= 9) strengths.push('Elevación óptima para quinua');

  if (terrainEval.scores.slope < 6) limitations.push('Pendiente pronunciada');
  else if (terrainEval.scores.slope >= 8) strengths.push('Topografía favorable');

  if (soilEval.scores.pH < 6) limitations.push('pH del suelo no óptimo');
  else if (soilEval.scores.pH >= 9) strengths.push('pH del suelo adecuado');

  if (soilEval.scores.drainage < 6) limitations.push('Drenaje deficiente');
  else if (soilEval.scores.drainage >= 9) strengths.push('Buen drenaje del suelo');

  // Generar recomendación
  let recommendation = '';
  if (overallSuitabilityPercent >= 80) {
    recommendation = 'Excelente ubicación para cultivo de quinua. Condiciones óptimas en la mayoría de variables.';
  } else if (overallSuitabilityPercent >= 65) {
    recommendation = 'Buena ubicación para quinua. Algunas variables pueden mejorarse con manejo agronómico.';
  } else if (overallSuitabilityPercent >= 50) {
    recommendation = 'Ubicación moderadamente apta. Requiere manejo cuidadoso y posibles mejoras del suelo.';
  } else if (overallSuitabilityPercent >= 35) {
    recommendation = 'Ubicación marginalmente apta. Alto riesgo de rendimientos bajos. Considerar variedades resistentes.';
  } else {
    recommendation = 'Ubicación no recomendada para quinua. Considerar otros cultivos más adaptados.';
  }

  return {
    location: {
      latitude,
      longitude,
    },
    climate: {
      temperature: {
        mean: climateStats.temperature.mean,
        min: climateStats.tempMin.min,
        max: climateStats.tempMax.max,
      },
      precipitation: {
        annual: climateStats.precipitation.sum,
        mean: climateStats.precipitation.mean,
      },
      solarRadiation: {
        mean: climateStats.solarRadiation.mean,
      },
      aridityIndex,
      aridityClass: getAridityClass(aridityIndex),
      scores: climateScores,
      suitability:
        climateSuitabilityPercent >= 75
          ? 'Altamente apto'
          : climateSuitabilityPercent >= 50
          ? 'Moderadamente apto'
          : 'Poco apto',
      suitabilityPercent: climateSuitabilityPercent,
    },
    soil: {
      texture: soilEval.soilData.texture,
      pH: soilEval.soilData.pH,
      organicMatter: soilEval.soilData.organicMatter,
      scores: soilEval.scores,
      suitability: soilEval.suitability,
      suitabilityPercent: soilEval.suitabilityPercent,
    },
    terrain: {
      elevation: terrainEval.terrain.elevation,
      slope: terrainEval.terrain.slope,
      aspect: terrainEval.terrain.aspectDirection,
      scores: terrainEval.scores,
      suitability: terrainEval.suitability,
      suitabilityPercent: terrainEval.suitabilityPercent,
    },
    overall: {
      totalScore,
      maxScore,
      suitabilityPercent: overallSuitabilityPercent,
      suitability: overallSuitability,
      recommendation,
      limitations,
      strengths,
    },
  };
};

/**
 * Genera reporte resumido para visualización
 */
export const generateSuitabilityReport = (
  analysis: CropSuitabilityAnalysis
): string => {
  const report = `
📍 ANÁLISIS DE APTITUD PARA CULTIVO DE QUINUA
Ubicación: ${analysis.location.latitude.toFixed(4)}°, ${analysis.location.longitude.toFixed(4)}°

🌡️ CLIMA
• Temperatura media: ${analysis.climate.temperature.mean.toFixed(1)}°C
• Precipitación anual: ${analysis.climate.precipitation.annual.toFixed(0)} mm
• Índice de aridez: ${analysis.climate.aridityIndex.toFixed(2)} (${analysis.climate.aridityClass})
• Radiación solar: ${analysis.climate.solarRadiation.mean.toFixed(1)} W/m²
• Aptitud climática: ${analysis.climate.suitability} (${analysis.climate.suitabilityPercent.toFixed(0)}%)

🌱 SUELO
• Textura: ${analysis.soil.texture}
• pH: ${analysis.soil.pH.toFixed(1)}
• Materia orgánica: ${analysis.soil.organicMatter.toFixed(1)} g/kg
• Aptitud del suelo: ${analysis.soil.suitability} (${analysis.soil.suitabilityPercent.toFixed(0)}%)

⛰️ TERRENO
• Elevación: ${analysis.terrain.elevation.toFixed(0)} m.s.n.m.
• Pendiente: ${analysis.terrain.slope.toFixed(1)}°
• Orientación: ${analysis.terrain.aspect}
• Aptitud del terreno: ${analysis.terrain.suitability} (${analysis.terrain.suitabilityPercent.toFixed(0)}%)

📊 EVALUACIÓN GENERAL
• Aptitud total: ${analysis.overall.suitability} (${analysis.overall.suitabilityPercent.toFixed(0)}%)
• Puntuación: ${analysis.overall.totalScore}/${analysis.overall.maxScore}

✅ FORTALEZAS:
${analysis.overall.strengths.map((s) => `  • ${s}`).join('\n')}

⚠️ LIMITACIONES:
${analysis.overall.limitations.map((l) => `  • ${l}`).join('\n')}

💡 RECOMENDACIÓN:
${analysis.overall.recommendation}
  `.trim();

  return report;
};
