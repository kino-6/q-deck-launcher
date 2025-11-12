// Electron API adapter to replace Tauri API
// This allows the React UI to work with both Tauri and Electron

import { logger } from '../utils/logger';

// Wait for electronAPI to be available (with timeout)
const waitForElectronAPI = async (timeoutMs: number = 5000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (window.electronAPI?.isElectron === true) {
      logger.log('electronAPI is now available');
      return true;
    }
    
    // Wait 50ms before checking again
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  logger.error('Timeout waiting for electronAPI');
  return false;
};

// Check if running in Electron
export const isElectron = () => {
  const result = window.electronAPI?.isElectron === true;
  if (!result) {
    logger.log('Electron detection failed');
  }
  return result;
};

// Check if running in Tauri
export const isTauri = () => {
  return window.__TAURI__ !== undefined;
};

// Unified API that works with both Electron and Tauri
export const platformAPI = {
  getConfig: async () => {
    // Wait for electronAPI if not immediately available
    if (!isElectron() && !isTauri()) {
      logger.log('Waiting for platform API to be available...');
      const electronAvailable = await waitForElectronAPI();
      if (!electronAvailable) {
        throw new Error('No platform API available - timeout waiting for electronAPI');
      }
    }
    
    if (isElectron()) {
      return window.electronAPI!.getConfig();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_config');
    }
    throw new Error('No platform API available');
  },

  saveConfig: async (config: any) => {
    if (!isElectron() && !isTauri()) {
      await waitForElectronAPI();
    }
    
    if (isElectron()) {
      return window.electronAPI!.saveConfig(config);
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('save_config', { config });
    }
    throw new Error('No platform API available');
  },

  showOverlay: async () => {
    if (isElectron()) {
      return window.electronAPI!.showOverlay();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('show_overlay');
    }
    throw new Error('No platform API available');
  },

  hideOverlay: async () => {
    if (isElectron()) {
      return window.electronAPI!.hideOverlay();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('hide_overlay');
    }
    throw new Error('No platform API available');
  },

  toggleOverlay: async () => {
    if (isElectron()) {
      return window.electronAPI!.toggleOverlay();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('toggle_overlay');
    }
    throw new Error('No platform API available');
  },

  executeAction: async (actionConfig: any) => {
    if (isElectron()) {
      return window.electronAPI!.executeAction(actionConfig);
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('execute_action', { actionConfig });
    }
    throw new Error('No platform API available');
  },

  getCurrentProfile: async () => {
    if (!isElectron() && !isTauri()) {
      await waitForElectronAPI();
    }
    
    if (isElectron()) {
      return window.electronAPI!.getCurrentProfile();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_current_profile');
    }
    throw new Error('No platform API available');
  },

  getCurrentPage: async () => {
    if (isElectron()) {
      return window.electronAPI!.getCurrentPage();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_current_page');
    }
    throw new Error('No platform API available');
  },

  getNavigationContext: async () => {
    if (isElectron()) {
      return window.electronAPI!.getNavigationContext();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_navigation_context');
    }
    throw new Error('No platform API available');
  },

  getAllProfiles: async () => {
    if (isElectron()) {
      return window.electronAPI!.getAllProfiles();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_all_profiles');
    }
    throw new Error('No platform API available');
  },

  getCurrentProfilePages: async () => {
    if (isElectron()) {
      return window.electronAPI!.getCurrentProfilePages();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_current_profile_pages');
    }
    throw new Error('No platform API available');
  },

  switchToProfile: async (profileIndex: number) => {
    if (isElectron()) {
      return window.electronAPI!.switchToProfile(profileIndex);
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('switch_to_profile', { profileIndex });
    }
    throw new Error('No platform API available');
  },

  switchToProfileByName: async (profileName: string) => {
    if (isElectron()) {
      return window.electronAPI!.switchToProfileByName(profileName);
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('switch_to_profile_by_name', { profileName });
    }
    throw new Error('No platform API available');
  },

  switchToPage: async (pageIndex: number) => {
    if (isElectron()) {
      return window.electronAPI!.switchToPage(pageIndex);
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('switch_to_page', { pageIndex });
    }
    throw new Error('No platform API available');
  },

  nextPage: async () => {
    if (isElectron()) {
      return window.electronAPI!.nextPage();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('next_page');
    }
    throw new Error('No platform API available');
  },

  previousPage: async () => {
    if (isElectron()) {
      return window.electronAPI!.previousPage();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('previous_page');
    }
    throw new Error('No platform API available');
  },

  onFileDrop: (callback: (files: string[]) => void) => {
    if (isElectron()) {
      window.electronAPI!.onFileDrop(callback);
    } else if (isTauri()) {
      // Tauri file drop handling
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        const currentWindow = getCurrentWindow();
        currentWindow.listen('tauri://file-drop', (event) => {
          callback(event.payload as string[]);
        });
      });
    }
  },

  onProfileChanged: (callback: (profileInfo: any) => void) => {
    if (isElectron()) {
      window.electronAPI!.onProfileChanged(callback);
    } else if (isTauri()) {
      // Tauri profile change handling
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen('profile-changed', (event) => {
          callback(event.payload);
        });
      });
    }
  },

  getPlatform: () => {
    if (isElectron()) {
      return window.electronAPI!.platform;
    } else if (isTauri()) {
      return 'tauri';
    }
    return 'unknown';
  },

  extractIcon: async (exePath: string): Promise<{ success: boolean; iconPath?: string; message?: string }> => {
    if (isElectron()) {
      return window.electronAPI!.extractIcon(exePath);
    } else if (isTauri()) {
      // Tauri implementation would go here
      // For now, return failure
      return { success: false, message: 'Icon extraction not implemented for Tauri' };
    }
    throw new Error('No platform API available');
  },

  extractFileIcon: async (filePath: string): Promise<{ success: boolean; dataUrl?: string; message?: string }> => {
    if (isElectron()) {
      return window.electronAPI!.extractFileIcon(filePath);
    } else if (isTauri()) {
      // Tauri implementation would go here
      return { success: false, message: 'File icon extraction not implemented for Tauri' };
    }
    throw new Error('No platform API available');
  },

  getIconPath: async (relativePath: string) => {
    if (isElectron()) {
      return window.electronAPI!.getIconPath(relativePath);
    } else if (isTauri()) {
      // Tauri implementation would go here
      return relativePath;
    }
    throw new Error('No platform API available');
  },

  setDragState: (dragging: boolean) => {
    if (isElectron()) {
      // Electron implementation - could be used for overlay focus management
      logger.log('Drag state changed:', dragging);
    } else if (isTauri()) {
      // Tauri implementation would go here
      logger.log('Drag state changed:', dragging);
    }
  }
};

export default platformAPI;
