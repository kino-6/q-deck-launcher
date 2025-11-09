// Electron API adapter to replace Tauri API
// This allows the React UI to work with both Tauri and Electron

interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<any>;
  showOverlay: () => Promise<any>;
  hideOverlay: () => Promise<any>;
  toggleOverlay: () => Promise<any>;
  executeAction: (actionConfig: any) => Promise<any>;
  getCurrentProfile: () => Promise<any>;
  getCurrentPage: () => Promise<any>;
  getNavigationContext: () => Promise<any>;
  onFileDrop: (callback: (files: string[]) => void) => void;
  platform: string;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    __TAURI__?: any;
  }
}

// Check if running in Electron
export const isElectron = () => {
  return window.electronAPI?.isElectron === true;
};

// Check if running in Tauri
export const isTauri = () => {
  return window.__TAURI__ !== undefined;
};

// Unified API that works with both Electron and Tauri
export const platformAPI = {
  getConfig: async () => {
    if (isElectron()) {
      return window.electronAPI!.getConfig();
    } else if (isTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke('get_config');
    }
    throw new Error('No platform API available');
  },

  saveConfig: async (config: any) => {
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

  getPlatform: () => {
    if (isElectron()) {
      return window.electronAPI!.platform;
    } else if (isTauri()) {
      return 'tauri';
    }
    return 'unknown';
  }
};

export default platformAPI;
