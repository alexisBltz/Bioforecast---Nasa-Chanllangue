/**
 * Tests para OpacityControl
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OpacityControl from '../components/OpacityControl';
import { useAppStore } from '../store/appStore';

vi.mock('../store/appStore');

describe('OpacityControl', () => {
  it('debe renderizar el control de opacidad', () => {
    const mockSetOpacity = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      opacity: 0.8,
      setOpacity: mockSetOpacity,
    });

    render(<OpacityControl />);
    
    expect(screen.getByText(/Opacidad/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('debe mostrar el porcentaje correcto de opacidad', () => {
    const mockSetOpacity = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      opacity: 0.5,
      setOpacity: mockSetOpacity,
    });

    render(<OpacityControl />);
    
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
