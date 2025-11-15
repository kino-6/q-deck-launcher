/**
 * Overlay IPC Handlers
 * 
 * Handles IPC communication for overlay window management.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);

/**
 * Create show-overlay handler
 * 
 * @param {Function} showOverlayFn - Function to show overlay
 * @returns {Function} IPC handler function
 */
export function createShowOverlayHandler(showOverlayFn) {
  return async () => {
    try {
      showOverlayFn();
      return { success: true };
    } catch (error) {
      console.error('Failed to show overlay:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };
}

/**
 * Create hide-overlay handler
 * 
 * @param {Function} hideOverlayFn - Function to hide overlay
 * @returns {Function} IPC handler function
 */
export function createHideOverlayHandler(hideOverlayFn) {
  return async () => {
    try {
      hideOverlayFn();
      return { success: true };
    } catch (error) {
      console.error('Failed to hide overlay:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };
}

/**
 * Create toggle-overlay handler
 * 
 * @param {Function} toggleOverlayFn - Function to toggle overlay
 * @returns {Function} IPC handler function
 */
export function createToggleOverlayHandler(toggleOverlayFn) {
  return async () => {
    try {
      toggleOverlayFn();
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle overlay:', error);
      return {
        success: false,
        message: error.message
      };
    }
  };
}

/**
 * Register all overlay-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} overlayManager - Overlay manager object with methods
 */
export function registerOverlayHandlers(ipcMain, overlayManager) {
  ipcMain.handle('show-overlay', createShowOverlayHandler(overlayManager.showOverlay));
  ipcMain.handle('hide-overlay', createHideOverlayHandler(overlayManager.hideOverlay));
  ipcMain.handle('toggle-overlay', createToggleOverlayHandler(overlayManager.toggleOverlay));
  
  log('Overlay IPC handlers registered');
}
