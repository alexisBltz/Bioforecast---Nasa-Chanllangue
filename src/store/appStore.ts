/**
 * Global State Store usando Zustand
 */
import { create } from 'zustand';
import { getInitialState, updateURL } from '../utils/urlState';
import { INDICATORS } from '../services/gibsConfig';
import { generateRecentDates, formatDate } from '../utils/dateUtils';

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
  dateInterval: number; // Intervalo de días entre fechas (1-30)
  
  // Acciones
  setIndicator: (indicator: string) => void;
  setDate: (date: string) => void;
  setMapView: (center: [number, number], zoom: number) => void;
  setOpacity: (opacity: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaySpeed: (speed: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateInterval: (interval: number) => void;
  goToToday: () => void;
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
    dateInterval: 1, // Intervalo por defecto de 1 día
    
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
    
    setDateInterval: (interval: number) => {
      // Validar que el intervalo esté entre 1 y 30
      const validInterval = Math.max(1, Math.min(30, interval));
      const indicatorData = INDICATORS[get().indicator];
      
      // Generar nuevas fechas disponibles con el nuevo intervalo
      let availableDates: string[] = [];
      if (indicatorData?.timeResolution === 'static') {
        availableDates = [indicatorData.startDate || '2000-01-01'];
      } else {
        const days = indicatorData?.timeResolution === '8-day' ? 90 : 365;
        availableDates = generateRecentDates(days, validInterval);
      }
      
      // Mantener la fecha actual o la más cercana
      const currentDate = get().date;
      const closestDate = availableDates.reduce((closest, date) => {
        const currentDiff = Math.abs(new Date(date).getTime() - new Date(currentDate).getTime());
        const closestDiff = Math.abs(new Date(closest).getTime() - new Date(currentDate).getTime());
        return currentDiff < closestDiff ? date : closest;
      }, availableDates[0]);
      
      set({ 
        dateInterval: validInterval, 
        availableDates,
        date: closestDate,
        loading: true 
      });
      
      updateURL({
        indicator: get().indicator,
        date: closestDate,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity: get().opacity,
      });
    },
    
    goToToday: () => {
      const today = formatDate(new Date());
      const availableDates = get().availableDates;
      
      // Encontrar la fecha más cercana a hoy
      const closestDate = availableDates.reduce((closest, date) => {
        const currentDiff = Math.abs(new Date(date).getTime() - new Date(today).getTime());
        const closestDiff = Math.abs(new Date(closest).getTime() - new Date(today).getTime());
        return currentDiff < closestDiff ? date : closest;
      }, availableDates[availableDates.length - 1] || today);
      
      set({ date: closestDate, loading: true });
      
      updateURL({
        indicator: get().indicator,
        date: closestDate,
        lat: get().mapCenter[0],
        lng: get().mapCenter[1],
        zoom: get().mapZoom,
        opacity: get().opacity,
      });
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
      const interval = get().dateInterval;
      
      if (!indicatorData) {
        set({ availableDates: generateRecentDates(365, interval) });
        return;
      }
      
      // Para indicadores estáticos, solo una fecha
      if (indicatorData.timeResolution === 'static') {
        set({ availableDates: [indicatorData.startDate || '2000-01-01'] });
        return;
      }
      
      // Para otros indicadores, generar fechas recientes con el intervalo actual
      const days = indicatorData.timeResolution === '8-day' ? 90 : 365;
      set({ availableDates: generateRecentDates(days, interval) });
    },
  };
});
