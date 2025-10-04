/**
 * Global State Store usando Zustand
 */
import { create } from 'zustand';
import { getInitialState, updateURL } from '../utils/urlState';
import { INDICATORS } from '../services/gibsConfig';
import { generateRecentDates } from '../utils/dateUtils';

export interface AppStore {
  // Estado
  indicator: string;
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
}

export const useAppStore = create<AppStore>((set, get) => {
  const initialState = getInitialState();
  
  return {
    // Estado inicial
    indicator: initialState.indicator,
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
  };
});
