import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  darkTheme,
  lightTheme,
  applyTheme,
  getSystemTheme,
  watchSystemTheme,
  createCustomTheme,
  buttonStyleToCSS,
  getCSSVariable,
  setCSSVariable,
} from './theme';
import type { ButtonStyle } from '../lib/platform-api';

describe('Theme System', () => {
  describe('Default Themes', () => {
    it('should have dark theme with correct properties', () => {
      expect(darkTheme.name).toBe('Dark');
      expect(darkTheme.mode).toBe('dark');
      expect(darkTheme.colors.primary).toBe('#646cff');
      expect(darkTheme.colors.bgPrimary).toBe('#242424');
      expect(darkTheme.colors.textPrimary).toBe('rgba(255, 255, 255, 0.9)');
    });

    it('should have light theme with correct properties', () => {
      expect(lightTheme.name).toBe('Light');
      expect(lightTheme.mode).toBe('light');
      expect(lightTheme.colors.primary).toBe('#646cff');
      expect(lightTheme.colors.bgPrimary).toBe('#ffffff');
      expect(lightTheme.colors.textPrimary).toBe('rgba(0, 0, 0, 0.9)');
    });

    it('should have consistent spacing values', () => {
      expect(darkTheme.spacing.xs).toBe('0.25rem');
      expect(darkTheme.spacing.sm).toBe('0.5rem');
      expect(darkTheme.spacing.md).toBe('0.75rem');
      expect(darkTheme.spacing.lg).toBe('1rem');
      expect(darkTheme.spacing.xl).toBe('1.5rem');
    });

    it('should have consistent radius values', () => {
      expect(darkTheme.radius.sm).toBe('4px');
      expect(darkTheme.radius.md).toBe('6px');
      expect(darkTheme.radius.lg).toBe('8px');
      expect(darkTheme.radius.xl).toBe('12px');
    });

    it('should have typography settings', () => {
      expect(darkTheme.typography.fontFamily).toContain('Inter');
      expect(darkTheme.typography.fontSize.base).toBe('1rem');
      expect(darkTheme.typography.fontWeight.normal).toBe(400);
      expect(darkTheme.typography.lineHeight.normal).toBe(1.5);
    });

    it('should have transition settings', () => {
      expect(darkTheme.transitions.fast).toBe('100ms');
      expect(darkTheme.transitions.normal).toBe('200ms');
      expect(darkTheme.transitions.timing).toBe('ease');
    });
  });

  describe('applyTheme', () => {
    beforeEach(() => {
      // Reset document root styles
      document.documentElement.style.cssText = '';
    });

    it('should apply theme colors to CSS variables', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBe('#646cff');
      expect(root.style.getPropertyValue('--color-success')).toBe('#22c55e');
      expect(root.style.getPropertyValue('--color-error')).toBe('#ef4444');
    });

    it('should apply spacing to CSS variables', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--spacing-xs')).toBe('0.25rem');
      expect(root.style.getPropertyValue('--spacing-lg')).toBe('1rem');
    });

    it('should apply radius to CSS variables', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--radius-sm')).toBe('4px');
      expect(root.style.getPropertyValue('--radius-lg')).toBe('8px');
    });

    it('should apply typography to CSS variables', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--font-family-base')).toContain('Inter');
      expect(root.style.getPropertyValue('--font-size-base')).toBe('1rem');
      expect(root.style.getPropertyValue('--font-weight-normal')).toBe('400');
    });

    it('should apply transitions to CSS variables', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--transition-fast')).toBe('100ms');
      expect(root.style.getPropertyValue('--transition-normal')).toBe('200ms');
    });
  });

  describe('getSystemTheme', () => {
    it('should return dark when system prefers dark', () => {
      // Mock matchMedia to return dark theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getSystemTheme()).toBe('dark');
    });

    it('should return light when system prefers light', () => {
      // Mock matchMedia to return light theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('watchSystemTheme', () => {
    it('should call callback when system theme changes', () => {
      const callback = vi.fn();
      const listeners: Array<(e: MediaQueryListEvent) => void> = [];
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event, handler) => {
            if (event === 'change') {
              listeners.push(handler);
            }
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const unwatch = watchSystemTheme(callback);
      
      // Simulate theme change
      listeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent);
      });
      
      expect(callback).toHaveBeenCalledWith('dark');
      
      unwatch();
    });
  });

  describe('createCustomTheme', () => {
    it('should merge custom colors with base theme', () => {
      const customTheme = createCustomTheme(darkTheme, {
        colors: {
          ...darkTheme.colors,
          primary: '#ff0000',
        },
      });

      expect(customTheme.colors.primary).toBe('#ff0000');
      expect(customTheme.colors.success).toBe(darkTheme.colors.success);
      expect(customTheme.spacing).toEqual(darkTheme.spacing);
    });

    it('should merge custom spacing with base theme', () => {
      const customTheme = createCustomTheme(darkTheme, {
        spacing: {
          ...darkTheme.spacing,
          xs: '0.5rem',
        },
      });

      expect(customTheme.spacing.xs).toBe('0.5rem');
      expect(customTheme.spacing.sm).toBe(darkTheme.spacing.sm);
    });

    it('should preserve base theme properties not overridden', () => {
      const customTheme = createCustomTheme(darkTheme, {
        name: 'Custom Dark',
      });

      expect(customTheme.name).toBe('Custom Dark');
      expect(customTheme.colors).toEqual(darkTheme.colors);
      expect(customTheme.spacing).toEqual(darkTheme.spacing);
    });
  });

  describe('buttonStyleToCSS', () => {
    it('should convert basic button style to CSS', () => {
      const style: ButtonStyle = {
        background_color: '#646cff',
        text_color: '#ffffff',
        border_color: '#3b82f6',
        border_width: 2,
        border_radius: 8,
      };

      const css = buttonStyleToCSS(style);

      expect(css['background-color']).toBe('#646cff');
      expect(css['color']).toBe('#ffffff');
      expect(css['border-color']).toBe('#3b82f6');
      expect(css['border-width']).toBe('2px');
      expect(css['border-radius']).toBe('8px');
    });

    it('should convert gradient style to CSS', () => {
      const style: ButtonStyle = {
        gradient: {
          enabled: true,
          direction: 135,
          colors: [
            { color: '#646cff', position: 0 },
            { color: '#3b82f6', position: 100 },
          ],
        },
      };

      const css = buttonStyleToCSS(style);

      expect(css['background']).toContain('linear-gradient');
      expect(css['background']).toContain('135deg');
      expect(css['background']).toContain('#646cff 0%');
      expect(css['background']).toContain('#3b82f6 100%');
    });

    it('should convert shadow style to CSS', () => {
      const style: ButtonStyle = {
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offset_x: 2,
          offset_y: 4,
          spread: 1,
        },
      };

      const css = buttonStyleToCSS(style);

      expect(css['box-shadow']).toBe('2px 4px 8px 1px rgba(0, 0, 0, 0.3)');
    });

    it('should convert animation style to CSS variables', () => {
      const style: ButtonStyle = {
        animation: {
          hover_scale: 1.1,
          hover_rotation: 5,
          click_scale: 0.9,
          transition_duration: 150,
        },
      };

      const css = buttonStyleToCSS(style);

      expect(css['--hover-scale']).toBe('1.1');
      expect(css['--hover-rotation']).toBe('5deg');
      expect(css['--click-scale']).toBe('0.9');
      expect(css['transition-duration']).toBe('150ms');
    });

    it('should handle empty style object', () => {
      const style: ButtonStyle = {};
      const css = buttonStyleToCSS(style);

      // Empty style should return empty CSS object
      expect(Object.keys(css).length).toBe(0);
    });
  });

  describe('getCSSVariable and setCSSVariable', () => {
    beforeEach(() => {
      document.documentElement.style.cssText = '';
    });

    it('should set and get CSS variable', () => {
      setCSSVariable('--test-color', '#ff0000');
      const value = getCSSVariable('--test-color');
      
      expect(value).toBe('#ff0000');
    });

    it('should return empty string for non-existent variable', () => {
      const value = getCSSVariable('--non-existent');
      
      expect(value).toBe('');
    });

    it('should update existing CSS variable', () => {
      setCSSVariable('--test-color', '#ff0000');
      setCSSVariable('--test-color', '#00ff00');
      const value = getCSSVariable('--test-color');
      
      expect(value).toBe('#00ff00');
    });
  });
});
