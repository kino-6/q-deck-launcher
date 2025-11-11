/**
 * Configuration IPC Handlers
 * 
 * Handles IPC communication for configuration management.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);

/**
 * Create get-config handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @returns {Function} IPC handler function
 */
export function createGetConfigHandler(getConfig) {
  return async () => {
    return getConfig();
  };
}

/**
 * Create save-config handler
 * 
 * @param {Function} saveConfigFn - Function to save config
 * @param {Function} registerHotkeysFn - Function to re-register hotkeys
 * @returns {Function} IPC handler function
 */
export function createSaveConfigHandler(saveConfigFn, registerHotkeysFn) {
  return async (event, newConfig) => {
    try {
      saveConfigFn(newConfig);
      
      // Re-register hotkeys with new config
      registerHotkeysFn();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save config:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };
}

/**
 * Register all config-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} configManager - Config manager object with methods
 */
export function registerConfigHandlers(ipcMain, configManager) {
  ipcMain.handle('get-config', createGetConfigHandler(configManager.getConfig));
  ipcMain.handle('save-config', createSaveConfigHandler(
    configManager.saveConfig,
    configManager.registerHotkeys
  ));
  
  log('Config IPC handlers registered');
}
