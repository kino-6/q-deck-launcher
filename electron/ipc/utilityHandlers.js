/**
 * Utility IPC Handlers
 * 
 * Handles IPC communication for utility functions like icon extraction and file drops.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);
const error = (...args) => console.error(...args);

/**
 * Create extract-icon handler
 * 
 * @param {Function} extractIconFn - Function to extract icon from executable
 * @returns {Function} IPC handler function
 */
export function createExtractIconHandler(extractIconFn) {
  return async (event, exePath) => {
    log('IPC: extract-icon called for:', exePath);
    
    try {
      const iconPath = await extractIconFn(exePath);
      
      if (iconPath) {
        return {
          success: true,
          iconPath: iconPath
        };
      } else {
        return {
          success: false,
          message: 'Failed to extract icon'
        };
      }
    } catch (err) {
      error('IPC: extract-icon failed:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };
}

/**
 * Create get-icon-path handler
 * 
 * @param {Function} getIconPathFn - Function to get full icon path
 * @returns {Function} IPC handler function
 */
export function createGetIconPathHandler(getIconPathFn) {
  return async (event, relativePath) => {
    return getIconPathFn(relativePath);
  };
}

/**
 * Create send-file-paths handler
 * 
 * @returns {Function} IPC handler function
 */
export function createSendFilePathsHandler() {
  return async (event, filePaths) => {
    console.log('📥 Received file paths from injected code:', filePaths);
    
    // Send the file paths to the renderer via the file-drop-paths channel
    // This will be picked up by the onFileDrop listener in the React app
    event.sender.send('file-drop-paths', filePaths);
    
    return { success: true };
  };
}

/**
 * Register all utility-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} utilityManager - Utility manager object with methods
 */
export function registerUtilityHandlers(ipcMain, utilityManager) {
  ipcMain.handle('extract-icon', createExtractIconHandler(utilityManager.extractIcon));
  ipcMain.handle('get-icon-path', createGetIconPathHandler(utilityManager.getIconPath));
  ipcMain.handle('send-file-paths', createSendFilePathsHandler());
  
  log('Utility IPC handlers registered');
}
