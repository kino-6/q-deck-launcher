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
 * Create extract-file-icon handler
 * Extracts icon for any file type using Windows Shell API
 * 
 * @param {Object} app - Electron app instance
 * @returns {Function} IPC handler function
 */
export function createExtractFileIconHandler(app) {
  return async (event, filePath) => {
    log('IPC: extract-file-icon called for:', filePath);
    
    try {
      // Use Electron's app.getFileIcon to extract icon for any file type
      const icon = await app.getFileIcon(filePath, { size: 'large' });
      
      if (!icon || icon.isEmpty()) {
        log('No icon found for file:', filePath);
        return {
          success: false,
          message: 'No icon found'
        };
      }

      // Convert to PNG data URL
      const pngBuffer = icon.toPNG();
      const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      
      log('Icon extracted successfully for:', filePath);
      return {
        success: true,
        dataUrl: dataUrl,
        iconType: 'file'
      };
    } catch (err) {
      error('IPC: extract-file-icon failed:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };
}

/**
 * Register all utility-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} utilityManager - Utility manager object with methods
 * @param {Object} app - Electron app instance
 */
export function registerUtilityHandlers(ipcMain, utilityManager, app) {
  ipcMain.handle('extract-icon', createExtractIconHandler(utilityManager.extractIcon));
  ipcMain.handle('get-icon-path', createGetIconPathHandler(utilityManager.getIconPath));
  ipcMain.handle('send-file-paths', createSendFilePathsHandler());
  ipcMain.handle('extract-file-icon', createExtractFileIconHandler(app));
  
  log('Utility IPC handlers registered');
}
