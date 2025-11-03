import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSettings={mockOnSettings}
        buttonLabel="Test Button"
      />
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <ContextMenu
        isVisible={false}
        x={100}
        y={200}
        onClose={mockOnClose}
        onSettings={mockOnSettings}
      />
    );

    expect(screen.queryByText('設定')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSettings={mockOnSettings}
      />
    );

    fireEvent.click(screen.getByText('編集'));
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSettings={mockOnSettings}
      />
    );

    fireEvent.click(screen.getByText('削除'));
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSettings when settings button is clicked', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onSettings={mockOnSettings}
      />
    );

    fireEvent.click(screen.getByText('設定'));
    expect(mockOnSettings).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders without edit and delete buttons when not provided', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onSettings={mockOnSettings}
      />
    );

    expect(screen.queryByText('編集')).not.toBeInTheDocument();
    expect(screen.queryByText('削除')).not.toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('positions correctly', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={150}
        y={250}
        onClose={mockOnClose}
        onSettings={mockOnSettings}
      />
    );

    const menu = screen.getByText('設定').closest('.context-menu');
    expect(menu).toHaveStyle({
      left: '150px',
      top: '250px',
    });
  });
});