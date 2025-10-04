/**
 * Tests para urlState utilities
 */
import { describe, it, expect } from 'vitest';
import { serializeState, deserializeState } from '../utils/urlState';

describe('urlState', () => {
  describe('serializeState', () => {
    it('debe serializar el estado a query params', () => {
      const state = {
        indicator: 'TRUE_COLOR',
        date: '2024-10-04',
        lat: 40.7128,
        lng: -74.006,
        zoom: 8,
        opacity: 0.8,
      };

      const queryString = serializeState(state);
      
      expect(queryString).toContain('indicator=TRUE_COLOR');
      expect(queryString).toContain('date=2024-10-04');
      expect(queryString).toContain('zoom=8');
    });

    it('debe manejar estado parcial', () => {
      const state = {
        indicator: 'CROPLANDS',
      };

      const queryString = serializeState(state);
      
      expect(queryString).toContain('indicator=CROPLANDS');
      expect(queryString).not.toContain('date=');
    });
  });

  describe('deserializeState', () => {
    it('debe deserializar query params a estado', () => {
      const queryString = 'indicator=THERMAL_ANOMALIES&date=2024-10-04&lat=40.7128&lng=-74.0060&zoom=10&opacity=0.70';
      
      const state = deserializeState(queryString);
      
      expect(state.indicator).toBe('THERMAL_ANOMALIES');
      expect(state.date).toBe('2024-10-04');
      expect(state.lat).toBe(40.7128);
      expect(state.lng).toBe(-74.006);
      expect(state.zoom).toBe(10);
      expect(state.opacity).toBe(0.7);
    });

    it('debe usar valores por defecto cuando faltan parámetros', () => {
      const queryString = '';
      
      const state = deserializeState(queryString);
      
      expect(state.indicator).toBe('TRUE_COLOR');
      expect(state.zoom).toBe(3);
      expect(state.opacity).toBe(0.8);
    });
  });
});
