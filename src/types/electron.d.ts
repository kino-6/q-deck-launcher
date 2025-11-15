// Electron API type definitions

import type { QDeckConfig } from './config';
import type { ProfileInfo, PageInfo, NavigationContext } from './config';
import type { ActionConfig, ActionResult } from './button';

/**
 * Icon extraction result
 */
export interface IconExtractionResult {
  success: boolean;
  iconPath?: string;
  error?: string;
}

/**
 * File icon extraction result (for any file type)
 */
export interface FileIconExtractionResult {
  success: boolean;
  dataUrl?: string;
  message?: string;
}

/**
 * Electron API interface
 * Provides type-safe access to Electron main process functionality
 */
export interface ElectronAPI {
  // Config management
  /**
   * Get the current configuration
   */
  getConfig: () => Promise<QDeckConfig>;
  
  /**
   * Save configuration to disk
   */
  saveConfig: (config: QDeckConfig) => Promise<void>;
  
  // Overlay management
  /**
   * Show the overlay window
   */
  showOverlay: () => Promise<void>;
  
  /**
   * Hide the overlay window
   */
  hideOverlay: () => Promise<void>;
  
  /**
   * Toggle overlay visibility
   */
  toggleOverlay: () => Promise<void>;
  
  // Action execution
  /**
   * Execute an action (launch app, open file, etc.)
   */
  executeAction: (actionConfig: ActionConfig) => Promise<ActionResult>;
  
  // Profile and page management
  /**
   * Get current profile information
   */
  getCurrentProfile: () => Promise<ProfileInfo>;
  
  /**
   * Get current page information
   */
  getCurrentPage: () => Promise<PageInfo>;
  
  /**
   * Get navigation context (profile, page, etc.)
   */
  getNavigationContext: () => Promise<NavigationContext>;
  
  /**
   * Get all profiles
   */
  getAllProfiles: () => Promise<ProfileInfo[]>;
  
  /**
   * Get all pages for current profile
   */
  getCurrentProfilePages: () => Promise<PageInfo[]>;
  
  /**
   * Switch to a specific profile by index
   */
  switchToProfile: (profileIndex: number) => Promise<ProfileInfo | null>;
  
  /**
   * Switch to a specific profile by name
   */
  switchToProfileByName: (profileName: string) => Promise<ProfileInfo | null>;
  
  /**
   * Switch to a specific page by index
   */
  switchToPage: (pageIndex: number) => Promise<PageInfo | null>;
  
  /**
   * Go to next page
   */
  nextPage: () => Promise<PageInfo | null>;
  
  /**
   * Go to previous page
   */
  previousPage: () => Promise<PageInfo | null>;
  
  // File drop events
  /**
   * Register callback for file drop events
   */
  onFileDrop: (callback: (filePaths: string[]) => void) => void;
  
  /**
   * Register callback for profile change events
   */
  onProfileChanged: (callback: (profileInfo: ProfileInfo) => void) => void;
  
  /**
   * Send file paths from renderer to main process
   */
  sendFilePaths: (filePaths: string[]) => Promise<void>;
  
  /**
   * Get file paths from File objects (synchronous in Electron 28+)
   */
  getFilePathsFromFiles: (files: File[]) => string[];
  
  // Icon extraction
  /**
   * Extract icon from executable file
   */
  extractIcon: (exePath: string) => Promise<IconExtractionResult>;
  
  /**
   * Extract icon from any file type (uses Windows Shell API)
   */
  extractFileIcon: (filePath: string) => Promise<FileIconExtractionResult>;
  
  /**
   * Get full path to cached icon
   */
  getIconPath: (relativePath: string) => Promise<string>;
  
  // Platform info
  /**
   * Current platform (win32, darwin, linux)
   */
  platform: string;
  
  /**
   * Whether running in Electron
   */
  isElectron: boolean;
  
  // Drag state management
  /**
   * Set drag state to prevent overlay from closing during drag operations
   */
  setDragState?: (isDragging: boolean) => void;
}

/**
 * Window interface extension
 * Augments the global Window interface with Electron and Tauri APIs
 */
declare global {
  interface Window {
    /**
     * Electron API (available when running in Electron)
     */
    electronAPI?: ElectronAPI;
    
    /**
     * Tauri API (available when running in Tauri)
     */
    __TAURI__?: any;
  }
}

// This export is needed to make this file a module
export {};
