// Electron API type definitions

interface ElectronAPI {
  // Config
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<any>;
  
  // Overlay
  showOverlay: () => Promise<any>;
  hideOverlay: () => Promise<any>;
  toggleOverlay: () => Promise<any>;
  
  // Actions
  executeAction: (actionConfig: any) => Promise<any>;
  
  // Profile management
  getCurrentProfile: () => Promise<any>;
  getCurrentPage: () => Promise<any>;
  getNavigationContext: () => Promise<any>;
  
  // File drop events
  onFileDrop: (callback: (filePaths: string[]) => void) => void;
  sendFilePaths: (filePaths: string[]) => Promise<any>;
  getFilePathsFromFiles: (files: File[]) => string[]; // Synchronous in Electron 28
  
  // Icon extraction
  extractIcon: (exePath: string) => Promise<any>;
  getIconPath: (relativePath: string) => Promise<string>;
  
  // Platform info
  platform: string;
  isElectron: boolean;
}

interface Window {
  electronAPI?: ElectronAPI;
}
