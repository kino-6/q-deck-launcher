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
  placement: string;
  width_px: number;
  height_px: number;
  cell_size_px: number;
  gap_px: number;
  opacity: number;
  theme: string;
  animation: AnimationConfig;
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

export interface WindowConfig {
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
  updateOverlayConfig: (config: WindowConfig): Promise<void> => 
    invoke('update_overlay_config', { config }),
  positionOverlay: (placement: string): Promise<void> => 
    invoke('position_overlay', { placement }),
  
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