import { spawn } from 'child_process';

/**
 * LaunchAppAction - Handles application launching
 * 
 * Executes applications with optional arguments, working directory, and environment variables.
 */
export class LaunchAppAction {
  /**
   * Execute the LaunchApp action
   * 
   * @param {Object} actionConfig - Action configuration
   * @param {string} actionConfig.path - Path to the application executable
   * @param {string[]} [actionConfig.args] - Command line arguments
   * @param {string} [actionConfig.workdir] - Working directory
   * @param {Object} [actionConfig.env] - Environment variables
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async execute(actionConfig) {
    const { path: appPath, args, workdir, env } = actionConfig;
    
    if (!appPath) {
      return {
        success: false,
        message: 'Application path is required'
      };
    }
    
    try {
      const options = {
        detached: true,
        stdio: 'ignore'
      };
      
      if (workdir) {
        options.cwd = workdir;
      }
      
      if (env) {
        options.env = { ...process.env, ...env };
      }
      
      const child = spawn(appPath, args || [], options);
      child.unref();
      
      return {
        success: true,
        message: `Launched ${appPath}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to launch ${appPath}: ${error.message}`
      };
    }
  }
}
