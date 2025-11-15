/**
 * Q-Deck Theme System
 * Centralized theme management with CSS variable integration
 */

import { ButtonStyle } from '../lib/platform-api';

// ===== Theme Types =====

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  borderPrimary: string;
  borderSecondary: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  button: string;
  buttonHover: string;
  modal: string;
  grid: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeTransitions {
  fast: string;
  base: string;
  normal: string;
  slow: string;
  slower: string;
  timing: string;
  timingIn: string;
  timingOut: string;
  timingInOut: string;
}

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  transitions: ThemeTransitions;
}

// ===== Default Themes =====

export const darkTheme: Theme = {
  name: 'Dark',
  mode: 'dark',
  colors: {
    primary: '#646cff',
    primaryLight: 'rgba(100, 108, 255, 0.8)',
    primaryDark: 'rgba(100, 108, 255, 0.6)',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    bgPrimary: '#242424',
    bgSecondary: 'rgba(30, 30, 30, 0.95)',
    textPrimary: 'rgba(255, 255, 255, 0.9)',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.15)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    button: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    buttonHover: '0 4px 16px rgba(100, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    modal: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    grid: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontFamilyMono: "'Courier New', monospace",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  transitions: {
    fast: '100ms',
    base: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    timing: 'ease',
    timingIn: 'ease-in',
    timingOut: 'ease-out',
    timingInOut: 'ease-in-out',
  },
};

export const lightTheme: Theme = {
  ...darkTheme,
  name: 'Light',
  mode: 'light',
  colors: {
    ...darkTheme.colors,
    bgPrimary: '#ffffff',
    bgSecondary: 'rgba(255, 255, 255, 0.95)',
    textPrimary: 'rgba(0, 0, 0, 0.9)',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    borderPrimary: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.15)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
    button: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    buttonHover: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    modal: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    grid: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
};

// ===== Theme Utilities =====

/**
 * Apply theme to document root
 */
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  
  // Apply colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-info', theme.colors.info);
  root.style.setProperty('--color-bg-primary', theme.colors.bgPrimary);
  root.style.setProperty('--color-bg-secondary', theme.colors.bgSecondary);
  root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border-primary', theme.colors.borderPrimary);
  root.style.setProperty('--color-border-secondary', theme.colors.borderSecondary);
  
  // Apply spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Apply radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--shadow-${cssKey}`, value);
  });
  
  // Apply typography
  root.style.setProperty('--font-family-base', theme.typography.fontFamily);
  root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value.toString());
  });
  
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, value.toString());
  });
  
  // Apply transitions
  Object.entries(theme.transitions).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--transition-${cssKey}`, value);
  });
};

/**
 * Get current system theme preference
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Watch for system theme changes
 */
export const watchSystemTheme = (callback: (theme: 'light' | 'dark') => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};

/**
 * Create a custom theme by merging with base theme
 */
export const createCustomTheme = (
  baseTheme: Theme,
  overrides: Partial<Theme>
): Theme => {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...(overrides.colors || {}),
    },
    spacing: {
      ...baseTheme.spacing,
      ...(overrides.spacing || {}),
    },
    radius: {
      ...baseTheme.radius,
      ...(overrides.radius || {}),
    },
    shadows: {
      ...baseTheme.shadows,
      ...(overrides.shadows || {}),
    },
    typography: {
      ...baseTheme.typography,
      ...(overrides.typography || {}),
      fontSize: {
        ...baseTheme.typography.fontSize,
        ...(overrides.typography?.fontSize || {}),
      },
      fontWeight: {
        ...baseTheme.typography.fontWeight,
        ...(overrides.typography?.fontWeight || {}),
      },
      lineHeight: {
        ...baseTheme.typography.lineHeight,
        ...(overrides.typography?.lineHeight || {}),
      },
    },
    transitions: {
      ...baseTheme.transitions,
      ...(overrides.transitions || {}),
    },
  };
};

/**
 * Convert ButtonStyle to CSS properties
 */
export const buttonStyleToCSS = (style: ButtonStyle): Record<string, string> => {
  const css: Record<string, string> = {};
  
  if (style.background_color) {
    css['background-color'] = style.background_color;
  }
  
  if (style.text_color) {
    css['color'] = style.text_color;
  }
  
  if (style.border_color) {
    css['border-color'] = style.border_color;
  }
  
  if (style.border_width !== undefined) {
    css['border-width'] = `${style.border_width}px`;
  }
  
  if (style.border_radius !== undefined) {
    css['border-radius'] = `${style.border_radius}px`;
  }
  
  if (style.font_size) {
    css['font-size'] = `${style.font_size}px`;
  }
  
  if ((style as any).font_weight) {
    css['font-weight'] = (style as any).font_weight.toString();
  }
  
  if (style.gradient?.enabled && style.gradient.colors.length >= 2) {
    const direction = style.gradient.direction || 135;
    const colors = style.gradient.colors
      .map(c => `${c.color} ${c.position}%`)
      .join(', ');
    css['background'] = `linear-gradient(${direction}deg, ${colors})`;
  }
  
  if (style.shadow?.enabled) {
    const { color, blur, offset_x, offset_y, spread } = style.shadow;
    css['box-shadow'] = `${offset_x}px ${offset_y}px ${blur}px ${spread || 0}px ${color}`;
  }
  
  if (style.animation) {
    css['--hover-scale'] = style.animation.hover_scale?.toString() || '1.05';
    css['--hover-rotation'] = `${style.animation.hover_rotation || 0}deg`;
    css['--click-scale'] = style.animation.click_scale?.toString() || '0.95';
    css['transition-duration'] = `${style.animation.transition_duration || 200}ms`;
  }
  
  return css;
};

/**
 * Get CSS variable value
 */
export const getCSSVariable = (name: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

/**
 * Set CSS variable value
 */
export const setCSSVariable = (name: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(name, value);
};

// ===== Export default theme =====
export default darkTheme;
