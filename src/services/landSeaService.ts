/**
 * Land/Sea Validation Service
 * Servicio para validar si un punto está en tierra o mar usando APIs externas
 */

export interface LandValidationResult {
  isLand: boolean;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  message?: string;
}

export class LandSeaService {
  /**
   * Verifica si las coordenadas están en tierra usando BigDataCloud (GRATUITO)
   */
  static async isOnLandBigDataCloud(lat: number, lon: number): Promise<LandValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos
      
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verificar si tiene código de país válido
      const hasCountry = data.countryCode && data.countryCode !== '';
      
      // Verificar si no menciona océano en la localidad
      const locality = data.locality || '';
      const isOcean = locality.toLowerCase().includes('ocean') || 
                     locality.toLowerCase().includes('sea') ||
                     data.city === '' && data.principalSubdivision === '';
      
      const isLand = hasCountry && !isOcean;
      
      return {
        isLand,
        confidence: 'high',
        source: 'BigDataCloud',
        message: isLand ? 
          `Ubicación en ${data.countryName || 'tierra'}` : 
          'Punto ubicado en área oceánica'
      };
    } catch (error) {
      console.error('Error con BigDataCloud:', error);
      
      // En caso de error, usar validación básica como fallback
      const basicResult = this.isLikelyOnLand(lat, lon);
      return {
        isLand: basicResult,
        confidence: 'low',
        source: 'BasicValidation',
        message: 'No se pudo verificar con servicio externo, usando validación básica'
      };
    }
  }

  /**
   * Validación principal con fallback automático
   */
  static async validateLandPoint(lat: number, lon: number): Promise<LandValidationResult> {
    // Primero validación rápida de coordenadas extremas
    if (Math.abs(lat) > 85 || Math.abs(lon) > 180) {
      return {
        isLand: false,
        confidence: 'high',
        source: 'CoordinateValidation',
        message: 'Coordenadas inválidas'
      };
    }
    
    // Intentar con BigDataCloud
    return await this.isOnLandBigDataCloud(lat, lon);
  }

  /**
   * Validación básica usando coordenadas conocidas de océanos principales
   * Se usa como fallback cuando las APIs externas fallan
   */
  private static isLikelyOnLand(lat: number, lon: number): boolean {
    // Océano Pacífico central
    if (lat > -30 && lat < 30) {
      if ((lon > 160 && lon <= 180) || (lon >= -180 && lon < -120)) {
        return false;
      }
    }
    
    // Océano Atlántico central
    if (lat > -20 && lat < 20 && lon > -50 && lon < -10) {
      return false;
    }
    
    // Océano Índico central
    if (lat > -30 && lat < 10 && lon > 60 && lon < 95) {
      return false;
    }
    
    // Océano Antártico
    if (lat < -65) {
      return false;
    }
    
    // Océano Ártico central
    if (lat > 80) {
      return false;
    }
    
    return true; // Por defecto, asumir tierra
  }
}