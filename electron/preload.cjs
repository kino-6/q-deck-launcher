const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  
  // Overlay
  showOverlay: () => ipcRenderer.invoke('show-overlay'),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  
  // Actions
  executeAction: (actionConfig) => ipcRenderer.invoke('execute-action', actionConfig),
  
  // Profile management
  getCurrentProfile: () => ipcRenderer.invoke('get-current-profile'),
  getCurrentPage: () => ipcRenderer.invoke('get-current-page'),
  getNavigationContext: () => ipcRenderer.invoke('get-navigation-context'),
  
  // File drop events
  onFileDrop: (callback) => {
    ipcRenderer.on('file-drop', (event, files) => callback(files));
  },
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

console.log('Preload script loaded');
