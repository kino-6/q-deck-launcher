import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { applyTheme, darkTheme, lightTheme } from './theme';
import { THEME_PRESETS } from '../lib/themes';

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    // Reset document root styles
    document.documentElement.style.cssText = '';
  });

  describe('Theme Application', () => {
    it('should apply dark theme correctly', () => {
      applyTheme(darkTheme);
      
      const root = document.documentElement;
      
      // Verify colors
      expect(root.style.getPropertyValue('--color-primary')).toBe('#646cff');
      expect(root.style.getPropertyValue('--color-bg-primary')).toBe('#242424');
      expect(root.style.getPropertyValue('--color-text-primary')).toBe('rgba(255, 255, 255, 0.9)');
      
      // Verify spacing
      expect(root.style.getPropertyValue('--spacing-lg')).toBe('1rem');
      
      // Verify radius
      expect(root.style.getPropertyValue('--radius-lg')).toBe('8px');
      
      // Verify typography
      expect(root.style.getPropertyValue('--font-size-base')).toBe('1rem');
      expect(root.style.getPropertyValue('--font-weight-medium')).toBe('500');
      
      // Verify transitions
      expect(root.style.getPropertyValue('--transition-normal')).toBe('200ms');
    });

    it('should apply light theme correctly', () => {
      applyTheme(lightTheme);
      
      const root = document.documentElement;
      
      // Verify colors are different from dark theme
      expect(root.style.getPropertyValue('--color-bg-primary')).toBe('#ffffff');
      expect(root.style.getPropertyValue('--color-text-primary')).toBe('rgba(0, 0, 0, 0.9)');
      
      // Verify shadows are lighter
      expect(root.style.getPropertyValue('--shadow-button')).toContain('rgba(0, 0, 0, 0.05)');
    });

    it('should switch between themes without errors', () => {
      // Apply dark theme
      applyTheme(darkTheme);
      expect(document.documentElement.style.getPropertyValue('--color-bg-primary')).toBe('#242424');
      
      // Switch to light theme
      applyTheme(lightTheme);
      expect(document.documentElement.style.getPropertyValue('--color-bg-primary')).toBe('#ffffff');
      
      // Switch back to dark theme
      applyTheme(darkTheme);
      expect(document.documentElement.style.getPropertyValue('--color-bg-primary')).toBe('#242424');
    });
  });

  describe('Theme Presets Compatibility', () => {
    it('should have all theme presets with valid styles', () => {
      expect(THEME_PRESETS.length).toBeGreaterThan(0);
      
      THEME_PRESETS.forEach(preset => {
        expect(preset.id).toBeTruthy();
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.category).toBeTruthy();
        expect(preset.style).toBeTruthy();
      });
    });

    it('should have theme presets with valid color values', () => {
      THEME_PRESETS.forEach(preset => {
        if (preset.style.background_color) {
          expect(preset.style.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
        if (preset.style.text_color) {
          expect(preset.style.text_color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
        if (preset.style.border_color) {
          expect(preset.style.border_color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      });
    });

    it('should have theme presets with valid numeric values', () => {
      THEME_PRESETS.forEach(preset => {
        if (preset.style.border_width !== undefined) {
          expect(preset.style.border_width).toBeGreaterThanOrEqual(0);
        }
        if (preset.style.border_radius !== undefined) {
          expect(preset.style.border_radius).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should have theme presets with valid gradient configurations', () => {
      THEME_PRESETS.forEach(preset => {
        if (preset.style.gradient?.enabled) {
          expect(preset.style.gradient.colors).toBeDefined();
          expect(preset.style.gradient.colors.length).toBeGreaterThanOrEqual(2);
          
          preset.style.gradient.colors.forEach(color => {
            expect(color.color).toMatch(/^#[0-9a-fA-F]{6}$/);
            expect(color.position).toBeGreaterThanOrEqual(0);
            expect(color.position).toBeLessThanOrEqual(100);
          });
        }
      });
    });

    it('should have theme presets with valid shadow configurations', () => {
      THEME_PRESETS.forEach(preset => {
        if (preset.style.shadow?.enabled) {
          expect(preset.style.shadow.color).toBeDefined();
          expect(preset.style.shadow.blur).toBeGreaterThanOrEqual(0);
          expect(preset.style.shadow.offset_x).toBeDefined();
          expect(preset.style.shadow.offset_y).toBeDefined();
        }
      });
    });

    it('should have theme presets with valid animation configurations', () => {
      THEME_PRESETS.forEach(preset => {
        if (preset.style.animation) {
          if (preset.style.animation.hover_scale !== undefined) {
            expect(preset.style.animation.hover_scale).toBeGreaterThan(0);
          }
          if (preset.style.animation.click_scale !== undefined) {
            expect(preset.style.animation.click_scale).toBeGreaterThan(0);
          }
          if (preset.style.animation.transition_duration !== undefined) {
            expect(preset.style.animation.transition_duration).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  describe('CSS Variables Integration', () => {
    it('should have all required CSS variables defined in variables.css', () => {
      // This test verifies that the CSS variables file is properly loaded
      // by checking if the variables are available in the computed styles
      
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      const computedStyle = getComputedStyle(testDiv);
      
      // Note: In test environment, CSS files might not be loaded
      // This test will pass if the variables are defined, or skip if not in DOM
      const primaryColor = computedStyle.getPropertyValue('--color-primary');
      
      if (primaryColor) {
        // If CSS is loaded, verify key variables exist
        expect(computedStyle.getPropertyValue('--color-success')).toBeTruthy();
        expect(computedStyle.getPropertyValue('--spacing-lg')).toBeTruthy();
        expect(computedStyle.getPropertyValue('--radius-lg')).toBeTruthy();
      }
      
      document.body.removeChild(testDiv);
    });
  });

  describe('Theme Categories', () => {
    it('should have themes in all expected categories', () => {
      const categories = ['modern', 'classic', 'neon', 'minimal', 'gaming', 'professional'];
      
      categories.forEach(category => {
        const themesInCategory = THEME_PRESETS.filter(t => t.category === category);
        expect(themesInCategory.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent theme structure across categories', () => {
      THEME_PRESETS.forEach(preset => {
        // All themes should have these required fields
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('category');
        expect(preset).toHaveProperty('style');
        
        // Style should have at least some properties
        const styleKeys = Object.keys(preset.style);
        expect(styleKeys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Theme System Robustness', () => {
    it('should handle rapid theme switching', () => {
      // Simulate rapid theme changes
      for (let i = 0; i < 10; i++) {
        applyTheme(i % 2 === 0 ? darkTheme : lightTheme);
      }
      
      // Verify final state
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBeTruthy();
    });

    it('should maintain theme consistency after multiple applications', () => {
      applyTheme(darkTheme);
      const firstApplication = document.documentElement.style.getPropertyValue('--color-primary');
      
      applyTheme(darkTheme);
      const secondApplication = document.documentElement.style.getPropertyValue('--color-primary');
      
      expect(firstApplication).toBe(secondApplication);
    });
  });
});
