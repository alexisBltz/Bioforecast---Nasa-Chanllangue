/**
 * Constantes de configuración para valores iniciales y por defecto de la aplicación
 */

// Valores iniciales para el mapa y la aplicación
export const DEFAULT_MAP_CONFIG = {
  // Coordenadas iniciales (centrado en Sudamérica/Bolivia)
  LATITUDE: -10,
  LONGITUDE: -72.0,  // Corregido: debe estar entre -180 y 180
  
  // Zoom inicial (nivel continental)
  ZOOM: 5,
  
  // Opacidad inicial de las capas
  OPACITY: 0.9,
} as const;

// Configuración adicional
export const APP_CONFIG = {
  // Indicador por defecto
  DEFAULT_INDICATOR: 'NDVI',
  
  // Intervalo de días por defecto
  DEFAULT_DATE_INTERVAL: 1,
  
  // Velocidad de reproducción por defecto (ms)
  DEFAULT_PLAY_SPEED: 1000,
} as const;

// Exportar valores individuales para fácil acceso
export const {
  LATITUDE: DEFAULT_LATITUDE,
  LONGITUDE: DEFAULT_LONGITUDE,
  ZOOM: DEFAULT_ZOOM,
  OPACITY: DEFAULT_OPACITY,
} = DEFAULT_MAP_CONFIG;