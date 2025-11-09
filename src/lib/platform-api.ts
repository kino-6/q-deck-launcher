// Platform-agnostic API (works with both Tauri and Electron)
// This file has been migrated to use electron-adapter instead of direct Tauri calls
// The electron-adapter provides a unified interface that works with both platforms
import platformAPI from './electron-adapter';

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

// Profile and page management types
export interface ProfileInfo {
  name: string;
  index: number;
  page_count: number;
  current_page_index: number;
  hotkey?: string;
}

export interface PageInfo {
  name: string;
  index: number;
  rows: number;
  cols: number;
  button_count: number;
}

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

export interface ActionResult {
  success: boolean;
  message: string;
  execution_time_ms: number;
  output?: string;
  error_code?: number;
}

// Drag and drop types
export interface DroppedFile {
  path: string;
  name: string;
  file_type: DroppedFileType;
  size_bytes: number;
  is_directory: boolean;
  icon_hint?: string;
}

export type DroppedFileType = 
  | 'Executable'
  | 'Document'
  | 'Image'
  | 'Video'
  | 'Audio'
  | 'Archive'
  | 'Script'
  | 'Directory'
  | 'Unknown';

export interface ButtonGenerationRequest {
  files: DroppedFile[];
  target_position?: Position;
  grid_rows: number;
  grid_cols: number;
  existing_buttons: ActionButton[];
}

export interface ButtonGenerationResult {
  generated_buttons: ActionButton[];
  placement_positions: Position[];
  conflicts: Position[];
  errors: string[];
}

export interface UndoOperation {
  operation_id: string;
  timestamp: string;
  operation_type: UndoOperationType;
  affected_positions: Position[];
  previous_buttons: (ActionButton | null)[];
  new_buttons: ActionButton[];
}

export type UndoOperationType = 
  | 'AddButtons'
  | 'RemoveButtons'
  | 'ModifyButtons';
// Export unified API that works with both Tauri and Electron
// This replaces the old Tauri-specific implementation with the electron-adapter
export const tauriAPI = {
  // Config - now using electron-adapter
  getConfig: () => platformAPI.getConfig(),
  saveConfig: (config: QDeckConfig) => platformAPI.saveConfig(config),
  
  // Overlay - now using electron-adapter
  showOverlay: () => platformAPI.showOverlay(),
  hideOverlay: () => platformAPI.hideOverlay(),
  toggleOverlay: () => platformAPI.toggleOverlay(),
  
  // Actions - now using electron-adapter
  executeAction: (actionConfig: any) => platformAPI.executeAction(actionConfig),
  
  // Profile management - now using electron-adapter
  getProfiles: async () => {
    const config = await platformAPI.getConfig();
    return config.profiles.map((profile: any, index: number) => ({
      index,
      name: profile.name
    }));
  },
  getCurrentProfile: () => platformAPI.getCurrentProfile(),
  getCurrentPage: () => platformAPI.getCurrentPage(),
  getNavigationContext: () => platformAPI.getNavigationContext(),
  getCurrentProfilePages: async () => {
    const config = await platformAPI.getConfig();
    const profile = config.profiles[0];
    return profile.pages.map((page: any, index: number) => ({
      index,
      name: page.name
    }));
  },
  switchToProfile: async (_profileIndex: number): Promise<ProfileInfo | null> => null,
  switchToProfileByName: async (_profileName: string): Promise<ProfileInfo | null> => null,
  switchToPage: async (_pageIndex: number): Promise<PageInfo | null> => null,
  
  // File drop - now using electron-adapter
  onFileDrop: (callback: (files: string[]) => void) => platformAPI.onFileDrop(callback),
  
  // Platform detection - now using electron-adapter
  getPlatform: () => platformAPI.getPlatform(),
  
  // Placeholder functions for features not yet implemented in Electron
  nextPage: async (): Promise<PageInfo | null> => null,
  previousPage: async (): Promise<PageInfo | null> => null,
  getMonitorInfo: async () => [],
  getCurrentMonitor: async () => ({} as MonitorInfo),
  getOptimalGridLayout: async () => ({} as GridLayout),
  calculateGridMetrics: async () => ({} as GridMetrics),
  
  // Icon processing - simplified for Electron
  processIcon: async (iconPath: string, _fallbackPath?: string): Promise<IconInfo> => {
    // Simple icon processing for Electron
    // Check if it's an emoji (short string, no file extension)
    if (iconPath.length <= 4 && !iconPath.includes('.')) {
      return {
        path: iconPath,
        icon_type: 'Emoji'
      };
    }
    
    // Check if it's a URL
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
      return {
        path: iconPath,
        icon_type: 'Url'
      };
    }
    
    // Assume it's a file path
    return {
      path: iconPath,
      icon_type: 'File'
    };
  },
  extractExecutableIcon: async (exePath: string): Promise<IconInfo> => {
    try {
      const result = await platformAPI.extractIcon(exePath);
      
      if (result.success && result.iconPath) {
        // Get the full path to the icon
        const fullPath = await platformAPI.getIconPath(result.iconPath);
        
        return {
          path: fullPath,
          icon_type: 'Extracted',
          extracted_from: exePath
        };
      } else {
        // Return a default icon info if extraction failed
        return {
          path: '',
          icon_type: 'File'
        };
      }
    } catch (error) {
      console.error('Failed to extract icon:', error);
      return {
        path: '',
        icon_type: 'File'
      };
    }
  },
  getIconCacheStats: async () => ({} as CacheStats),
  clearIconCache: async () => {},
  
  // Hotkey management (not fully implemented in Electron yet)
  registerHotkey: async (_hotkey: string, _action: string): Promise<number> => 0,
  unregisterHotkey: async (_hotkeyId: number): Promise<void> => {},
  registerMultipleHotkeys: async (_hotkeys: HotkeyConfig[]): Promise<ParsedHotkey[]> => [],
  getRegisteredHotkeys: async (): Promise<ParsedHotkey[]> => [],
  isHotkeyAvailable: async (_hotkey: string): Promise<boolean> => true,
  
  // Drag and drop (not implemented yet)
  analyzeDroppedFiles: async () => [],
  generateButtonsFromFiles: async () => ({ generated_buttons: [], placement_positions: [], conflicts: [], errors: [] }),
  addUndoOperation: async () => {},
  getLastUndoOperation: async (): Promise<UndoOperation | null> => null,
  undoLastOperation: async (): Promise<UndoOperation | null> => null,
  clearUndoHistory: async () => {},
  getUndoStats: async () => [0, 0],
  
  // Other functions
  isOverlayVisible: async () => false,
  updateOverlayConfig: async () => {},
  positionOverlay: async () => {},
  getRecentLogs: async () => [],
};

export default tauriAPI;
