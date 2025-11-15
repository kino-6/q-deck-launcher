import { shell } from 'electron';

/**
 * OpenAction - Handles opening files, folders, and URLs
 * 
 * Uses Electron's shell.openPath to open files and folders with their default applications.
 */
export class OpenAction {
  /**
   * Execute the Open action
   * 
   * @param {Object} actionConfig - Action configuration
   * @param {string} actionConfig.target - Path to file/folder or URL to open
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async execute(actionConfig) {
    const { target } = actionConfig;
    
    if (!target) {
      return {
        success: false,
        message: 'Target path is required'
      };
    }
    
    try {
      const result = await shell.openPath(target);
      
      // shell.openPath returns an empty string on success, or an error message on failure
      if (result === '') {
        return {
          success: true,
          message: `Opened ${target}`
        };
      } else {
        return {
          success: false,
          message: `Failed to open ${target}: ${result}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to open ${target}: ${error.message}`
      };
    }
  }
}
