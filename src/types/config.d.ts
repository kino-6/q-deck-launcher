// Configuration-related type definitions

import type { ActionButton } from './button';
import type { 
  DPIAwareness, 
  MonitorPreference, 
  ResponsiveScaling 
} from './grid';

/**
 * Main Q-Deck configuration
 */
export interface QDeckConfig {
  version: string;
  ui: UIConfig;
  profiles: Profile[];
}

/**
 * UI configuration
 */
export interface UIConfig {
  summon: SummonConfig;
  window: WindowConfig;
}

/**
 * Summon configuration (hotkeys and triggers)
 */
export interface SummonConfig {
  hotkeys: string[];
  edge_trigger?: EdgeTriggerConfig;
}

/**
 * Edge trigger configuration
 */
export interface EdgeTriggerConfig {
  enabled: boolean;
  edges: string[];
  dwell_ms: number;
  margin_px: number;
}

/**
 * Window configuration
 */
export interface WindowConfig {
  placement: WindowPlacement;
  width_px: number;
  height_px: number;
  cell_size_px: number;
  gap_px: number;
  opacity: number;
  theme: ThemeName;
  animation: AnimationConfig;
  auto_close_on_open?: boolean;
  monitor_preference?: MonitorPreference;
  dpi_awareness?: DPIAwareness;
  responsive_scaling?: ResponsiveScaling;
}

/**
 * Window placement options
 */
export type WindowPlacement = 
  | 'dropdown-top'
  | 'dropdown-bottom'
  | 'center'
  | 'left-dock'
  | 'right-dock'
  | 'custom';

/**
 * Theme names
 */
export type ThemeName = 
  | 'dark'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'orange'
  | 'light';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  enabled: boolean;
  duration_ms: number;
}

/**
 * Profile configuration
 */
export interface Profile {
  name: string;
  hotkey?: string;
  pages: Page[];
}

/**
 * Page configuration
 */
export interface Page {
  name: string;
  rows: number;
  cols: number;
  buttons: ActionButton[];
}

/**
 * Profile information
 */
export interface ProfileInfo {
  name: string;
  index: number;
  page_count: number;
  current_page_index: number;
  hotkey?: string;
}

/**
 * Page information
 */
export interface PageInfo {
  name: string;
  index: number;
  rows: number;
  cols: number;
  button_count: number;
}

/**
 * Navigation context
 */
export interface NavigationContext {
  profile_name: string;
  profile_index: number;
  page_name: string;
  page_index: number;
  total_profiles: number;
  total_pages: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}

/**
 * Hotkey configuration
 */
export interface HotkeyConfig {
  id: number;
  modifiers: string[];
  key: string;
  action: string;
}

/**
 * Parsed hotkey
 */
export interface ParsedHotkey {
  id: number;
  modifiers: number;
  vk_code: number;
  action: string;
}

/**
 * Tauri window configuration
 */
export interface TauriWindowConfig {
  width: number;
  height: number;
  x?: number;
  y?: number;
  opacity: number;
  always_on_top: boolean;
  decorations: boolean;
  resizable: boolean;
  visible: boolean;
  transparent: boolean;
  skip_taskbar: boolean;
  focus: boolean;
}
