/**
 * Tests para MetadataCard
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetadataCard from '../components/MetadataCard';
import { useAppStore } from '../store/appStore';

vi.mock('../store/appStore');

describe('MetadataCard', () => {
  it('debe renderizar la metadata del indicador', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'NDVI',
      loading: false,
    });

    render(<MetadataCard />);
    
    expect(screen.getByText('Información de la Capa')).toBeInTheDocument();
    expect(screen.getByText('Capa GIBS:')).toBeInTheDocument();
  });

  it('debe mostrar el indicador de carga cuando loading es true', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      indicator: 'NDVI',
      loading: true,
    });

    render(<MetadataCard />);
    
    expect(screen.getByText(/Cargando capa/)).toBeInTheDocument();
  });
});
