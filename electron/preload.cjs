const { contextBridge, ipcRenderer } = require('electron');

// Simple logger for preload script (only logs in development)
const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);
const warn = (...args) => console.warn(...args);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
log('Preload script executing...');

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
  getAllProfiles: () => ipcRenderer.invoke('get-all-profiles'),
  getCurrentProfilePages: () => ipcRenderer.invoke('get-current-profile-pages'),
  switchToProfile: (profileIndex) => ipcRenderer.invoke('switch-to-profile', profileIndex),
  switchToProfileByName: (profileName) => ipcRenderer.invoke('switch-to-profile-by-name', profileName),
  switchToPage: (pageIndex) => ipcRenderer.invoke('switch-to-page', pageIndex),
  nextPage: () => ipcRenderer.invoke('next-page'),
  previousPage: () => ipcRenderer.invoke('previous-page'),
  
  // File drop events
  onFileDrop: (callback) => {
    ipcRenderer.on('file-drop-paths', (event, filePaths) => {
      log('Received file paths from main process');
      callback(filePaths);
    });
  },
  
  // Profile change events
  onProfileChanged: (callback) => {
    ipcRenderer.on('profile-changed', (event, profileInfo) => {
      log('Profile changed:', profileInfo);
      callback(profileInfo);
    });
  },
  
  // Send file paths from injected code to main process
  sendFilePaths: (filePaths) => {
    log('Sending file paths to main process');
    return ipcRenderer.invoke('send-file-paths', filePaths);
  },
  
  // Get file paths from File objects (Electron 28 has File.path support)
  getFilePathsFromFiles: (files) => {
    log('Getting file paths from File objects:', files.length);
    const filePaths = [];
    
    for (const file of files) {
      // In Electron 28, File objects have a 'path' property
      if (file.path) {
        filePaths.push(file.path);
      } else {
        warn('File path not available for:', file.name);
      }
    }
    
    return filePaths;
  },
  
  // Icon extraction
  extractIcon: (exePath) => ipcRenderer.invoke('extract-icon', exePath),
  getIconPath: (relativePath) => ipcRenderer.invoke('get-icon-path', relativePath),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

log('Preload script loaded successfully');
