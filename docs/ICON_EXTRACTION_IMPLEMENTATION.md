# Icon Extraction Implementation

## Overview

The icon extraction feature automatically extracts icons from Windows executable files (.exe) when they are dropped onto the Q-Deck grid. This provides a more visually appealing and recognizable button appearance.

## Implementation Details

### Architecture

The icon extraction system consists of three main components:

1. **Electron Main Process** (`electron/main.js`)
   - Uses Electron's `app.getFileIcon()` API to extract icons
   - Caches extracted icons as PNG files
   - Provides IPC handlers for icon extraction

2. **Platform API** (`src/lib/platform-api.ts`)
   - Provides a unified interface for icon extraction
   - Works with both Electron and Tauri (Tauri support pending)

3. **UI Components**
   - `GridDragDrop.tsx`: Automatically extracts icons when .exe files are dropped
   - `ActionButton.tsx`: Displays extracted icons using file:// protocol

### Icon Extraction Flow

```
1. User drops .exe file onto grid
   ↓
2. GridDragDrop detects file extension
   ↓
3. Calls tauriAPI.extractExecutableIcon(exePath)
   ↓
4. Electron main process:
   - Uses app.getFileIcon() to extract icon
   - Saves icon as PNG in icon-cache directory
   - Returns relative path to cached icon
   ↓
5. Button is created with icon path
   ↓
6. ActionButton component displays icon using file:// protocol
```

### Icon Cache

Extracted icons are cached in the user's application data directory:

- **Windows**: `%APPDATA%\q-deck-launcher\icon-cache\`
- **macOS**: `~/Library/Application Support/q-deck-launcher/icon-cache/`
- **Linux**: `~/.config/q-deck-launcher/icon-cache/`

Icons are named using a base64-encoded hash of the executable path to ensure uniqueness and avoid conflicts.

### API Reference

#### Electron Main Process

```javascript
// Extract icon from executable
async function extractIconFromExe(exePath)
// Returns: relative path to cached icon or null

// IPC Handler
ipcMain.handle('extract-icon', async (event, exePath) => {
  // Returns: { success: boolean, iconPath?: string, message?: string }
})

// Get full path to cached icon
ipcMain.handle('get-icon-path', async (event, relativePath) => {
  // Returns: full path to icon file
})
```

#### Platform API

```typescript
// Extract icon from executable
tauriAPI.extractExecutableIcon(exePath: string): Promise<IconInfo>

// IconInfo structure
interface IconInfo {
  path: string;
  icon_type: 'Emoji' | 'File' | 'Extracted' | 'Url' | 'Base64';
  size?: IconSize;
  data_url?: string;
  extracted_from?: string;
}
```

### Error Handling

The icon extraction system handles errors gracefully:

1. **File not found**: Returns null, button uses default icon
2. **No icon in executable**: Returns null, button uses default icon
3. **Extraction failure**: Logs error, button uses default icon
4. **Display failure**: Falls back to default icon (🚀 for LaunchApp)

### Testing

#### Unit Tests

Run the icon extraction tests:

```bash
npm run test -- GridDragDrop.iconextraction.test.tsx
```

#### Manual Testing

1. Start the application:
   ```bash
   npm run electron:dev
   ```

2. Press F11 to open the overlay

3. Drag and drop an executable file (e.g., notepad.exe, calc.exe) onto the grid

4. Verify:
   - Button is created with extracted icon
   - Icon is displayed correctly
   - Button launches the application when clicked

Test executables:
- `C:\Windows\System32\notepad.exe`
- `C:\Windows\System32\calc.exe`
- `C:\Windows\System32\mspaint.exe`

### Performance Considerations

- **Icon extraction**: ~50-200ms per executable (cached after first extraction)
- **Cache lookup**: <1ms for previously extracted icons
- **Memory usage**: ~50KB per cached icon (PNG format)

### Future Enhancements

1. **Icon size options**: Allow users to choose icon size (small, medium, large)
2. **Custom icons**: Allow users to replace extracted icons with custom images
3. **Icon preview**: Show icon preview during drag operation
4. **Batch extraction**: Extract icons for multiple files in parallel
5. **Cache management**: Automatic cleanup of unused cached icons
6. **Tauri support**: Implement icon extraction for Tauri platform

## Configuration

No additional configuration is required. Icon extraction is automatically enabled for all .exe files dropped onto the grid.

## Troubleshooting

### Icons not displaying

1. Check the icon cache directory exists:
   - Windows: `%APPDATA%\q-deck-launcher\icon-cache\`

2. Check console for errors:
   - Open DevTools (F12)
   - Look for icon extraction errors

3. Verify file permissions:
   - Ensure the application has read access to the executable
   - Ensure the application has write access to the cache directory

### Icons appear as default (🚀)

This is expected behavior when:
- The executable has no embedded icon
- Icon extraction fails
- The icon file is corrupted

### Cache cleanup

To clear the icon cache:

1. Close the application
2. Delete the icon-cache directory:
   ```powershell
   Remove-Item "$env:APPDATA\q-deck-launcher\icon-cache" -Recurse -Force
   ```
3. Restart the application

## Related Files

- `electron/main.js` - Icon extraction implementation
- `electron/preload.cjs` - IPC API exposure
- `src/lib/electron-adapter.ts` - Platform adapter
- `src/lib/platform-api.ts` - Unified API
- `src/components/GridDragDrop.tsx` - Drag & drop with icon extraction
- `src/components/ActionButton.tsx` - Icon display
- `src/components/GridDragDrop.iconextraction.test.tsx` - Unit tests
