/**
 * IPC Handlers Index
 * 
 * Central module for registering all IPC handlers.
 * Provides a clean separation of concerns and unified error handling.
 */

import { registerActionHandlers } from './actionHandlers.js';
import { registerConfigHandlers } from './configHandlers.js';
import { registerOverlayHandlers } from './overlayHandlers.js';
import { registerProfileHandlers } from './profileHandlers.js';
import { registerUtilityHandlers } from './utilityHandlers.js';
import { registerUpdateHandlers } from './updateHandlers.js';

/**
 * Register all IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} managers - Object containing all manager instances
 * @param {ActionExecutor} managers.actionExecutor - Action executor instance
 * @param {Object} managers.configManager - Config manager with getConfig, saveConfig, registerHotkeys
 * @param {Object} managers.overlayManager - Overlay manager with show/hide/toggle methods
 * @param {Object} managers.utilityManager - Utility manager with extractIcon, getIconPath methods
 * @param {Object} managers.profileStateManager - Profile state manager instance
 * @param {Object} managers.app - Electron app instance for file icon extraction
 * @param {Object} managers.autoUpdateManager - Auto-update manager instance (optional, only in production)
 */
export function registerAllHandlers(ipcMain, managers) {
  const {
    actionExecutor,
    configManager,
    overlayManager,
    utilityManager,
    profileStateManager,
    app,
    autoUpdateManager
  } = managers;
  
  // Register all handler groups
  registerActionHandlers(ipcMain, actionExecutor);
  registerConfigHandlers(ipcMain, configManager);
  registerOverlayHandlers(ipcMain, overlayManager);
  registerProfileHandlers(ipcMain, configManager.getConfig, profileStateManager);
  registerUtilityHandlers(ipcMain, utilityManager, app);
  
  // Register update handlers (only if autoUpdateManager is provided)
  if (autoUpdateManager) {
    registerUpdateHandlers(ipcMain, autoUpdateManager);
  }
  
  console.log('✅ All IPC handlers registered successfully');
}
