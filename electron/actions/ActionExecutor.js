import { LaunchAppAction } from './LaunchAppAction.js';
import { OpenAction } from './OpenAction.js';
import { TerminalAction } from './TerminalAction.js';

/**
 * ActionExecutor - Unified interface for executing all action types
 * 
 * Provides a single entry point for executing actions by delegating to
 * specialized action handlers based on action type.
 */
export class ActionExecutor {
  constructor() {
    // Initialize action handlers
    this.handlers = {
      LaunchApp: new LaunchAppAction(),
      Open: new OpenAction(),
      Terminal: new TerminalAction()
    };
  }
  
  /**
   * Execute an action based on its type
   * 
   * @param {Object} actionConfig - Action configuration
   * @param {string} actionConfig.type - Action type (LaunchApp, Open, Terminal)
   * @param {...*} actionConfig - Additional action-specific configuration
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async execute(actionConfig) {
    const { type } = actionConfig;
    
    if (!type) {
      return {
        success: false,
        message: 'Action type is required'
      };
    }
    
    const handler = this.handlers[type];
    
    if (!handler) {
      return {
        success: false,
        message: `Unknown action type: ${type}`
      };
    }
    
    try {
      return await handler.execute(actionConfig);
    } catch (error) {
      return {
        success: false,
        message: `Action execution failed: ${error.message}`
      };
    }
  }
  
  /**
   * Register a custom action handler
   * 
   * @param {string} actionType - Action type name
   * @param {Object} handler - Handler object with execute method
   */
  registerHandler(actionType, handler) {
    if (!handler || typeof handler.execute !== 'function') {
      throw new Error('Handler must have an execute method');
    }
    
    this.handlers[actionType] = handler;
  }
  
  /**
   * Get list of supported action types
   * 
   * @returns {string[]}
   */
  getSupportedTypes() {
    return Object.keys(this.handlers);
  }
}
