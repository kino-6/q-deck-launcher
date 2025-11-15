/**
 * Action IPC Handlers
 * 
 * Handles IPC communication for action execution.
 * Provides a clean separation between IPC layer and action execution logic.
 */

import logger from '../logger.js';

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
    
    const startTime = Date.now();
    
    try {
      // Validate action config
      if (!actionConfig) {
        const errorMsg = 'Action configuration is required';
        logger.logAction('unknown', 'unknown', 'failure', 0, errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
      
      // Execute the action
      const result = await actionExecutor.execute(actionConfig);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Add action type to result for detection
      result.actionType = actionConfig.type;
      
      // Log result
      if (result.success) {
        log('Action executed successfully:', result.message, 'Type:', result.actionType);
        logger.logAction(
          actionConfig.type || 'unknown',
          actionConfig.label || 'unnamed',
          'success',
          executionTime,
          null,
          {
            path: actionConfig.path,
            target: actionConfig.target
          }
        );
      } else {
        error('Action execution failed:', result.message);
        logger.logAction(
          actionConfig.type || 'unknown',
          actionConfig.label || 'unnamed',
          'failure',
          executionTime,
          result.message,
          {
            path: actionConfig.path,
            target: actionConfig.target
          }
        );
      }
      
      return result;
    } catch (err) {
      const executionTime = Date.now() - startTime;
      error('Action execution error:', err);
      logger.logAction(
        actionConfig?.type || 'unknown',
        actionConfig?.label || 'unnamed',
        'error',
        executionTime,
        err.message,
        {
          error_stack: err.stack
        }
      );
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
