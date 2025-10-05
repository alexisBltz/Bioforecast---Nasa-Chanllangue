/**
 * URL State Management
 * Serializa y deserializa el estado de la aplicación en query params
 */

export interface AppState {
  indicator: string;
  date: string;
  lat: number;
  lng: number;
  zoom: number;
  opacity: number;
}

const DEFAULT_STATE: AppState = {
  indicator: 'NDVI',
  date: new Date().toISOString().split('T')[0],
  lat: 0,
  lng: 0,
  zoom: 3,
  opacity: 0.8,
};

/**
 * Serializa el estado a query params
 */
export const serializeState = (state: Partial<AppState>): string => {
  const params = new URLSearchParams();
  
  if (state.indicator) params.set('indicator', state.indicator);
  if (state.date) params.set('date', state.date);
  if (state.lat !== undefined) params.set('lat', state.lat.toFixed(4));
  if (state.lng !== undefined) params.set('lng', state.lng.toFixed(4));
  if (state.zoom !== undefined) params.set('zoom', state.zoom.toString());
  if (state.opacity !== undefined) params.set('opacity', state.opacity.toFixed(2));
  
  return params.toString();
};

/**
 * Deserializa query params a estado
 */
export const deserializeState = (search: string): AppState => {
  const params = new URLSearchParams(search);
  
  return {
    indicator: params.get('indicator') || DEFAULT_STATE.indicator,
    date: params.get('date') || DEFAULT_STATE.date,
    lat: parseFloat(params.get('lat') || String(DEFAULT_STATE.lat)),
    lng: parseFloat(params.get('lng') || String(DEFAULT_STATE.lng)),
    zoom: parseInt(params.get('zoom') || String(DEFAULT_STATE.zoom), 10),
    opacity: parseFloat(params.get('opacity') || String(DEFAULT_STATE.opacity)),
  };
};

/**
 * Actualiza la URL con el nuevo estado sin recargar la página
 */
export const updateURL = (state: Partial<AppState>): void => {
  const queryString = serializeState(state);
  const newURL = `${window.location.pathname}?${queryString}`;
  window.history.replaceState(null, '', newURL);
};

/**
 * Copia la URL actual al portapapeles
 */
export const copyCurrentURL = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch (error) {
    console.error('Error copying URL:', error);
    throw error;
  }
};

/**
 * Obtiene el estado inicial desde la URL o valores por defecto
 */
export const getInitialState = (): AppState => {
  return deserializeState(window.location.search);
};
