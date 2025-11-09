// Theme presets and utilities for ActionButton customization
import { ButtonStyle } from './platform-api';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'neon' | 'minimal' | 'gaming' | 'professional';
  style: ButtonStyle;
  preview?: string; // Base64 encoded preview image
}

export const THEME_PRESETS: ThemePreset[] = [
  // Modern Themes
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean modern design with blue accents',
    category: 'modern',
    style: {
      background_color: '#1e40af',
      text_color: '#ffffff',
      border_color: '#3b82f6',
      border_width: 1,
      border_radius: 12,
      gradient: {
        enabled: true,
        direction: 135,
        colors: [
          { color: '#1e40af', position: 0 },
          { color: '#3b82f6', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(59, 130, 246, 0.3)',
        blur: 8,
        offset_x: 0,
        offset_y: 4,
        spread: 0
      },
      animation: {
        hover_scale: 1.05,
        hover_rotation: 1,
        click_scale: 0.95,
        transition_duration: 200
      }
    }
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    description: 'Fresh modern design with green accents',
    category: 'modern',
    style: {
      background_color: '#059669',
      text_color: '#ffffff',
      border_color: '#10b981',
      border_width: 1,
      border_radius: 12,
      gradient: {
        enabled: true,
        direction: 135,
        colors: [
          { color: '#059669', position: 0 },
          { color: '#10b981', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(16, 185, 129, 0.3)',
        blur: 8,
        offset_x: 0,
        offset_y: 4,
        spread: 0
      },
      animation: {
        hover_scale: 1.05,
        hover_rotation: 1,
        click_scale: 0.95,
        transition_duration: 200
      }
    }
  },
  
  // Neon Themes
  {
    id: 'neon-cyan',
    name: 'Neon Cyan',
    description: 'Cyberpunk-inspired neon cyan glow',
    category: 'neon',
    style: {
      background_color: '#0891b2',
      text_color: '#ffffff',
      border_color: '#06b6d4',
      border_width: 2,
      border_radius: 8,
      gradient: {
        enabled: true,
        direction: 135,
        colors: [
          { color: '#0891b2', position: 0 },
          { color: '#06b6d4', position: 50 },
          { color: '#67e8f9', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(6, 182, 212, 0.6)',
        blur: 16,
        offset_x: 0,
        offset_y: 0,
        spread: 2
      },
      animation: {
        hover_scale: 1.08,
        hover_rotation: 2,
        click_scale: 0.92,
        transition_duration: 150
      }
    }
  },
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    description: 'Vibrant neon pink with electric glow',
    category: 'neon',
    style: {
      background_color: '#be185d',
      text_color: '#ffffff',
      border_color: '#ec4899',
      border_width: 2,
      border_radius: 8,
      gradient: {
        enabled: true,
        direction: 135,
        colors: [
          { color: '#be185d', position: 0 },
          { color: '#ec4899', position: 50 },
          { color: '#f9a8d4', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(236, 72, 153, 0.6)',
        blur: 16,
        offset_x: 0,
        offset_y: 0,
        spread: 2
      },
      animation: {
        hover_scale: 1.08,
        hover_rotation: -2,
        click_scale: 0.92,
        transition_duration: 150
      }
    }
  },
  
  // Gaming Themes
  {
    id: 'gaming-red',
    name: 'Gaming Red',
    description: 'Aggressive gaming style with red highlights',
    category: 'gaming',
    style: {
      background_color: '#991b1b',
      text_color: '#ffffff',
      border_color: '#dc2626',
      border_width: 2,
      border_radius: 6,
      gradient: {
        enabled: true,
        direction: 45,
        colors: [
          { color: '#991b1b', position: 0 },
          { color: '#dc2626', position: 50 },
          { color: '#ef4444', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(220, 38, 38, 0.4)',
        blur: 12,
        offset_x: 2,
        offset_y: 4,
        spread: 1
      },
      animation: {
        hover_scale: 1.1,
        hover_rotation: 3,
        click_scale: 0.9,
        transition_duration: 100
      }
    }
  },
  {
    id: 'gaming-purple',
    name: 'Gaming Purple',
    description: 'Mystical gaming theme with purple energy',
    category: 'gaming',
    style: {
      background_color: '#7c2d92',
      text_color: '#ffffff',
      border_color: '#a855f7',
      border_width: 2,
      border_radius: 6,
      gradient: {
        enabled: true,
        direction: 45,
        colors: [
          { color: '#7c2d92', position: 0 },
          { color: '#a855f7', position: 50 },
          { color: '#c084fc', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(168, 85, 247, 0.4)',
        blur: 12,
        offset_x: 2,
        offset_y: 4,
        spread: 1
      },
      animation: {
        hover_scale: 1.1,
        hover_rotation: -3,
        click_scale: 0.9,
        transition_duration: 100
      }
    }
  },
  
  // Minimal Themes
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean minimal design with light colors',
    category: 'minimal',
    style: {
      background_color: '#f8fafc',
      text_color: '#1e293b',
      border_color: '#e2e8f0',
      border_width: 1,
      border_radius: 8,
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.1)',
        blur: 4,
        offset_x: 0,
        offset_y: 2,
        spread: 0
      },
      animation: {
        hover_scale: 1.02,
        hover_rotation: 0,
        click_scale: 0.98,
        transition_duration: 200
      }
    }
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean minimal design with dark colors',
    category: 'minimal',
    style: {
      background_color: '#1e293b',
      text_color: '#f1f5f9',
      border_color: '#334155',
      border_width: 1,
      border_radius: 8,
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 4,
        offset_x: 0,
        offset_y: 2,
        spread: 0
      },
      animation: {
        hover_scale: 1.02,
        hover_rotation: 0,
        click_scale: 0.98,
        transition_duration: 200
      }
    }
  },
  
  // Professional Themes
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Corporate-friendly blue theme',
    category: 'professional',
    style: {
      background_color: '#1e40af',
      text_color: '#ffffff',
      border_color: '#2563eb',
      border_width: 1,
      border_radius: 4,
      gradient: {
        enabled: true,
        direction: 180,
        colors: [
          { color: '#1e40af', position: 0 },
          { color: '#2563eb', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(37, 99, 235, 0.2)',
        blur: 6,
        offset_x: 0,
        offset_y: 3,
        spread: 0
      },
      animation: {
        hover_scale: 1.03,
        hover_rotation: 0,
        click_scale: 0.97,
        transition_duration: 250
      }
    }
  },
  {
    id: 'professional-gray',
    name: 'Professional Gray',
    description: 'Neutral professional gray theme',
    category: 'professional',
    style: {
      background_color: '#4b5563',
      text_color: '#ffffff',
      border_color: '#6b7280',
      border_width: 1,
      border_radius: 4,
      gradient: {
        enabled: true,
        direction: 180,
        colors: [
          { color: '#4b5563', position: 0 },
          { color: '#6b7280', position: 100 }
        ]
      },
      shadow: {
        enabled: true,
        color: 'rgba(107, 114, 128, 0.2)',
        blur: 6,
        offset_x: 0,
        offset_y: 3,
        spread: 0
      },
      animation: {
        hover_scale: 1.03,
        hover_rotation: 0,
        click_scale: 0.97,
        transition_duration: 250
      }
    }
  },
  
  // Classic Themes
  {
    id: 'classic-windows',
    name: 'Classic Windows',
    description: 'Nostalgic Windows 95/98 style',
    category: 'classic',
    style: {
      background_color: '#c0c0c0',
      text_color: '#000000',
      border_color: '#808080',
      border_width: 2,
      border_radius: 0,
      shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 0,
        offset_x: 2,
        offset_y: 2,
        spread: 0
      },
      animation: {
        hover_scale: 1.0,
        hover_rotation: 0,
        click_scale: 1.0,
        transition_duration: 50
      }
    }
  }
];

// Utility functions for theme management
export const getThemesByCategory = (category: string): ThemePreset[] => {
  return THEME_PRESETS.filter(theme => theme.category === category);
};

export const getThemeById = (id: string): ThemePreset | undefined => {
  return THEME_PRESETS.find(theme => theme.id === id);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(THEME_PRESETS.map(theme => theme.category)));
};

// Color utility functions
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const lightenColor = (hex: string, percent: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
  const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
  const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

export const darkenColor = (hex: string, percent: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const newR = Math.max(0, Math.floor(r * (100 - percent) / 100));
  const newG = Math.max(0, Math.floor(g * (100 - percent) / 100));
  const newB = Math.max(0, Math.floor(b * (100 - percent) / 100));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Generate complementary colors
export const getComplementaryColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  
  return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
};

// Generate analogous colors
export const getAnalogousColors = (hex: string): string[] => {
  // Convert hex to HSL, adjust hue, convert back
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  // Generate analogous colors (±30 degrees)
  const analogous1 = hslToHex((h + 1/12) % 1, s, l);
  const analogous2 = hslToHex((h - 1/12 + 1) % 1, s, l);
  
  return [analogous1, analogous2];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default THEME_PRESETS;