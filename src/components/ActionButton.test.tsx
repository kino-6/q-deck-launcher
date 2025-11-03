import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from './ActionButton';
import { mockButton } from '../test/mockData';

describe('ActionButton', () => {
  const mockOnSystemAction = vi.fn();
  const mockOnContextMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with correct label and icon', () => {
    render(
      <ActionButton
        button={mockButton}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('LaunchApp')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    render(
      <ActionButton
        button={mockButton}
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
      action: null,
    };

    render(
      <ActionButton
        button={regularButton}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should call executeAction through tauriAPI
    expect(global.mockTauriAPI.executeAction).toHaveBeenCalled();
  });

  it('renders with custom DPI scale', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={2}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});