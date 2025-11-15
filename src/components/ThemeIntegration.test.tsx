import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeSelector } from './ThemeSelector';
import { ButtonStyle, QDeckConfig } from '../lib/platform-api';
import { THEME_PRESETS } from '../lib/themes';

// Mock the platform API
vi.mock('../lib/platform-api', async () => {
  const actual = await vi.importActual('../lib/platform-api');
  return {
    ...actual,
    tauriAPI: {
      saveConfig: vi.fn().mockResolvedValue(undefined),
      getConfig: vi.fn().mockResolvedValue({
        profiles: [
          {
            name: 'Test Profile',
            pages: [
              {
                name: 'Test Page',
                rows: 3,
                cols: 3,
                buttons: [
                  {
                    position: { row: 1, col: 1 },
                    type: 'LaunchApp',
                    label: 'Test Button',
                    config: { path: 'test.exe' },
                    style: {
                      background_color: '#1e40af',
                      text_color: '#ffffff',
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  };
});

describe('Theme Selection Integration', () => {
  const mockOnThemeSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies theme with all style properties', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Click on a theme's Apply button
    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    // Verify the theme style was passed correctly
    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    expect(appliedStyle).toHaveProperty('background_color');
    expect(appliedStyle).toHaveProperty('text_color');
    expect(appliedStyle).toHaveProperty('border_color');
  });

  it('applies theme with gradient properties', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Find a theme with gradient
    const modernBlueTheme = THEME_PRESETS.find(t => t.id === 'modern-blue');
    expect(modernBlueTheme).toBeDefined();
    expect(modernBlueTheme?.style.gradient?.enabled).toBe(true);

    // Apply the theme
    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    if (appliedStyle.gradient?.enabled) {
      expect(appliedStyle.gradient.colors).toBeDefined();
      expect(appliedStyle.gradient.colors.length).toBeGreaterThan(0);
    }
  });

  it('applies theme with shadow properties', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Find a theme with shadow
    const neonCyanTheme = THEME_PRESETS.find(t => t.id === 'neon-cyan');
    expect(neonCyanTheme).toBeDefined();
    expect(neonCyanTheme?.style.shadow?.enabled).toBe(true);

    // Switch to Neon category
    fireEvent.click(screen.getByText('Neon'));

    // Apply the theme
    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    if (appliedStyle.shadow?.enabled) {
      expect(appliedStyle.shadow.color).toBeDefined();
      expect(appliedStyle.shadow.blur).toBeDefined();
    }
  });

  it('applies theme with animation properties', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Apply a theme
    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    if (appliedStyle.animation) {
      expect(appliedStyle.animation.hover_scale).toBeDefined();
      expect(appliedStyle.animation.transition_duration).toBeDefined();
    }
  });

  it('filters themes correctly by category', () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Default category is 'modern'
    expect(screen.getByText('Modern Blue')).toBeInTheDocument();
    expect(screen.getByText('Modern Green')).toBeInTheDocument();

    // Switch to Gaming category
    fireEvent.click(screen.getByText('Gaming'));
    expect(screen.getByText('Gaming Red')).toBeInTheDocument();
    expect(screen.getByText('Gaming Purple')).toBeInTheDocument();

    // Switch to Minimal category
    fireEvent.click(screen.getByText('Minimal'));
    expect(screen.getByText('Minimal Light')).toBeInTheDocument();
    expect(screen.getByText('Minimal Dark')).toBeInTheDocument();
  });

  it('searches themes across all categories', () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search themes...');
    
    // Search for 'neon'
    fireEvent.change(searchInput, { target: { value: 'neon' } });
    expect(screen.queryByText('Modern Blue')).not.toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Modern Blue')).toBeInTheDocument();
  });

  it('displays theme preview with correct styling', () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Find theme preview buttons
    const previewButtons = screen.getAllByText('Sample');
    expect(previewButtons.length).toBeGreaterThan(0);

    // Verify preview button has the theme-preview-button class
    const firstPreview = previewButtons[0].closest('.theme-preview-button');
    expect(firstPreview).toBeInTheDocument();
  });

  it('closes modal after applying theme', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles theme with minimal properties', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Switch to Minimal category
    fireEvent.click(screen.getByText('Minimal'));

    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    expect(appliedStyle.background_color).toBeDefined();
    expect(appliedStyle.text_color).toBeDefined();
  });

  it('handles classic theme without gradients', async () => {
    render(
      <ThemeSelector
        isVisible={true}
        onThemeSelect={mockOnThemeSelect}
        onClose={mockOnClose}
      />
    );

    // Switch to Classic category
    fireEvent.click(screen.getByText('Classic'));

    const applyButtons = screen.getAllByText('Apply Theme');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(mockOnThemeSelect).toHaveBeenCalled();
    });

    const appliedStyle = mockOnThemeSelect.mock.calls[0][0] as ButtonStyle;
    expect(appliedStyle.background_color).toBeDefined();
    // Classic theme might not have gradient
    if (appliedStyle.gradient) {
      expect(appliedStyle.gradient.enabled).toBeDefined();
    }
  });
});
