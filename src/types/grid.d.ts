// Grid-related type definitions

/**
 * Grid layout configuration
 */
export interface GridLayout {
  rows: number;
  cols: number;
  cell_size: number;
  gap_size: number;
  total_width: number;
  total_height: number;
  responsive_breakpoint?: string;
}

/**
 * Grid metrics for layout calculations
 */
export interface GridMetrics {
  optimal_cell_size: number;
  optimal_gap_size: number;
  grid_bounds: Rectangle;
  fits_on_screen: boolean;
  scale_factor_applied: number;
}

/**
 * Rectangle bounds
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Grid cell position
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * Grid cell data structure
 */
export interface GridCell {
  index: number;
  row: number;
  col: number;
  button: ActionButton | null;
}

/**
 * Drag state for drag and drop operations
 */
export interface DragState {
  isDragging: boolean;
  isProcessing: boolean;
  dragOverPosition: Position | null;
}

/**
 * Screen breakpoint for responsive design
 */
export interface ScreenBreakpoint {
  name: string;
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  scale_modifier: number;
}

/**
 * Responsive scaling configuration
 */
export interface ResponsiveScaling {
  enabled: boolean;
  breakpoints: ScreenBreakpoint[];
  adaptive_cell_size: boolean;
  adaptive_gap_size: boolean;
}

/**
 * DPI awareness configuration
 */
export interface DPIAwareness {
  enabled: boolean;
  max_scale_factor: number;
  min_scale_factor: number;
  scale_strategy: 'linear' | 'stepped' | 'adaptive';
}

/**
 * Monitor preference for multi-monitor setups
 */
export interface MonitorPreference {
  strategy: 'cursor' | 'primary' | 'largest' | 'specific';
  monitor_id?: number;
  fallback_to_primary?: boolean;
}

/**
 * Monitor information
 */
export interface MonitorInfo {
  id: number;
  name: string;
  is_primary: boolean;
  bounds: Rectangle;
  work_area: Rectangle;
  scale_factor: number;
  refresh_rate?: number;
}

/**
 * Screen information
 */
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

// Import ActionButton type from button.d.ts
import type { ActionButton } from './button';
