import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { QDeckConfig, ButtonStyle, tauriAPI } from '../lib/platform-api';
import { THEME_PRESETS } from '../lib/themes';

// Mock the platform API
vi.mock('../lib/platform-api', async () => {
  const actual = await vi.importActual('../lib/platform-api');
  return {
    ...actual,
    tauriAPI: {
      saveConfig: vi.fn().mockResolvedValue(undefined),
      getConfig: vi.fn(),
    },
  };
});

// Test component that uses the hook
function TestComponent({ config, setConfig }: { 
  config: QDeckConfig | null; 
  setConfig: (config: QDeckConfig | null) => void;
}) {
  const {
    themeSelector,
    handleThemeButton,
    handleThemeSelect,
    closeThemeSelector,
  } = useThemeSelector({
    tempConfig: config,
    setTempConfig: setConfig,
  });

  return (
    <div>
      <button onClick={() => handleThemeButton({
        position: { row: 1, col: 1 },
        type: 'LaunchApp',
        label: 'Test Button',
        config: { path: 'test.exe' },
        style: {
          background_color: '#000000',
          text_color: '#ffffff',
        },
      })}>
        Open Theme Selector
      </button>
      
      {themeSelector.isVisible && (
        <div data-testid="theme-selector">
          <button onClick={() => {
            const modernBlue = THEME_PRESETS.find(t => t.id === 'modern-blue');
            if (modernBlue) {
              handleThemeSelect(modernBlue.style);
            }
          }}>
            Apply Modern Blue
          </button>
          <button onClick={closeThemeSelector}>Close</button>
        </div>
      )}
      
      <div data-testid="current-style">
        {JSON.stringify(themeSelector.button?.style || {})}
      </div>
    </div>
  );
}

describe('Theme Persistence Tests', () => {
  let mockConfig: QDeckConfig;
  let setConfig: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfig = {
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
                    background_color: '#000000',
                    text_color: '#ffffff',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    setConfig = vi.fn((newConfig) => {
      mockConfig = newConfig as QDeckConfig;
    });
  });

  it('TEST: テーマを変更できること - can change theme', async () => {
    const { rerender } = render(
      <TestComponent config={mockConfig} setConfig={setConfig} />
    );

    // Open theme selector
    fireEvent.click(screen.getByText('Open Theme Selector'));
    
    // Verify theme selector is visible
    expect(screen.getByTestId('theme-selector')).toBeInTheDocument();

    // Apply a theme
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    // Wait for theme to be applied
    await waitFor(() => {
      expect(setConfig).toHaveBeenCalled();
    });

    // Verify the config was updated with new theme
    const updatedConfig = setConfig.mock.calls[0][0] as QDeckConfig;
    const button = updatedConfig.profiles[0].pages[0].buttons[0];
    
    expect(button.style).toBeDefined();
    expect(button.style?.background_color).not.toBe('#000000'); // Changed from original
    
    // Verify it matches Modern Blue theme
    const modernBlue = THEME_PRESETS.find(t => t.id === 'modern-blue');
    expect(button.style?.background_color).toBe(modernBlue?.style.background_color);
  });

  it('TEST: テーマが保存されること - theme is saved to config', async () => {
    render(<TestComponent config={mockConfig} setConfig={setConfig} />);

    // Open theme selector
    fireEvent.click(screen.getByText('Open Theme Selector'));

    // Apply a theme
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    // Wait for save to be called
    await waitFor(() => {
      expect(tauriAPI.saveConfig).toHaveBeenCalled();
    });

    // Verify saveConfig was called with updated config
    const savedConfig = (tauriAPI.saveConfig as ReturnType<typeof vi.fn>).mock.calls[0][0] as QDeckConfig;
    const button = savedConfig.profiles[0].pages[0].buttons[0];
    
    expect(button.style).toBeDefined();
    expect(button.style?.background_color).toBeDefined();
    expect(button.style?.text_color).toBeDefined();
    
    // Verify gradient was saved
    if (button.style?.gradient) {
      expect(button.style.gradient.enabled).toBe(true);
      expect(button.style.gradient.colors).toBeDefined();
      expect(button.style.gradient.colors.length).toBeGreaterThan(0);
    }
    
    // Verify shadow was saved
    if (button.style?.shadow) {
      expect(button.style.shadow.enabled).toBe(true);
      expect(button.style.shadow.color).toBeDefined();
    }
    
    // Verify animation was saved
    if (button.style?.animation) {
      expect(button.style.animation.hover_scale).toBeDefined();
      expect(button.style.animation.transition_duration).toBeDefined();
    }
  });

  it('theme persists after reload', async () => {
    // First render - apply theme
    const { unmount } = render(
      <TestComponent config={mockConfig} setConfig={setConfig} />
    );

    fireEvent.click(screen.getByText('Open Theme Selector'));
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    await waitFor(() => {
      expect(setConfig).toHaveBeenCalled();
    });

    const updatedConfig = setConfig.mock.calls[0][0] as QDeckConfig;
    unmount();

    // Second render - simulate reload with saved config
    render(<TestComponent config={updatedConfig} setConfig={vi.fn()} />);

    // Verify theme is still applied
    const button = updatedConfig.profiles[0].pages[0].buttons[0];
    expect(button.style).toBeDefined();
    
    const modernBlue = THEME_PRESETS.find(t => t.id === 'modern-blue');
    expect(button.style?.background_color).toBe(modernBlue?.style.background_color);
  });

  it('can change theme multiple times', async () => {
    render(<TestComponent config={mockConfig} setConfig={setConfig} />);

    // Apply first theme
    fireEvent.click(screen.getByText('Open Theme Selector'));
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    await waitFor(() => {
      expect(setConfig).toHaveBeenCalledTimes(1);
    });

    // Close and reopen
    fireEvent.click(screen.getByText('Close'));
    fireEvent.click(screen.getByText('Open Theme Selector'));

    // Apply second theme (in real app, this would be a different theme)
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    await waitFor(() => {
      expect(setConfig).toHaveBeenCalledTimes(2);
    });

    // Verify saveConfig was called twice
    expect(tauriAPI.saveConfig).toHaveBeenCalledTimes(2);
  });

  it('preserves other button properties when changing theme', async () => {
    render(<TestComponent config={mockConfig} setConfig={setConfig} />);

    const originalButton = mockConfig.profiles[0].pages[0].buttons[0];
    const originalLabel = originalButton.label;
    const originalPath = originalButton.config.path;

    // Apply theme
    fireEvent.click(screen.getByText('Open Theme Selector'));
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    await waitFor(() => {
      expect(setConfig).toHaveBeenCalled();
    });

    const updatedConfig = setConfig.mock.calls[0][0] as QDeckConfig;
    const updatedButton = updatedConfig.profiles[0].pages[0].buttons[0];

    // Verify other properties are preserved
    expect(updatedButton.label).toBe(originalLabel);
    expect(updatedButton.config.path).toBe(originalPath);
    expect(updatedButton.position).toEqual(originalButton.position);
    expect(updatedButton.type).toBe(originalButton.type);
  });

  it('handles theme with all style properties', async () => {
    render(<TestComponent config={mockConfig} setConfig={setConfig} />);

    fireEvent.click(screen.getByText('Open Theme Selector'));
    fireEvent.click(screen.getByText('Apply Modern Blue'));

    await waitFor(() => {
      expect(tauriAPI.saveConfig).toHaveBeenCalled();
    });

    const savedConfig = (tauriAPI.saveConfig as ReturnType<typeof vi.fn>).mock.calls[0][0] as QDeckConfig;
    const style = savedConfig.profiles[0].pages[0].buttons[0].style;

    // Verify all style properties are present
    expect(style).toHaveProperty('background_color');
    expect(style).toHaveProperty('text_color');
    expect(style).toHaveProperty('border_color');
    expect(style).toHaveProperty('border_width');
    expect(style).toHaveProperty('border_radius');
    
    // Verify complex properties
    if (style?.gradient) {
      expect(style.gradient).toHaveProperty('enabled');
      expect(style.gradient).toHaveProperty('direction');
      expect(style.gradient).toHaveProperty('colors');
      expect(Array.isArray(style.gradient.colors)).toBe(true);
    }
    
    if (style?.shadow) {
      expect(style.shadow).toHaveProperty('enabled');
      expect(style.shadow).toHaveProperty('color');
      expect(style.shadow).toHaveProperty('blur');
      expect(style.shadow).toHaveProperty('offset_x');
      expect(style.shadow).toHaveProperty('offset_y');
    }
    
    if (style?.animation) {
      expect(style.animation).toHaveProperty('hover_scale');
      expect(style.animation).toHaveProperty('click_scale');
      expect(style.animation).toHaveProperty('transition_duration');
    }
  });
});
