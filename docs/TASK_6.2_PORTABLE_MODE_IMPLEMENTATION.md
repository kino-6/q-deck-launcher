# Task 6.2: Portable Mode Implementation

## Overview

Implemented portable mode support for Q-Deck Launcher, allowing the application to run from any directory (including USB drives) without installation. The application automatically detects portable mode by checking for a config.yaml file in the application directory.

## Implementation Details

### 1. Automatic Portable Mode Detection

**File**: `electron/main.js`

Added `getConfigPath()` function that:
- Checks if `config.yaml` exists in the application directory (same directory as the executable)
- If found, uses portable mode (config stored alongside executable)
- If not found, uses normal mode (config stored in AppData)

```javascript
function getConfigPath() {
  const appDir = path.dirname(app.getPath('exe'));
  const portableConfigPath = path.join(appDir, 'config.yaml');
  
  // Check if portable config exists
  if (fs.existsSync(portableConfigPath)) {
    log('Portable mode detected: using config from application directory');
    return portableConfigPath;
  }
  
  // Use normal mode (AppData)
  return path.join(app.getPath('userData'), 'config.yaml');
}
```

### 2. Icon Cache Location

Updated icon cache path to be relative to the config file location:

```javascript
const configDir = path.dirname(configPath);
const iconCachePath = path.join(configDir, 'icon-cache');
```

This ensures that in portable mode, icons are cached in the application directory, and in normal mode, they're cached in AppData.

### 3. Build Configuration

The `package.json` already includes portable target in electron-builder configuration:

```json
"build": {
  "win": {
    "target": [
      "nsis",
      "portable"
    ]
  }
}
```

## Testing

### Automated Tests

Created comprehensive unit tests in `electron/portableMode.test.js`:

✅ **All 8 tests passing:**
- Portable config detection when config.yaml exists in app directory
- AppData config usage when portable config doesn't exist
- Icon cache placement relative to config directory (portable mode)
- Icon cache placement relative to config directory (normal mode)
- App directory determination from exe path
- Windows-style path handling
- Electron-builder portable target configuration
- Output directory configuration

### Test Results

```
✓ electron/portableMode.test.js (8 tests) 3ms
  ✓ Portable Mode Configuration (6)
    ✓ should use portable config when config.yaml exists in app directory
    ✓ should use AppData config when portable config does not exist
    ✓ should place icon cache relative to config directory in portable mode
    ✓ should place icon cache relative to config directory in normal mode
    ✓ should correctly determine app directory from exe path
    ✓ should handle Windows-style paths correctly
  ✓ Portable Mode Build Configuration (2)
    ✓ should have portable target in electron-builder config
    ✓ should have correct output directory configured
```

### Manual Testing Script

Created `test-portable-mode.ps1` for manual verification:
- Checks electron-builder configuration
- Verifies getConfigPath function exists
- Validates portable mode detection logic
- Confirms icon cache path logic
- Builds portable version
- Provides manual testing instructions

## Documentation

Created comprehensive documentation in `PORTABLE_MODE.md`:

### Key Sections:
1. **Overview**: Explanation of portable mode concept
2. **How It Works**: Automatic detection mechanism
3. **File Locations**: Comparison of portable vs normal mode
4. **Creating Portable Installation**: Step-by-step guide
5. **Benefits**: Advantages of portable mode
6. **Switching Between Modes**: How to convert between modes
7. **Technical Details**: Implementation specifics
8. **Requirements**: System requirements
9. **Troubleshooting**: Common issues and solutions
10. **Security Considerations**: Best practices

## Requirements Satisfied

✅ **Requirement 4.2**: "Q-Deckシステムは設定ファイルがアプリケーションディレクトリに存在する場合、ポータブルモードをサポートすること"

The implementation fully satisfies this requirement by:
- Automatically detecting config.yaml in the application directory
- Using portable mode when config exists in app directory
- Falling back to AppData when portable config doesn't exist
- Storing all data (config + icon cache) relative to config location

## File Changes

### Modified Files:
1. **electron/main.js**
   - Added `getConfigPath()` function for portable mode detection
   - Updated config path initialization
   - Updated icon cache path to be relative to config directory

### New Files:
1. **electron/portableMode.test.js** - Unit tests for portable mode
2. **test-portable-mode.ps1** - Manual testing script
3. **PORTABLE_MODE.md** - Comprehensive documentation
4. **TASK_6.2_PORTABLE_MODE_IMPLEMENTATION.md** - This summary

## Build Instructions

### Building Portable Version

```powershell
# Build for Windows (includes both installer and portable)
npm run electron:build:win

# Output location
release/Q-Deck Launcher.exe  # Portable executable
```

### Using Portable Version

1. Copy the portable executable to desired location
2. Create `config.yaml` in the same directory
3. Run the executable - it will automatically use portable mode

## Verification Steps

### Automated Verification
```powershell
# Run unit tests
npm test electron/portableMode.test.js

# Run manual test script
.\test-portable-mode.ps1
```

### Manual Verification
1. Build the portable version
2. Copy executable to a test directory
3. Create a `config.yaml` file in the same directory
4. Run the executable
5. Verify application uses local config
6. Check that `icon-cache` folder is created in the same directory
7. Make configuration changes and verify they're saved locally
8. Delete `config.yaml` and restart - should switch to AppData mode

## Benefits of Implementation

1. **Zero Installation**: Run directly from any location
2. **USB Drive Friendly**: Perfect for portable use
3. **Easy Backup**: Simply copy the directory
4. **Multi-Computer**: Use same config on different machines
5. **No Registry Changes**: Leaves no traces on host system
6. **Automatic Detection**: No configuration needed
7. **Seamless Switching**: Easy to convert between modes

## Technical Highlights

1. **Clean Implementation**: Minimal code changes to main.js
2. **Backward Compatible**: Existing installations continue to work
3. **Path Handling**: Correctly handles Windows path separators
4. **Icon Cache**: Properly relocates cache based on mode
5. **Logging**: Includes debug logging for portable mode detection
6. **Testing**: Comprehensive test coverage

## Future Enhancements

Potential improvements for future versions:
1. Visual indicator in UI showing current mode (portable/normal)
2. Settings UI option to convert between modes
3. Portable mode indicator in window title
4. Export/import configuration between modes
5. Portable mode specific settings (e.g., relative paths)

## Conclusion

The portable mode implementation is complete and fully functional. It satisfies all requirements, includes comprehensive testing, and provides excellent documentation for users. The implementation is clean, maintainable, and follows best practices.

**Status**: ✅ Complete and tested
