import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './ContextMenu';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnTheme = vi.fn();
  const mockOnAddButton = vi.fn();
  const mockOnSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button menu when visible', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTheme={mockOnTheme}
        onSettings={mockOnSettings}
        buttonLabel="Test Button"
        menuType="button"
      />
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('テーマ変更')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('グリッド設定')).toBeInTheDocument();
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

  it('renders empty cell menu when visible', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onAddButton={mockOnAddButton}
        onSettings={mockOnSettings}
        menuType="empty-cell"
        gridPosition={{ row: 1, col: 2 }}
      />
    );

    expect(screen.getByText('セル (1, 2)')).toBeInTheDocument();
    expect(screen.getByText('ボタンを追加')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('renders grid background menu when visible', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onSettings={mockOnSettings}
        menuType="grid-background"
      />
    );

    expect(screen.getByText('ボタンを追加')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
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
        onTheme={mockOnTheme}
        onSettings={mockOnSettings}
        menuType="button"
      />
    );

    fireEvent.click(screen.getByText('編集'));
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onTheme when theme button is clicked', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onTheme={mockOnTheme}
        onSettings={mockOnSettings}
        menuType="button"
      />
    );

    fireEvent.click(screen.getByText('テーマ変更'));
    expect(mockOnTheme).toHaveBeenCalled();
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
        onTheme={mockOnTheme}
        onSettings={mockOnSettings}
        menuType="button"
      />
    );

    fireEvent.click(screen.getByText('削除'));
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onAddButton when add button is clicked in empty cell menu', () => {
    render(
      <ContextMenu
        isVisible={true}
        x={100}
        y={200}
        onClose={mockOnClose}
        onAddButton={mockOnAddButton}
        onSettings={mockOnSettings}
        menuType="empty-cell"
        gridPosition={{ row: 1, col: 2 }}
      />
    );

    fireEvent.click(screen.getByText('ボタンを追加'));
    expect(mockOnAddButton).toHaveBeenCalled();
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
        menuType="grid-background"
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
        menuType="grid-background"
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

    const menu = screen.getByText('グリッド設定').closest('.context-menu');
    expect(menu).toHaveStyle({
      left: '150px',
      top: '250px',
    });
  });
});