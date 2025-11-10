// Platform-agnostic API (works with both Tauri and Electron)
// This file has been migrated to use electron-adapter instead of direct Tauri calls
// The electron-adapter provides a unified interface that works with both platforms
import platformAPI from './electron-adapter';
import { logger } from '../utils/logger';

// Import all type definitions from centralized type files
import type {
  // Config types
  QDeckConfig,
  UIConfig,
  SummonConfig,
  EdgeTriggerConfig,
  WindowConfig,
  WindowPlacement,
  ThemeName,
  AnimationConfig,
  Profile,
  Page,
  ProfileInfo,
  PageInfo,
  NavigationContext,
  HotkeyConfig,
  ParsedHotkey,
  TauriWindowConfig,
  
  // Button types
  ActionButton,
  ActionType,
  ActionConfig,
  SystemAction,
  ButtonStyle,
  ButtonGradient,
  GradientStop,
  ButtonShadow,
  ButtonAnimation,
  IconInfo,
  IconType,
  IconSize,
  CacheStats,
  ActionResult,
  ActionLog,
  DroppedFile,
  DroppedFileType,
  ButtonGenerationRequest,
  ButtonGenerationResult,
  UndoOperation,
  UndoOperationType,
  
  // Grid types
  GridLayout,
  GridMetrics,
  Rectangle,
  Position,
  GridCell,
  DragState,
  ScreenBreakpoint,
  ResponsiveScaling,
  DPIAwareness,
  MonitorPreference,
  MonitorInfo,
  ScreenInfo,
} from '../types';

// Re-export all types for backward compatibility
export type {
  // Config types
  QDeckConfig,
  UIConfig,
  SummonConfig,
  EdgeTriggerConfig,
  WindowConfig,
  WindowPlacement,
  ThemeName,
  AnimationConfig,
  Profile,
  Page,
  ProfileInfo,
  PageInfo,
  NavigationContext,
  HotkeyConfig,
  ParsedHotkey,
  TauriWindowConfig,
  
  // Button types
  ActionButton,
  ActionType,
  ActionConfig,
  SystemAction,
  ButtonStyle,
  ButtonGradient,
  GradientStop,
  ButtonShadow,
  ButtonAnimation,
  IconInfo,
  IconType,
  IconSize,
  CacheStats,
  ActionResult,
  ActionLog,
  DroppedFile,
  DroppedFileType,
  ButtonGenerationRequest,
  ButtonGenerationResult,
  UndoOperation,
  UndoOperationType,
  
  // Grid types
  GridLayout,
  GridMetrics,
  Rectangle,
  Position,
  GridCell,
  DragState,
  ScreenBreakpoint,
  ResponsiveScaling,
  DPIAwareness,
  MonitorPreference,
  MonitorInfo,
  ScreenInfo,
};
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
    const config: QDeckConfig = await platformAPI.getConfig();
    return config.profiles.map((profile: Profile, index: number) => ({
      index,
      name: profile.name
    }));
  },
  getCurrentProfile: () => platformAPI.getCurrentProfile(),
  getCurrentPage: () => platformAPI.getCurrentPage(),
  getNavigationContext: () => platformAPI.getNavigationContext(),
  getCurrentProfilePages: async () => {
    const config: QDeckConfig = await platformAPI.getConfig();
    const profile = config.profiles[0];
    return profile.pages.map((page: Page, index: number) => ({
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
      
      // Type guard to check if result has iconPath property
      if (result.success && 'iconPath' in result && result.iconPath) {
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
      logger.error('Failed to extract icon:', error);
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
  
  // Drag state management for overlay focus control
  setDragState: (dragging: boolean) => platformAPI.setDragState(dragging),
};

export default tauriAPI;
