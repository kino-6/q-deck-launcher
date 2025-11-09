import { describe, it, expect } from 'vitest';
import { 
  THEME_PRESETS, 
  getThemesByCategory, 
  getThemeById, 
  getAllCategories,
  hexToRgba,
  lightenColor,
  darkenColor,
  getComplementaryColor,
  getAnalogousColors
} from './themes';

describe('Theme Presets', () => {
  it('contains expected number of themes', () => {
    expect(THEME_PRESETS.length).toBeGreaterThan(0);
  });

  it('all themes have required properties', () => {
    THEME_PRESETS.forEach(theme => {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('description');
      expect(theme).toHaveProperty('category');
      expect(theme).toHaveProperty('style');
      
      expect(typeof theme.id).toBe('string');
      expect(typeof theme.name).toBe('string');
      expect(typeof theme.description).toBe('string');
      expect(typeof theme.category).toBe('string');
      expect(typeof theme.style).toBe('object');
    });
  });

  it('all theme IDs are unique', () => {
    const ids = THEME_PRESETS.map(theme => theme.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all themes have valid style properties', () => {
    THEME_PRESETS.forEach(theme => {
      const style = theme.style;
      
      if (style.background_color) {
        expect(typeof style.background_color).toBe('string');
      }
      
      if (style.text_color) {
        expect(typeof style.text_color).toBe('string');
      }
      
      if (style.border_width) {
        expect(typeof style.border_width).toBe('number');
        expect(style.border_width).toBeGreaterThanOrEqual(0);
      }
      
      if (style.border_radius) {
        expect(typeof style.border_radius).toBe('number');
        expect(style.border_radius).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('Theme Utilities', () => {
  describe('getThemesByCategory', () => {
    it('returns themes for valid category', () => {
      const modernThemes = getThemesByCategory('modern');
      expect(modernThemes.length).toBeGreaterThan(0);
      modernThemes.forEach(theme => {
        expect(theme.category).toBe('modern');
      });
    });

    it('returns empty array for invalid category', () => {
      const invalidThemes = getThemesByCategory('invalid');
      expect(invalidThemes).toEqual([]);
    });
  });

  describe('getThemeById', () => {
    it('returns theme for valid ID', () => {
      const theme = getThemeById('modern-blue');
      expect(theme).toBeDefined();
      expect(theme?.id).toBe('modern-blue');
    });

    it('returns undefined for invalid ID', () => {
      const theme = getThemeById('invalid-id');
      expect(theme).toBeUndefined();
    });
  });

  describe('getAllCategories', () => {
    it('returns all unique categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it('includes expected categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('modern');
      expect(categories).toContain('neon');
      expect(categories).toContain('gaming');
      expect(categories).toContain('minimal');
      expect(categories).toContain('professional');
      expect(categories).toContain('classic');
    });
  });
});

describe('Color Utilities', () => {
  describe('hexToRgba', () => {
    it('converts hex to rgba with default alpha', () => {
      const result = hexToRgba('#ff0000');
      expect(result).toBe('rgba(255, 0, 0, 1)');
    });

    it('converts hex to rgba with custom alpha', () => {
      const result = hexToRgba('#00ff00', 0.5);
      expect(result).toBe('rgba(0, 255, 0, 0.5)');
    });


  });

  describe('lightenColor', () => {
    it('lightens a color by percentage', () => {
      const result = lightenColor('#000000', 50);
      expect(result).toBe('#7f7f7f');
    });

    it('handles edge case of white color', () => {
      const result = lightenColor('#ffffff', 50);
      expect(result).toBe('#ffffff');
    });

    it('handles zero percentage', () => {
      const result = lightenColor('#ff0000', 0);
      expect(result).toBe('#ff0000');
    });
  });

  describe('darkenColor', () => {
    it('darkens a color by percentage', () => {
      const result = darkenColor('#ffffff', 50);
      expect(result).toBe('#7f7f7f');
    });

    it('handles edge case of black color', () => {
      const result = darkenColor('#000000', 50);
      expect(result).toBe('#000000');
    });

    it('handles zero percentage', () => {
      const result = darkenColor('#ff0000', 0);
      expect(result).toBe('#ff0000');
    });
  });

  describe('getComplementaryColor', () => {
    it('returns complementary color', () => {
      const result = getComplementaryColor('#ff0000');
      expect(result).toBe('#00ffff');
    });

    it('handles white color', () => {
      const result = getComplementaryColor('#ffffff');
      expect(result).toBe('#000000');
    });

    it('handles black color', () => {
      const result = getComplementaryColor('#000000');
      expect(result).toBe('#ffffff');
    });
  });

  describe('getAnalogousColors', () => {
    it('returns array of analogous colors', () => {
      const result = getAnalogousColors('#ff0000');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      
      result.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('returns different colors for different inputs', () => {
      const result1 = getAnalogousColors('#ff0000');
      const result2 = getAnalogousColors('#00ff00');
      
      expect(result1).not.toEqual(result2);
    });
  });
});