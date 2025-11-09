import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from './ThemeSelector';
import { ButtonStyle } from '../lib/platform-api';

describe('ThemeSelector', () => {
  const mockOnThemeSelect = vi.fn();
  const mockOnClose = vi.fn();

  const mockCurrentStyle: ButtonStyle = {
    background_color: '#1e40af',
    text_color: '#ffffff',
    border_color: '#3b82f6',
    border_width: 1,
    border_radius: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Choose Button Theme')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search themes...')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(
      <ThemeSelector
        isVisible={false}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Choose Button Theme')).not.toBeInTheDocument();
  });

  it('renders category tabs', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Modern')).toBeInTheDocument();
    expect(screen.getByText('Neon')).toBeInTheDocument();
    expect(screen.getByText('Gaming')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
  });

  it('renders theme cards', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Modern themes should be visible by default
    expect(screen.getByText('Modern Blue')).toBeInTheDocument();
    expect(screen.getByText('Modern Green')).toBeInTheDocument();
  });

  it('filters themes by search term', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search themes...');
    fireEvent.change(searchInput, { target: { value: 'blue' } });

    expect(screen.getByText('Modern Blue')).toBeInTheDocument();
    expect(screen.queryByText('Modern Green')).not.toBeInTheDocument();
  });

  it('switches categories when tab is clicked', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Neon'));
    
    expect(screen.getByText('Neon Cyan')).toBeInTheDocument();
    expect(screen.getByText('Neon Pink')).toBeInTheDocument();
  });

  it('calls onThemeSelect when Apply Theme button is clicked', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    expect(mockOnThemeSelect).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const overlay = screen.getByText('Choose Button Theme').closest('.theme-selector-overlay');
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows no themes message when search returns no results', () => {
    render(
      <ThemeSelector
        isVisible={true}
        currentStyle={mockCurrentStyle}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search themes...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No themes found matching your search.')).toBeInTheDocument();
  });
});