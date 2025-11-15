# Window Close Behavior Implementation

## Overview
This document describes how Q-Deck Launcher handles window closing to ensure the app continues running in the system tray.

## Implementation

### Window Close Handler
The app uses Electron's `window-all-closed` event to prevent the application from quitting when all windows are closed:

```javascript
app.on('window-all-closed', () => {
  // Do nothing - app continues running
  log('All windows closed, but app continues running in system tray');
});
```

**Key Points:**
- The handler does **nothing** (no `app.quit()` call)
- This is the correct behavior for system tray applications
- The app continues running in the background
- Users can reopen windows via the system tray icon

### Quit Behavior
The app only quits when the user explicitly selects "Quit" from the system tray menu:

```javascript
{
  label: 'Quit',
  click: () => {
    log('Tray menu: Quit application');
    app.quit();
  }
}
```

## Platform Differences

### Windows/Linux
- App runs in system tray
- Closing all windows keeps app running
- User must select "Quit" from tray menu to exit

### macOS
- App runs in dock
- Standard macOS behavior applies
- Closing all windows keeps app running (typical for macOS apps)

## Testing

Tests are located in `electron/tray.test.js`:

```javascript
describe('App Lifecycle - Window Close Behavior', () => {
  it('should not quit app when all windows are closed', () => {
    // Verifies that closing windows doesn't call app.quit()
  });

  it('should only quit when user selects Quit from tray menu', () => {
    // Verifies that Quit menu item calls app.quit()
  });
});
```

Run tests with:
```bash
npx vitest run --config vitest.config.electron.ts electron/tray.test.js
```

## User Experience

1. **Closing Overlay (F11 or Escape)**: Hides the overlay window, app continues running
2. **Closing Settings Window**: Hides the settings window, app continues running
3. **Closing All Windows**: App continues running in system tray
4. **Quitting App**: User must select "Quit" from tray menu

This behavior ensures the app is always available via the F11 hotkey without needing to restart it.

## Related Files
- `electron/main.js` - Main process with window-all-closed handler
- `electron/tray.test.js` - Tests for tray and window close behavior
- `.kiro/specs/q-deck-launcher/tasks.md` - Task 6.0.9 (system tray implementation)
