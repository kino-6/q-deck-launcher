const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
console.log('🔧 Preload script executing...');
console.log('🔧 contextBridge available:', !!contextBridge);
console.log('🔧 ipcRenderer available:', !!ipcRenderer);

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
    ipcRenderer.on('file-drop-paths', (event, filePaths) => {
      console.log('📥 Received file paths from main process:', filePaths);
      callback(filePaths);
    });
  },
  
  // Send file paths from injected code to main process
  sendFilePaths: (filePaths) => {
    console.log('📤 Sending file paths to main process:', filePaths);
    return ipcRenderer.invoke('send-file-paths', filePaths);
  },
  
  // Get file paths from File objects (Electron 28 has File.path support)
  getFilePathsFromFiles: (files) => {
    console.log('📂 Getting file paths from File objects (Electron 28):', files.length);
    const filePaths = [];
    
    for (const file of files) {
      // In Electron 28, File objects have a 'path' property
      if (file.path) {
        console.log('📍 File path found:', file.path);
        filePaths.push(file.path);
      } else {
        console.warn('⚠️ File path not available for:', file.name);
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

console.log('✅ Preload script loaded successfully');
console.log('✅ electronAPI exposed to window');

// Verify electronAPI is accessible
if (typeof window !== 'undefined') {
  console.log('✅ window object is available in preload');
} else {
  console.log('⚠️ window object is NOT available in preload');
}
