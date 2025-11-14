// Button-related type definitions

import type { Position } from './grid';

/**
 * Action button configuration
 */
export interface ActionButton {
  position: Position;
  action_type: ActionType;
  label: string;
  icon?: string;
  config: Record<string, any>;
  style?: ButtonStyle;
  action?: ActionConfig;
}

/**
 * Action types supported by buttons
 */
export type ActionType = 
  | 'LaunchApp'
  | 'Open'
  | 'Terminal'
  | 'SendKeys'
  | 'PowerShell'
  | 'Folder'
  | 'MultiAction';

/**
 * Action configuration
 */
export interface ActionConfig {
  action_type: 'system' | 'app' | 'command';
  system_action?: SystemAction;
  app_config?: Record<string, any>;
  command_config?: Record<string, any>;
}

/**
 * System actions
 */
export type SystemAction = 
  | 'config'
  | 'back'
  | 'exit_config'
  | 'hide_overlay'
  | 'toggle_overlay';

/**
 * Button style configuration
 */
export interface ButtonStyle {
  background_color?: string;
  text_color?: string;
  font_size?: number;
  font_family?: string;
  border_color?: string;
  border_width?: number;
  border_radius?: number;
  gradient?: ButtonGradient;
  shadow?: ButtonShadow;
  animation?: ButtonAnimation;
  responsive_font_scaling?: boolean;
}

/**
 * Button gradient configuration
 */
export interface ButtonGradient {
  enabled: boolean;
  direction: number; // degrees
  colors: GradientStop[];
}

/**
 * Gradient stop
 */
export interface GradientStop {
  color: string;
  position: number; // 0-100
}

/**
 * Button shadow configuration
 */
export interface ButtonShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offset_x: number;
  offset_y: number;
  spread?: number;
}

/**
 * Button animation configuration
 */
export interface ButtonAnimation {
  hover_scale?: number;
  hover_rotation?: number;
  click_scale?: number;
  transition_duration?: number;
}

/**
 * Icon information
 */
export interface IconInfo {
  path: string;
  icon_type: IconType;
  size?: IconSize;
  data_url?: string;
  extracted_from?: string;
}

/**
 * Icon types
 */
export type IconType = 'Emoji' | 'File' | 'Extracted' | 'Url' | 'Base64';

/**
 * Icon size
 */
export interface IconSize {
  width: number;
  height: number;
}

/**
 * Cache statistics for icons
 */
export interface CacheStats {
  cached_icons: number;
  cache_size_bytes: number;
  cache_directory: string;
}

/**
 * Action execution result
 */
export interface ActionResult {
  success: boolean;
  message: string;
  execution_time_ms: number;
  output?: string;
  error_code?: number;
  actionType?: string; // Type of action executed (for auto-close detection)
}

/**
 * Action log entry
 */
export interface ActionLog {
  timestamp: string;
  action_type: string;
  action_id: string;
  result: 'Success' | 'Failed' | 'Cancelled';
  execution_time_ms: number;
  error_message?: string;
  context: Record<string, any>;
}

/**
 * Dropped file information
 */
export interface DroppedFile {
  path: string;
  name: string;
  file_type: DroppedFileType;
  size_bytes: number;
  is_directory: boolean;
  icon_hint?: string;
}

/**
 * Dropped file types
 */
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

/**
 * Button generation request
 */
export interface ButtonGenerationRequest {
  files: DroppedFile[];
  target_position?: Position;
  grid_rows: number;
  grid_cols: number;
  existing_buttons: ActionButton[];
}

/**
 * Button generation result
 */
export interface ButtonGenerationResult {
  generated_buttons: ActionButton[];
  placement_positions: Position[];
  conflicts: Position[];
  errors: string[];
}

/**
 * Undo operation
 */
export interface UndoOperation {
  operation_id: string;
  timestamp: string;
  operation_type: UndoOperationType;
  affected_positions: Position[];
  previous_buttons: (ActionButton | null)[];
  new_buttons: ActionButton[];
}

/**
 * Undo operation types
 */
export type UndoOperationType = 
  | 'AddButtons'
  | 'RemoveButtons'
  | 'ModifyButtons';
