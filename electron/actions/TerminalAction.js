import { spawn } from 'child_process';

/**
 * TerminalAction - Handles terminal launching
 * 
 * Supports PowerShell, Cmd, Windows Terminal, and WSL with optional commands,
 * working directories, and environment variables.
 */
export class TerminalAction {
  /**
   * Execute the Terminal action
   * 
   * @param {Object} actionConfig - Action configuration
   * @param {string} [actionConfig.terminal='PowerShell'] - Terminal type (PowerShell, Cmd, WindowsTerminal, WSL)
   * @param {string} [actionConfig.workdir] - Working directory
   * @param {string} [actionConfig.command] - Command to execute
   * @param {string} [actionConfig.profile] - Terminal profile name
   * @param {Object} [actionConfig.env] - Environment variables
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async execute(actionConfig) {
    const { terminal, workdir, command, profile, env } = actionConfig;
    
    // Determine which terminal to launch
    const terminalType = terminal || 'PowerShell'; // Default to PowerShell
    
    try {
      const { terminalPath, terminalArgs } = this._buildTerminalCommand(
        terminalType,
        workdir,
        command,
        profile
      );
      
      const options = {
        detached: true,
        stdio: 'ignore'
      };
      
      // Set working directory for terminals that don't handle it in args
      if (workdir && !this._handlesWorkdirInArgs(terminalType)) {
        options.cwd = workdir;
      }
      
      if (env) {
        options.env = { ...process.env, ...env };
      }
      
      const child = spawn(terminalPath, terminalArgs, options);
      child.unref();
      
      return {
        success: true,
        message: `Launched ${terminalType}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to launch ${terminalType}: ${error.message}`
      };
    }
  }
  
  /**
   * Build terminal command and arguments
   * 
   * @private
   * @param {string} terminalType - Type of terminal
   * @param {string} [workdir] - Working directory
   * @param {string} [command] - Command to execute
   * @param {string} [profile] - Terminal profile
   * @returns {{terminalPath: string, terminalArgs: string[]}}
   */
  _buildTerminalCommand(terminalType, workdir, command, profile) {
    switch (terminalType) {
      case 'PowerShell':
        return this._buildPowerShellCommand(workdir, command);
      
      case 'Cmd':
        return this._buildCmdCommand(workdir, command);
      
      case 'WindowsTerminal':
        return this._buildWindowsTerminalCommand(workdir, command, profile);
      
      case 'WSL':
        return this._buildWSLCommand(workdir, command, profile);
      
      default:
        throw new Error(`Unsupported terminal type: ${terminalType}`);
    }
  }
  
  /**
   * Build PowerShell command
   * 
   * @private
   */
  _buildPowerShellCommand(workdir, command) {
    const terminalPath = 'powershell.exe';
    const terminalArgs = ['-NoExit'];
    
    if (workdir) {
      terminalArgs.push('-Command', `Set-Location '${workdir}'`);
    }
    
    if (command) {
      if (workdir) {
        terminalArgs.push(';', command);
      } else {
        terminalArgs.push('-Command', command);
      }
    }
    
    return { terminalPath, terminalArgs };
  }
  
  /**
   * Build Cmd command
   * 
   * @private
   */
  _buildCmdCommand(workdir, command) {
    const terminalPath = 'cmd.exe';
    const terminalArgs = ['/K']; // Keep window open
    
    if (workdir) {
      terminalArgs.push('cd', '/d', workdir);
    }
    
    if (command) {
      if (workdir) {
        terminalArgs.push('&&', command);
      } else {
        terminalArgs.push(command);
      }
    }
    
    return { terminalPath, terminalArgs };
  }
  
  /**
   * Build Windows Terminal command
   * 
   * @private
   */
  _buildWindowsTerminalCommand(workdir, command, profile) {
    const terminalPath = 'wt.exe';
    const terminalArgs = [];
    
    // Add profile if specified
    if (profile) {
      terminalArgs.push('-p', profile);
    }
    
    // Add working directory if specified
    if (workdir) {
      terminalArgs.push('-d', workdir);
    }
    
    // Add command if specified
    if (command) {
      // For Windows Terminal, we need to pass the command to the shell
      // Use PowerShell by default unless profile specifies otherwise
      const shellCommand = profile && profile.toLowerCase().includes('cmd') 
        ? `cmd.exe /K ${command}`
        : `powershell.exe -NoExit -Command "${command.replace(/"/g, '\\"')}"`;
      terminalArgs.push(shellCommand);
    }
    
    return { terminalPath, terminalArgs };
  }
  
  /**
   * Build WSL command
   * 
   * @private
   */
  _buildWSLCommand(workdir, command, profile) {
    const terminalPath = 'wsl.exe';
    const terminalArgs = [];
    
    // Add distribution if specified in profile
    if (profile) {
      terminalArgs.push('-d', profile);
    }
    
    // Change directory in WSL if specified
    // Convert Windows path to WSL path if needed
    if (workdir) {
      // Convert Windows path to WSL path (e.g., C:\Users\... -> /mnt/c/Users/...)
      const wslPath = workdir
        .replace(/\\/g, '/')
        .replace(/^([A-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
      terminalArgs.push('--cd', wslPath);
    }
    
    // Add command if specified
    if (command) {
      // Execute command in WSL
      terminalArgs.push('--exec', 'bash', '-c', command);
    } else {
      // Just open an interactive shell
      terminalArgs.push('--exec', 'bash');
    }
    
    return { terminalPath, terminalArgs };
  }
  
  /**
   * Check if terminal type handles working directory in arguments
   * 
   * @private
   * @param {string} terminalType - Type of terminal
   * @returns {boolean}
   */
  _handlesWorkdirInArgs(terminalType) {
    return terminalType === 'WindowsTerminal' || terminalType === 'WSL';
  }
}
