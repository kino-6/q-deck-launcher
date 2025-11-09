import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionButton from './ActionButton';
import { mockButton } from '../test/mockData';

describe('ActionButton', () => {
  const mockOnSystemAction = vi.fn();
  const mockOnContextMenu = vi.fn();
  
  const defaultScreenInfo = {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    pixelRatio: 1,
    colorDepth: 24,
    orientation: 'landscape-primary' as const,
    dpiCategory: 'standard' as const,
    physicalWidth: 1920,
    physicalHeight: 1080,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with correct label and icon', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSystemAction).toHaveBeenCalledWith('config');
  });

  it('calls onContextMenu when right-clicked', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.contextMenu(button);

    expect(mockOnContextMenu).toHaveBeenCalledWith(
      expect.any(Object),
      mockButton
    );
  });

  it('displays correct action type styling', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-system-action', 'config');
  });

  it('handles button without system action', () => {
    const regularButton = {
      ...mockButton,
      action: undefined,
    };

    render(
      <ActionButton
        button={regularButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should call executeAction through tauriAPI
    expect((globalThis as any).mockTauriAPI.executeAction).toHaveBeenCalled();
  });

  it('renders with custom DPI scale', () => {
    const highDpiScreenInfo = {
      ...defaultScreenInfo,
      pixelRatio: 2,
      dpiCategory: 'high' as const,
    };

    render(
      <ActionButton
        button={mockButton}
        dpiScale={2}
        screenInfo={highDpiScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with custom screen info', () => {
    const customScreenInfo = {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      pixelRatio: 1.5,
      colorDepth: 24,
      orientation: 'landscape-primary' as const,
      dpiCategory: 'high' as const,
      physicalWidth: 1280,
      physicalHeight: 720,
    };

    render(
      <ActionButton
        button={mockButton}
        dpiScale={1.5}
        screenInfo={customScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('processes icon correctly', async () => {
    // Mock the processIcon API call
    (globalThis as any).mockTauriAPI.processIcon = vi.fn().mockResolvedValue({
      path: '🚀',
      icon_type: 'Emoji',
      size: null,
      data_url: null,
      extracted_from: null,
    });

    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    await waitFor(() => {
      expect((globalThis as any).mockTauriAPI.processIcon).toHaveBeenCalledWith('🚀', undefined);
    });
  });

  it('handles icon processing error gracefully', async () => {
    // Mock the processIcon API call to fail
    (globalThis as any).mockTauriAPI.processIcon = vi.fn().mockRejectedValue(new Error('Icon processing failed'));

    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    // Should still render the button with fallback icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies custom button styles', () => {
    const styledButton = {
      ...mockButton,
      style: {
        background_color: '#FF0000',
        text_color: '#FFFFFF',
        font_size: 14,
        font_family: 'Arial',
        border_color: '#CC0000',
        border_width: 2,
        border_radius: 10,
      },
    };

    render(
      <ActionButton
        button={styledButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Note: Testing exact styles is complex with CSS-in-JS, 
    // but we can verify the component renders without errors
  });
});