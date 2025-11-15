# Task 3.5: Windows Terminal and WSL Support Implementation

## Overview

This document describes the implementation of Windows Terminal and WSL (Windows Subsystem for Linux) support for the Terminal action in Q-Deck Launcher.

## Implementation Date

2024-11-11

## Changes Made

### 1. Main Process (electron/main.js)

Added support for two new terminal types:

#### Windows Terminal Support

- **Terminal Type**: `WindowsTerminal`
- **Executable**: `wt.exe`
- **Features**:
  - Profile selection via `-p` flag
  - Working directory via `-d` flag
  - Command execution (passed to PowerShell or Cmd based on profile)
  - Environment variable support

**Command Format**:
```bash
wt.exe [-p profile] [-d workdir] [command]
```

**Example Configurations**:
```yaml
# Basic Windows Terminal
config:
  terminal: 'WindowsTerminal'

# With PowerShell profile
config:
  terminal: 'WindowsTerminal'
  profile: 'PowerShell'

# With working directory
config:
  terminal: 'WindowsTerminal'
  workdir: 'C:\Projects'

# With command
config:
  terminal: 'WindowsTerminal'
  command: 'git status'

# Full configuration
config:
  terminal: 'WindowsTerminal'
  profile: 'PowerShell'
  workdir: 'C:\Projects\MyRepo'
  command: 'git status'
  env:
    MY_VAR: 'value'
```

#### WSL Support

- **Terminal Type**: `WSL`
- **Executable**: `wsl.exe`
- **Features**:
  - Distribution selection via `-d` flag
  - Working directory via `--cd` flag (with automatic Windows-to-WSL path conversion)
  - Command execution via `--exec bash -c`
  - Environment variable support

**Command Format**:
```bash
wsl.exe [-d distribution] [--cd workdir] [--exec bash -c command]
```

**Path Conversion**:
- Windows paths (e.g., `C:\Projects`) are automatically converted to WSL paths (e.g., `/mnt/c/Projects`)
- Conversion logic: Replace backslashes with forward slashes, convert drive letter to `/mnt/[drive]`

**Example Configurations**:
```yaml
# Basic WSL
config:
  terminal: 'WSL'

# With Ubuntu distribution
config:
  terminal: 'WSL'
  profile: 'Ubuntu'

# With working directory (Windows path)
config:
  terminal: 'WSL'
  workdir: 'C:\Projects'  # Converted to /mnt/c/Projects

# With command
config:
  terminal: 'WSL'
  command: 'ls -la'

# Full configuration
config:
  terminal: 'WSL'
  profile: 'Ubuntu'
  workdir: 'C:\Projects\MyRepo'
  command: 'git status'
  env:
    MY_VAR: 'value'
```

### 2. Test Coverage (src/components/TerminalAction.test.tsx)

Added comprehensive test suites for both Windows Terminal and WSL:

#### Windows Terminal Tests (5 tests)
1. Basic launch
2. Launch with profile
3. Launch with working directory
4. Launch with command
5. Launch with all options combined

#### WSL Tests (5 tests)
1. Basic launch
2. Launch with distribution
3. Launch with working directory
4. Launch with command
5. Launch with all options combined

**Total Tests**: 24 (including existing PowerShell and Cmd tests)
**Test Status**: ✅ All passing

### 3. Manual Test Script (test-windows-terminal-wsl.ps1)

Created a PowerShell script to manually test Windows Terminal and WSL functionality:

**Features**:
- Checks if Windows Terminal is installed
- Checks if WSL is installed and lists available distributions
- Provides 8 interactive tests:
  1. Launch Windows Terminal
  2. Launch Windows Terminal with PowerShell profile
  3. Launch Windows Terminal with working directory
  4. Launch Windows Terminal with command
  5. Launch WSL
  6. Launch WSL with specific distribution
  7. Launch WSL with working directory
  8. Launch WSL with command

**Usage**:
```powershell
.\test-windows-terminal-wsl.ps1
```

## Technical Details

### Windows Terminal Implementation

```javascript
if (terminalType === 'WindowsTerminal') {
  terminalPath = 'wt.exe';
  terminalArgs = [];
  
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
    const shellCommand = profile && profile.toLowerCase().includes('cmd') 
      ? `cmd.exe /K ${command}`
      : `powershell.exe -NoExit -Command "${command.replace(/"/g, '\\"')}"`;
    terminalArgs.push(shellCommand);
  }
}
```

### WSL Implementation

```javascript
if (terminalType === 'WSL') {
  terminalPath = 'wsl.exe';
  terminalArgs = [];
  
  // Add distribution if specified in profile
  if (profile) {
    terminalArgs.push('-d', profile);
  }
  
  // Change directory in WSL if specified
  if (workdir) {
    // Convert Windows path to WSL path
    const wslPath = workdir
      .replace(/\\/g, '/')
      .replace(/^([A-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
    terminalArgs.push('--cd', wslPath);
  }
  
  // Add command if specified
  if (command) {
    terminalArgs.push('--exec', 'bash', '-c', command);
  } else {
    terminalArgs.push('--exec', 'bash');
  }
}
```

## Requirements Satisfied

This implementation satisfies the following requirements from the requirements document:

- **Requirement 12.1**: Support for configurable terminal applications (Windows Terminal, WSL)
- **Requirement 12.2**: Specify working directory for each Terminal action
- **Requirement 12.3**: Set environment variables for terminal launch
- **Requirement 12.4**: Support for multiple terminal tabs/windows (via Windows Terminal)
- **Requirement 12.5**: Specify terminal profiles (Windows Terminal profiles, WSL distributions)

## Testing

### Automated Tests

Run the test suite:
```bash
npm test -- TerminalAction.test.tsx
```

**Expected Result**: All 24 tests pass

### Manual Testing

1. **Test Windows Terminal** (requires Windows Terminal installed):
   ```powershell
   .\test-windows-terminal-wsl.ps1
   ```

2. **Test in Q-Deck Application**:
   - Launch the application: `.\launch.ps1`
   - Press F11 to open overlay
   - Right-click on grid → Settings
   - Add a button with Terminal action
   - Set terminal type to "WindowsTerminal" or "WSL"
   - Configure profile, workdir, command as needed
   - Click the button to test

### Example Button Configurations

#### Windows Terminal Button
```yaml
position: { row: 1, col: 1 }
action_type: 'Terminal'
label: 'Windows Terminal'
icon: '🪟'
config:
  terminal: 'WindowsTerminal'
  profile: 'PowerShell'
  workdir: 'C:\Projects'
```

#### WSL Button
```yaml
position: { row: 1, col: 2 }
action_type: 'Terminal'
label: 'Ubuntu'
icon: '🐧'
config:
  terminal: 'WSL'
  profile: 'Ubuntu'
  workdir: 'C:\Projects'
  command: 'ls -la'
```

## Known Limitations

1. **Windows Terminal**: Requires Windows Terminal to be installed (available from Microsoft Store)
2. **WSL**: Requires WSL to be installed and configured (`wsl --install`)
3. **Path Conversion**: WSL path conversion assumes standard `/mnt/` mount points
4. **Command Execution**: Commands in Windows Terminal are passed to PowerShell by default (unless profile contains "cmd")

## Future Enhancements

Possible improvements for future versions:

1. **Auto-detection**: Automatically detect if Windows Terminal or WSL is installed
2. **Profile Discovery**: List available Windows Terminal profiles and WSL distributions
3. **Custom Mount Points**: Support for custom WSL mount points
4. **Tab Management**: Support for opening multiple tabs in the same Windows Terminal window
5. **WSL2 Features**: Support for WSL2-specific features (e.g., GPU acceleration)

## Verification Checklist

- [x] Windows Terminal support implemented
- [x] WSL support implemented
- [x] Working directory support for both
- [x] Environment variable support for both
- [x] Command execution support for both
- [x] Profile/distribution selection support
- [x] Path conversion for WSL (Windows → WSL paths)
- [x] Automated tests added (10 new tests)
- [x] Manual test script created
- [x] Documentation created
- [x] All tests passing

## Conclusion

Windows Terminal and WSL support has been successfully implemented and tested. Users can now launch Windows Terminal with various profiles and WSL with different distributions directly from Q-Deck buttons, with full support for working directories, commands, and environment variables.
