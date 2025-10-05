/**
 * SoilGrids API Service
 * Obtiene datos de propiedades del suelo (textura, materia orgánica, pH, etc.)
 * API Documentation: https://rest.isric.org/soilgrids/v2.0/docs
 */

const SOILGRIDS_BASE_URL = 'https://rest.isric.org/soilgrids/v2.0';

export interface SoilGridsResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    layers: Array<{
      name: string;
      unit_measure: {
        d_factor: number;
        mapped_units: string;
        target_units: string;
        uncertainty_unit: string;
      };
      depths: Array<{
        label: string;
        depth: {
          top_depth: number;
          bottom_depth: number;
          unit_depth: string;
        };
        values: {
          Q0_5: number; // 5th percentile
          Q0_95: number; // 95th percentile
          mean: number;
          uncertainty: number;
        };
      }>;
    }>;
  };
}

/**
 * Propiedades disponibles en SoilGrids:
 * - bdod: Bulk density (kg/dm³)
 * - cec: Cation exchange capacity (mmol(c)/kg)
 * - cfvo: Coarse fragments volumetric (%)
 * - clay: Clay content (%)
 * - nitrogen: Nitrogen (g/kg)
 * - phh2o: pH in H2O
 * - sand: Sand content (%)
 * - silt: Silt content (%)
 * - soc: Soil organic carbon (g/kg)
 * - ocd: Organic carbon density (kg/m³)
 */

export const SOILGRIDS_PROPERTIES = {
  BULK_DENSITY: 'bdod',
  CEC: 'cec',
  COARSE_FRAGMENTS: 'cfvo',
  CLAY: 'clay',
  NITROGEN: 'nitrogen',
  PH: 'phh2o',
  SAND: 'sand',
  SILT: 'silt',
  ORGANIC_CARBON: 'soc',
  ORGANIC_CARBON_DENSITY: 'ocd',
};

/**
 * Profundidades disponibles (cm):
 * - 0-5 cm
 * - 5-15 cm
 * - 15-30 cm
 * - 30-60 cm
 * - 60-100 cm
 * - 100-200 cm
 */

/**
 * Obtiene propiedades del suelo para un punto
 */
export const fetchSoilData = async (
  latitude: number,
  longitude: number,
  properties: string[] = Object.values(SOILGRIDS_PROPERTIES)
): Promise<SoilGridsResponse> => {
  const propertyQuery = properties.join('&property=');
  // SoilGrids API solo acepta: 0-5cm, 5-15cm, 15-30cm, 30-60cm, 60-100cm, 100-200cm
  // Usamos 0-5cm para superficie
  const url = `${SOILGRIDS_BASE_URL}/properties/query?lon=${longitude}&lat=${latitude}&property=${propertyQuery}&depth=0-5cm&value=mean`;

  console.log('Fetching SoilGrids data:', { latitude, longitude, properties });
  console.log('SoilGrids URL:', url);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SoilGrids API error:', response.status, errorText);
    throw new Error(`SoilGrids API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('SoilGrids response:', data);
  console.log('SoilGrids response structure:', {
    type: data.type,
    hasProperties: !!data.properties,
    hasLayers: !!data.properties?.layers,
    layersLength: data.properties?.layers?.length || 0,
    fullProperties: JSON.stringify(data.properties, null, 2)
  });
  
  return data;
};

/**
 * Obtiene clasificación del tipo de suelo basado en textura (arena, limo, arcilla)
 */
export const getSoilTexture = (sand: number, silt: number, clay: number): string => {
  // Clasificación simplificada USDA
  if (sand >= 85 && clay <= 10) return 'Arenoso';
  if (clay >= 40) return 'Arcilloso';
  if (silt >= 80 && clay < 12) return 'Limoso';
  if (sand >= 45 && sand <= 80 && clay <= 20) return 'Franco Arenoso';
  if (silt >= 50 && clay >= 12 && clay < 27) return 'Franco Limoso';
  if (clay >= 20 && clay < 40 && silt < 40 && sand < 45) return 'Franco Arcilloso';
  return 'Franco';
};

/**
 * Interpreta las propiedades del suelo para aptitud agrícola
 */
export const interpretSoilProperties = async (
  latitude: number,
  longitude: number
) => {
  const data = await fetchSoilData(latitude, longitude, [
    SOILGRIDS_PROPERTIES.CLAY,
    SOILGRIDS_PROPERTIES.SAND,
    SOILGRIDS_PROPERTIES.SILT,
    SOILGRIDS_PROPERTIES.ORGANIC_CARBON,
    SOILGRIDS_PROPERTIES.PH,
    SOILGRIDS_PROPERTIES.NITROGEN,
    SOILGRIDS_PROPERTIES.CEC,
  ]);

  const extractValue = (propertyName: string): number => {
    const layer = data.properties.layers.find((l) => l.name === propertyName);
    if (!layer || layer.depths.length === 0) return 0;
    
    // Tomar la capa superficial (0-30cm)
    const surfaceDepth = layer.depths[0];
    const meanValue = surfaceDepth.values.mean;
    const dFactor = layer.unit_measure.d_factor;
    
    // Verificar valores válidos
    if (meanValue === null || meanValue === undefined || isNaN(meanValue)) {
      return 0;
    }
    
    // Si d_factor es 0 o no existe, usar el valor directamente
    if (!dFactor || dFactor === 0) {
      return meanValue;
    }
    
    // Aplicar factor de conversión
    return meanValue / dFactor;
  };

  const clay = extractValue(SOILGRIDS_PROPERTIES.CLAY);
  const sand = extractValue(SOILGRIDS_PROPERTIES.SAND);
  const silt = extractValue(SOILGRIDS_PROPERTIES.SILT);
  const organicCarbon = extractValue(SOILGRIDS_PROPERTIES.ORGANIC_CARBON);
  const pH = extractValue(SOILGRIDS_PROPERTIES.PH);
  const nitrogen = extractValue(SOILGRIDS_PROPERTIES.NITROGEN);
  const cec = extractValue(SOILGRIDS_PROPERTIES.CEC);

  const texture = getSoilTexture(sand, silt, clay);

  // Materia orgánica = Carbono orgánico * 1.72
  const organicMatter = organicCarbon * 1.72;

  return {
    texture,
    clay,
    sand,
    silt,
    organicCarbon,
    organicMatter,
    pH,
    nitrogen,
    cec,
    interpretation: {
      texture: texture,
      fertility: organicMatter > 30 ? 'Alta' : organicMatter > 15 ? 'Media' : 'Baja',
      drainage: sand > 60 ? 'Bueno' : sand > 40 ? 'Moderado' : 'Pobre',
      retention: clay > 35 ? 'Alta' : clay > 20 ? 'Media' : 'Baja',
      pHLevel: pH > 7.5 ? 'Alcalino' : pH > 6.5 ? 'Neutro' : pH > 5.5 ? 'Ligeramente ácido' : 'Ácido',
    },
  };
};

/**
 * Evalúa aptitud del suelo para quinua
 */
export const evaluateSoilForQuinoa = async (
  latitude: number,
  longitude: number
) => {
  const soilData = await interpretSoilProperties(latitude, longitude);

  const scores = {
    texture: 0,
    pH: 0,
    organicMatter: 0,
    drainage: 0,
  };

  // Quinua prefiere suelos francos o franco arenosos
  if (['Franco', 'Franco Arenoso', 'Franco Limoso'].includes(soilData.texture)) {
    scores.texture = 10;
  } else if (['Arenoso', 'Franco Arcilloso'].includes(soilData.texture)) {
    scores.texture = 6;
  } else {
    scores.texture = 3;
  }

  // pH óptimo: 6.0 - 8.5
  if (soilData.pH >= 6.0 && soilData.pH <= 8.5) {
    scores.pH = 10;
  } else if (soilData.pH >= 5.5 || soilData.pH <= 9.0) {
    scores.pH = 6;
  } else {
    scores.pH = 3;
  }

  // Materia orgánica: prefiere > 2%
  if (soilData.organicMatter > 20) {
    scores.organicMatter = 10;
  } else if (soilData.organicMatter > 10) {
    scores.organicMatter = 7;
  } else {
    scores.organicMatter = 4;
  }

  // Drenaje: prefiere bueno a moderado
  if (soilData.interpretation.drainage === 'Bueno') {
    scores.drainage = 10;
  } else if (soilData.interpretation.drainage === 'Moderado') {
    scores.drainage = 7;
  } else {
    scores.drainage = 3;
  }

  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = 40;
  const suitabilityPercent = (totalScore / maxScore) * 100;

  return {
    soilData,
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
