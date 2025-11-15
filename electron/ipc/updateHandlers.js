/**
 * Update IPC Handlers
 * 
 * Handles IPC communication for auto-update functionality
 */

import logger from '../logger.js';

/**
 * Register update-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} autoUpdateManager - Auto-update manager instance
 */
export function registerUpdateHandlers(ipcMain, autoUpdateManager) {
  /**
   * Check for updates manually
   */
  ipcMain.handle('check-for-updates', async () => {
    try {
      logger.info('Manual update check requested via IPC');
      await autoUpdateManager.checkForUpdates();
      return { success: true };
    } catch (error) {
      logger.error('Failed to check for updates via IPC', { error: error.message });
      return { success: false, error: error.message };
    }
  });

  /**
   * Get current update configuration
   */
  ipcMain.handle('get-update-config', () => {
    try {
      const config = autoUpdateManager.getConfig();
      return { success: true, config };
    } catch (error) {
      logger.error('Failed to get update config via IPC', { error: error.message });
      return { success: false, error: error.message };
    }
  });

  /**
   * Update auto-update configuration
   */
  ipcMain.handle('update-update-config', async (event, newConfig) => {
    try {
      logger.info('Update config change requested via IPC', newConfig);
      autoUpdateManager.updateConfig(newConfig);
      return { success: true };
    } catch (error) {
      logger.error('Failed to update update config via IPC', { error: error.message });
      return { success: false, error: error.message };
    }
  });

  console.log('✅ Update IPC handlers registered');
}
