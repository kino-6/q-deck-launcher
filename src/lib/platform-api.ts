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
  executeAction: (actionConfig: any): Promise<ActionResult> => platformAPI.executeAction(actionConfig) as Promise<ActionResult>,
  
  // Profile management - now using electron-adapter
  getProfiles: () => platformAPI.getAllProfiles(),
  getCurrentProfile: () => platformAPI.getCurrentProfile(),
  getCurrentPage: () => platformAPI.getCurrentPage(),
  getNavigationContext: () => platformAPI.getNavigationContext(),
  getCurrentProfilePages: () => platformAPI.getCurrentProfilePages(),
  switchToProfile: (profileIndex: number) => platformAPI.switchToProfile(profileIndex),
  switchToProfileByName: (profileName: string) => platformAPI.switchToProfileByName(profileName),
  switchToPage: (pageIndex: number) => platformAPI.switchToPage(pageIndex),
  
  // File drop - now using electron-adapter
  onFileDrop: (callback: (files: string[]) => void) => platformAPI.onFileDrop(callback),
  
  // Profile change events - now using electron-adapter
  onProfileChanged: (callback: (profileInfo: ProfileInfo) => void) => platformAPI.onProfileChanged(callback),
  
  // Platform detection - now using electron-adapter
  getPlatform: () => platformAPI.getPlatform(),
  
  // Page navigation - now using electron-adapter
  nextPage: () => platformAPI.nextPage(),
  previousPage: () => platformAPI.previousPage(),
  getMonitorInfo: async () => [],
  getCurrentMonitor: async () => ({} as MonitorInfo),
  getOptimalGridLayout: async () => ({} as GridLayout),
  calculateGridMetrics: async () => ({} as GridMetrics),
  
  // Icon processing - enhanced for PNG, ICO, SVG support
  processIcon: async (iconPath: string, fallbackPath?: string): Promise<IconInfo> => {
    // Check if it's a data URL (base64 encoded image)
    if (iconPath.startsWith('data:')) {
      return {
        path: '',
        icon_type: 'Base64',
        data_url: iconPath
      };
    }
    
    // Check if it's an emoji (short string, no file extension, no path separators)
    if (iconPath.length <= 4 && !iconPath.includes('.') && !iconPath.includes('/') && !iconPath.includes('\\')) {
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
    
    // Check if it's a file path
    if (iconPath.includes('.')) {
      const extension = iconPath.split('.').pop()?.toLowerCase();
      
      // Handle different file formats
      if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'ico' || extension === 'svg') {
        // For local files, convert to file:// URL for proper loading
        let fullPath = iconPath;
        
        // If it's a relative path, try to resolve it
        if (!iconPath.startsWith('file://') && !iconPath.match(/^[a-zA-Z]:\\/)) {
          // Try to get the full path from the icon cache
          try {
            fullPath = await platformAPI.getIconPath(iconPath);
          } catch (err) {
            logger.warn('Failed to resolve icon path:', err);
            fullPath = iconPath;
          }
        }
        
        // Convert to data URL for better compatibility
        try {
          // For SVG files, we can load them directly
          if (extension === 'svg') {
            return {
              path: fullPath.startsWith('file://') ? fullPath : `file://${fullPath}`,
              icon_type: 'File'
            };
          }
          
          // For other image formats, return the file path
          return {
            path: fullPath.startsWith('file://') ? fullPath : `file://${fullPath}`,
            icon_type: 'File'
          };
        } catch (err) {
          logger.error('Failed to process icon file:', err);
        }
      }
      
      // If it's an executable and we have a fallback path, try to extract icon
      if ((extension === 'exe' || extension === 'lnk') && fallbackPath) {
        try {
          const extractedIcon = await tauriAPI.extractExecutableIcon(fallbackPath);
          if (extractedIcon.path) {
            return extractedIcon;
          }
        } catch (err) {
          logger.warn('Failed to extract icon from executable:', err);
        }
      }
    }
    
    // Default: treat as file path
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
  extractFileIcon: async (filePath: string): Promise<IconInfo> => {
    try {
      const result = await platformAPI.extractFileIcon(filePath);
      
      if (result.success && result.dataUrl) {
        return {
          path: '',
          icon_type: 'Base64',
          data_url: result.dataUrl
        };
      } else {
        // Return empty icon info if extraction failed
        return {
          path: '',
          icon_type: 'File'
        };
      }
    } catch (error) {
      logger.error('Failed to extract file icon:', error);
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
