/**
 * Global State Store usando Zustand
 */
import { create } from 'zustand';
import { getInitialState, updateURL } from '../utils/urlState';
import { INDICATORS } from '../services/gibsConfig';
import { generateRecentDates } from '../utils/dateUtils';

export interface LayerConfig {
  id: string;
  opacity: number;
  visible: boolean;
}

export interface AppStore {
  // Estado
  indicator: string; // Mantener para compatibilidad
  activeLayers: LayerConfig[]; // NUEVO: Soporte multi-capa
  date: string;
  availableDates: string[];
  mapCenter: [number, number];
  mapZoom: number;
  opacity: number;
  isPlaying: boolean;
  playSpeed: number;
  loading: boolean;
  error: string | null;
  
  // Acciones
  setIndicator: (indicator: string) => void;
  toggleLayer: (layerId: string) => void; // NUEVO
  setLayerOpacity: (layerId: string, opacity: number) => void; // NUEVO
  setDate: (date: string) => void;
  setMapView: (center: [number, number], zoom: number) => void;
  setOpacity: (opacity: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeFromURL: () => void;
  resetView: () => void;
  generateAvailableDates: () => void;
  activateBloomPreset: () => void; // NUEVO: Preset de floración
}

export const useAppStore = create<AppStore>((set, get) => {
  const initialState = getInitialState();
  
  return {
    // Estado inicial
    indicator: initialState.indicator,
    activeLayers: [{ id: initialState.indicator, opacity: initialState.opacity, visible: true }],
    date: initialState.date,
    availableDates: generateRecentDates(365), // Últimos 365 días por defecto
    mapCenter: [initialState.lat, initialState.lng],
    mapZoom: initialState.zoom,
    opacity: initialState.opacity,
    isPlaying: false,
    playSpeed: 1000, // ms entre frames
    loading: false,
    error: null,
    
    // Acciones
    setIndicator: (indicator: string) => {
      const indicatorData = INDICATORS[indicator];
      if (!indicatorData) return;

      let availableDates: string[] = [];
      if (indicatorData.timeResolution === 'static') {
        availableDates = [indicatorData.startDate || '2000-01-01'];
      } else {
        const days = indicatorData.timeResolution === '8-day' ? 90 : 365;
        availableDates = generateRecentDates(days);
      }

      const newDate = availableDates[0];

      set({ indicator, availableDates, date: newDate, loading: true, error: null });

      // Actualizar URL
      updateURL({
        indicator,
        date: newDate,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity: get().opacity,
      });
    },
    
    setDate: (date: string) => {
      set({ date, loading: true, error: null });
      
      updateURL({
        indicator: get().indicator,
        date,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity: get().opacity,
      });
    },
    
    setMapView: (center: [number, number], zoom: number) => {
      set({ mapCenter: center, mapZoom: zoom });
      
      updateURL({
        indicator: get().indicator,
        date: get().date,
        lat: center[0],
        lng: center[1],
        zoom,
        opacity: get().opacity,
      });
    },
    
    setOpacity: (opacity: number) => {
      set({ opacity });
      
      updateURL({
        indicator: get().indicator,
        date: get().date,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity,
      });
    },
    
    setIsPlaying: (isPlaying: boolean) => {
      set({ isPlaying });
    },
    
    setPlaySpeed: (speed: number) => {
      set({ playSpeed: speed });
    },
    
    setLoading: (loading: boolean) => {
      set({ loading });
    },
    
    setError: (error: string | null) => {
      set({ error });
    },
    
    initializeFromURL: () => {
      const state = getInitialState();
      set({
        indicator: state.indicator,
        date: state.date,
        mapCenter: [state.lat, state.lng],
        mapZoom: state.zoom,
        opacity: state.opacity,
      });
      get().generateAvailableDates();
    },
    
    resetView: () => {
      set({
        mapCenter: [0, 0],
        mapZoom: 3,
        opacity: 0.8,
      });
      
      updateURL({
        indicator: get().indicator,
        date: get().date,
        lat: 0,
        lng: 0,
        zoom: 3,
        opacity: 0.8,
      });
    },
    
    generateAvailableDates: () => {
      const indicatorData = INDICATORS[get().indicator];
      
      if (!indicatorData) {
        set({ availableDates: generateRecentDates(365) });
        return;
      }
      
      // Para indicadores estáticos, solo una fecha
      if (indicatorData.timeResolution === 'static') {
        set({ availableDates: [indicatorData.startDate || '2000-01-01'] });
        return;
      }
      
      // Para otros indicadores, generar fechas recientes
      const days = indicatorData.timeResolution === '8-day' ? 90 : 365;
      set({ availableDates: generateRecentDates(days) });
    },
    
    // NUEVAS ACCIONES PARA MULTI-CAPA
    toggleLayer: (layerId: string) => {
      const layers = get().activeLayers;
      const existingLayer = layers.find(l => l.id === layerId);
      
      if (existingLayer) {
        // Toggle visibilidad
        set({
          activeLayers: layers.map(l =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
          ),
        });
      } else {
        // Añadir nueva capa
        set({
          activeLayers: [...layers, { id: layerId, opacity: 0.8, visible: true }],
        });
      }
    },
    
    setLayerOpacity: (layerId: string, opacity: number) => {
      set({
        activeLayers: get().activeLayers.map(l =>
          l.id === layerId ? { ...l, opacity } : l
        ),
      });
    },
    
    activateBloomPreset: () => {
      // Preset de detección de floración
      const presetIndicator = 'NDVI';

      // Generar fechas disponibles para NDVI
      const indicatorData = INDICATORS[presetIndicator];
      let availableDates: string[] = [];
      if (indicatorData) {
        if (indicatorData.timeResolution === 'static') {
          availableDates = [indicatorData.startDate || '2000-01-01'];
        } else {
          const days = indicatorData.timeResolution === '8-day' ? 90 : 365;
          availableDates = generateRecentDates(days);
        }
      }

      const newDate = availableDates.length > 0 ? availableDates[0] : get().date;

      // Ordenar las capas para que las de contexto queden abajo y NDVI arriba con opacidad manejable
      set({
        activeLayers: [
          { id: 'CROPLANDS', opacity: 0.6, visible: true },
          { id: 'PRECIPITATION', opacity: 0.3, visible: true },
          { id: 'LST_DAY', opacity: 0.4, visible: true },
          { id: 'NDVI', opacity: 0.8, visible: true },
        ],
        indicator: presetIndicator, // Mantener para compatibilidad
        availableDates,
        date: newDate,
        loading: true,
      });

      // Actualizar la URL con el nuevo indicador/fecha
      updateURL({
        indicator: presetIndicator,
        date: newDate,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity: get().opacity,
      });

      // Quitar loading después de un breve retardo para forzar re-render y dar feedback
      setTimeout(() => {
        set({ loading: false });
      }, 900);
    },
  };
});
