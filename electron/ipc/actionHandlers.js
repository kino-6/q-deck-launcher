/**
 * Action IPC Handlers
 * 
 * Handles IPC communication for action execution.
 * Provides a clean separation between IPC layer and action execution logic.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);
const error = (...args) => console.error(...args);

/**
 * Create action execution handler
 * 
 * @param {ActionExecutor} actionExecutor - The action executor instance
 * @returns {Function} IPC handler function
 */
export function createExecuteActionHandler(actionExecutor) {
  return async (event, actionConfig) => {
    log('Executing action:', actionConfig);
    
    try {
      // Validate action config
      if (!actionConfig) {
        return {
          success: false,
          message: 'Action configuration is required'
        };
      }
      
      // Execute the action
      const result = await actionExecutor.execute(actionConfig);
      
      // Log result
      if (result.success) {
        log('Action executed successfully:', result.message);
      } else {
        error('Action execution failed:', result.message);
      }
      
      return result;
    } catch (err) {
      error('Action execution error:', err);
      return {
        success: false,
        message: `Unexpected error: ${err.message}`
      };
    }
  };
}

/**
 * Register all action-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {ActionExecutor} actionExecutor - The action executor instance
 */
export function registerActionHandlers(ipcMain, actionExecutor) {
  // Register execute-action handler
  ipcMain.handle('execute-action', createExecuteActionHandler(actionExecutor));
  
  log('Action IPC handlers registered');
}
