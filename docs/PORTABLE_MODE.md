# Q-Deck Portable Mode

## Overview

Q-Deck supports portable mode, allowing you to run the application from a USB drive or any directory without installation. In portable mode, all configuration files and data are stored in the same directory as the executable, making it easy to move the application between computers.

## How Portable Mode Works

### Automatic Detection

Q-Deck automatically detects whether to run in portable mode by checking for a `config.yaml` file in the application directory:

1. **Portable Mode**: If `config.yaml` exists in the same directory as the executable, Q-Deck runs in portable mode
2. **Normal Mode**: If no `config.yaml` exists in the application directory, Q-Deck uses the standard AppData location

### File Locations

#### Portable Mode
```
Q-Deck Launcher.exe
├── config.yaml          (configuration file)
└── icon-cache/          (cached icons)
    ├── icon1.png
    └── icon2.png
```

#### Normal Mode
```
%APPDATA%\q-deck-launcher\
├── config.yaml          (configuration file)
└── icon-cache/          (cached icons)
    ├── icon1.png
    └── icon2.png
```

## Creating a Portable Installation

### Method 1: Build Portable Version

1. Build the portable executable:
   ```powershell
   npm run electron:build:win
   ```

2. Find the portable executable in the `release` directory:
   ```
   release/Q-Deck Launcher.exe
   ```

3. Copy the executable to your desired location (e.g., USB drive)

4. Create a `config.yaml` file in the same directory as the executable

5. Run the executable - it will automatically use portable mode

### Method 2: Convert Existing Installation

1. Locate your existing config file:
   ```
   %APPDATA%\q-deck-launcher\config.yaml
   ```

2. Copy the config file to the same directory as the Q-Deck executable

3. Restart Q-Deck - it will now run in portable mode

## Benefits of Portable Mode

- **No Installation Required**: Run directly from any location
- **Easy Backup**: Simply copy the entire directory
- **Portable Configuration**: Take your settings with you
- **Multi-Computer Use**: Use the same configuration on different computers
- **USB Drive Friendly**: Perfect for running from external drives
- **No Registry Changes**: Leaves no traces on the host system

## Switching Between Modes

### From Normal to Portable Mode

1. Copy `%APPDATA%\q-deck-launcher\config.yaml` to the application directory
2. Restart Q-Deck

### From Portable to Normal Mode

1. Delete or rename `config.yaml` from the application directory
2. Restart Q-Deck
3. Q-Deck will create a new config in AppData

## Technical Details

### Configuration Path Detection

The application uses the following logic to determine the config path:

```javascript
function getConfigPath() {
  const appDir = path.dirname(app.getPath('exe'));
  const portableConfigPath = path.join(appDir, 'config.yaml');
  
  // Check if portable config exists
  if (fs.existsSync(portableConfigPath)) {
    return portableConfigPath; // Portable mode
  }
  
  // Use normal mode (AppData)
  return path.join(app.getPath('userData'), 'config.yaml');
}
```

### Icon Cache Location

The icon cache is always stored relative to the config file location:

- **Portable Mode**: `<app-directory>/icon-cache/`
- **Normal Mode**: `%APPDATA%\q-deck-launcher\icon-cache/`

## Requirements

- Windows 10/11 (64-bit)
- WebView2 Runtime (included in Windows 10/11)
- Write permissions in the application directory (for portable mode)

## Troubleshooting

### Portable Mode Not Detected

**Problem**: Q-Deck still uses AppData even though config.yaml exists in the app directory

**Solutions**:
1. Ensure `config.yaml` is in the same directory as the executable
2. Check file permissions - the application needs read access
3. Verify the file is named exactly `config.yaml` (case-sensitive on some systems)

### Cannot Save Configuration

**Problem**: Changes to configuration are not saved in portable mode

**Solutions**:
1. Check write permissions in the application directory
2. Ensure the directory is not read-only
3. If running from a CD/DVD, copy to a writable location first

### Icon Cache Issues

**Problem**: Icons are not cached or displayed incorrectly

**Solutions**:
1. Ensure the `icon-cache` directory can be created
2. Check write permissions in the application directory
3. Delete the `icon-cache` folder and restart to regenerate

## Security Considerations

### Portable Mode Security

- **File Permissions**: Ensure the portable directory has appropriate permissions
- **USB Drive Security**: Use encrypted USB drives for sensitive configurations
- **Backup**: Regularly backup your portable configuration
- **Antivirus**: Some antivirus software may flag portable executables

### Best Practices

1. **Use Trusted Locations**: Only run portable mode from trusted directories
2. **Regular Updates**: Keep the portable version updated
3. **Backup Configuration**: Maintain backups of your config.yaml
4. **Secure Storage**: Store portable installations on encrypted drives if needed

## Testing Portable Mode

### Automated Tests

Run the portable mode test suite:

```powershell
.\test-portable-mode.ps1
```

### Manual Testing

1. Build the portable version
2. Copy the executable to a test directory
3. Create a `config.yaml` file in the same directory
4. Run the executable
5. Verify the application uses the local config
6. Check that `icon-cache` is created in the same directory
7. Make configuration changes and verify they're saved locally

## Related Requirements

This feature implements:
- **Requirement 4.2**: "Q-Deckシステムは設定ファイルがアプリケーションディレクトリに存在する場合、ポータブルモードをサポートすること"

## See Also

- [Configuration Guide](./README.md#configuration)
- [Build Instructions](./HOW_TO_RUN.md#building)
- [Troubleshooting Guide](./README.md#troubleshooting)
