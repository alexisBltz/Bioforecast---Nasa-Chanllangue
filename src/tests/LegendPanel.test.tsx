/**
 * Tests para LegendPanel
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LegendPanel from '../components/LegendPanel';
import { useAppStore } from '../store/appStore';

vi.mock('../store/appStore');

describe('LegendPanel', () => {
  it('debe renderizar el panel de leyenda', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'THERMAL_ANOMALIES',
    });

    render(<LegendPanel />);
    
    expect(screen.getByText('Leyenda')).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay leyenda disponible', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'TRUE_COLOR',
    });

    render(<LegendPanel />);
    
    expect(screen.getByText(/no tiene leyenda gráfica/)).toBeInTheDocument();
  });
});
