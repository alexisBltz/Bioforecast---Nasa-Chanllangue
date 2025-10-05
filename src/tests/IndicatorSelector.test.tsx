/**
 * Tests para IndicatorSelector
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IndicatorSelector from '../components/IndicatorSelector';
import { useAppStore } from '../store/appStore';

vi.mock('../store/appStore');

describe('IndicatorSelector', () => {
  it('debe renderizar el selector de indicadores', () => {
    const mockSetIndicator = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'NDVI',
      setIndicator: mockSetIndicator,
    });

    render(<IndicatorSelector />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('debe llamar a setIndicator cuando se cambia el valor', () => {
    const mockSetIndicator = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'NDVI',
      setIndicator: mockSetIndicator,
    });

    render(<IndicatorSelector />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'THERMAL_ANOMALIES' } });
    
    expect(mockSetIndicator).toHaveBeenCalledWith('THERMAL_ANOMALIES');
  });
});
