import { invoke } from '@tauri-apps/api/core';

// Type definitions for Tauri commands
export interface QDeckConfig {
  version: string;
  ui: UIConfig;
  profiles: Profile[];
}

export interface UIConfig {
  summon: SummonConfig;
  window: WindowConfig;
}

export interface SummonConfig {
  hotkeys: string[];
  edge_trigger?: EdgeTriggerConfig;
}

export interface EdgeTriggerConfig {
  enabled: boolean;
  edges: string[];
  dwell_ms: number;
  margin_px: number;
}

export interface WindowConfig {
  placement: WindowPlacement;
  width_px: number;
  height_px: number;
  cell_size_px: number;
  gap_px: number;
  opacity: number;
  theme: ThemeName;
  animation: AnimationConfig;
  // Enhanced multi-monitor support
  monitor_preference?: MonitorPreference;
  dpi_awareness?: DPIAwareness;
  responsive_scaling?: ResponsiveScaling;
}

export type WindowPlacement = 
  | 'dropdown-top'
  | 'dropdown-bottom'
  | 'center'
  | 'left-dock'
  | 'right-dock'
  | 'custom';

export type ThemeName = 
  | 'dark'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'orange'
  | 'light';

export interface MonitorPreference {
  strategy: 'cursor' | 'primary' | 'largest' | 'specific';
  monitor_id?: number;
  fallback_to_primary?: boolean;
}

export interface DPIAwareness {
  enabled: boolean;
  max_scale_factor: number;
  min_scale_factor: number;
  scale_strategy: 'linear' | 'stepped' | 'adaptive';
}

export interface ResponsiveScaling {
  enabled: boolean;
  breakpoints: ScreenBreakpoint[];
  adaptive_cell_size: boolean;
  adaptive_gap_size: boolean;
}

export interface ScreenBreakpoint {
  name: string;
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  scale_modifier: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration_ms: number;
}

export interface Profile {
  name: string;
  hotkey?: string;
  pages: Page[];
}

export interface Page {
  name: string;
  rows: number;
  cols: number;
  buttons: ActionButton[];
}

export interface ActionButton {
  position: Position;
  action_type: ActionType;
  label: string;
  icon?: string;
  config: Record<string, any>;
  style?: ButtonStyle;
  action?: ActionConfig;
}

export interface ActionConfig {
  action_type: 'system' | 'app' | 'command';
  system_action?: SystemAction;
  app_config?: Record<string, any>;
  command_config?: Record<string, any>;
}

export type SystemAction = 
  | 'config'
  | 'back'
  | 'exit_config'
  | 'hide_overlay'
  | 'toggle_overlay';

export interface Position {
  row: number;
  col: number;
}

export type ActionType = 
  | 'LaunchApp'
  | 'Open'
  | 'Terminal'
  | 'SendKeys'
  | 'PowerShell'
  | 'Folder'
  | 'MultiAction';

export interface ButtonStyle {
  background_color?: string;
  text_color?: string;
  font_size?: number;
  font_family?: string;
  // Enhanced styling options
  border_color?: string;
  border_width?: number;
  border_radius?: number;
  gradient?: ButtonGradient;
  shadow?: ButtonShadow;
  animation?: ButtonAnimation;
  responsive_font_scaling?: boolean;
}

export interface ButtonGradient {
  enabled: boolean;
  direction: number; // degrees
  colors: GradientStop[];
}

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface ButtonShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offset_x: number;
  offset_y: number;
  spread?: number;
}

export interface ButtonAnimation {
  hover_scale?: number;
  hover_rotation?: number;
  click_scale?: number;
  transition_duration?: number;
}

export interface ActionLog {
  timestamp: string;
  action_type: string;
  action_id: string;
  result: 'Success' | 'Failed' | 'Cancelled';
  execution_time_ms: number;
  error_message?: string;
  context: Record<string, any>;
}

export interface HotkeyConfig {
  id: number;
  modifiers: string[];
  key: string;
  action: string;
}

export interface ParsedHotkey {
  id: number;
  modifiers: number;
  vk_code: number;
  action: string;
}

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

// Enhanced screen and monitor information
export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  colorDepth: number;
  orientation: string;
  dpiCategory: 'standard' | 'high' | 'very-high' | 'ultra-high';
  physicalWidth: number;
  physicalHeight: number;
}

// Icon processing types
export interface IconInfo {
  path: string;
  icon_type: IconType;
  size?: IconSize;
  data_url?: string;
  extracted_from?: string;
}

export type IconType = 'Emoji' | 'File' | 'Extracted' | 'Url' | 'Base64';

export interface IconSize {
  width: number;
  height: number;
}

export interface CacheStats {
  cached_icons: number;
  cache_size_bytes: number;
  cache_directory: string;
}

export interface MonitorInfo {
  id: number;
  name: string;
  is_primary: boolean;
  bounds: Rectangle;
  work_area: Rectangle;
  scale_factor: number;
  refresh_rate?: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Grid layout types
export interface GridLayout {
  rows: number;
  cols: number;
  cell_size: number;
  gap_size: number;
  total_width: number;
  total_height: number;
  responsive_breakpoint?: string;
}

export interface GridMetrics {
  optimal_cell_size: number;
  optimal_gap_size: number;
  grid_bounds: Rectangle;
  fits_on_screen: boolean;
  scale_factor_applied: number;
}

// Tauri API wrapper
export const tauriAPI = {
  // Config management
  getConfig: (): Promise<QDeckConfig> => invoke('get_config'),
  saveConfig: (config: QDeckConfig): Promise<void> => invoke('save_config', { config }),
  
  // Overlay management
  showOverlay: (): Promise<void> => invoke('show_overlay'),
  hideOverlay: (): Promise<void> => invoke('hide_overlay'),
  toggleOverlay: (): Promise<void> => invoke('toggle_overlay'),
  isOverlayVisible: (): Promise<boolean> => invoke('is_overlay_visible'),
  updateOverlayConfig: (config: TauriWindowConfig): Promise<void> => 
    invoke('update_overlay_config', { config }),
  positionOverlay: (placement: string): Promise<void> => 
    invoke('position_overlay', { placement }),
  
  // Enhanced multi-monitor and DPI support
  getMonitorInfo: (): Promise<MonitorInfo[]> => invoke('get_monitor_info'),
  getCurrentMonitor: (): Promise<MonitorInfo> => invoke('get_current_monitor'),
  getOptimalGridLayout: (rows: number, cols: number): Promise<GridLayout> => 
    invoke('get_optimal_grid_layout', { rows, cols }),
  calculateGridMetrics: (config: WindowConfig, screenInfo: ScreenInfo): Promise<GridMetrics> =>
    invoke('calculate_grid_metrics', { config, screenInfo }),
  
  // Icon processing
  processIcon: (iconSpec: string, fallbackExecutable?: string): Promise<IconInfo> =>
    invoke('process_icon', { iconSpec, fallbackExecutable }),
  extractExecutableIcon: (exePath: string, iconId: string): Promise<IconInfo> =>
    invoke('extract_executable_icon', { exePath, iconId }),
  getIconCacheStats: (): Promise<CacheStats> => invoke('get_icon_cache_stats'),
  clearIconCache: (): Promise<void> => invoke('clear_icon_cache'),
  
  // Action execution
  executeAction: (actionId: string): Promise<void> => invoke('execute_action', { actionId }),
  
  // Logging
  getRecentLogs: (limit: number): Promise<ActionLog[]> => invoke('get_recent_logs', { limit }),
  
  // Hotkey management
  registerHotkey: (hotkeyStr: string, action: string): Promise<number> => 
    invoke('register_hotkey', { hotkeyStr, action }),
  unregisterHotkey: (id: number): Promise<void> => 
    invoke('unregister_hotkey', { id }),
  registerMultipleHotkeys: (hotkeyConfigs: HotkeyConfig[]): Promise<number[]> => 
    invoke('register_multiple_hotkeys', { hotkeyConfigs }),
  getRegisteredHotkeys: (): Promise<ParsedHotkey[]> => 
    invoke('get_registered_hotkeys'),
  isHotkeyAvailable: (hotkeyStr: string): Promise<boolean> => 
    invoke('is_hotkey_available', { hotkeyStr }),
};

export default tauriAPI;