# Manual Test: Window Close Behavior

## Purpose
Verify that the app continues running in the system tray when all windows are closed, and only quits when the user selects "Quit" from the tray menu.

## Prerequisites
- Q-Deck Launcher is installed or built
- System tray icon is visible

## Test Steps

### Test 1: Close Overlay Window
1. Launch Q-Deck Launcher
2. Press F11 to show the overlay
3. Press F11 or Escape to close the overlay
4. **Expected**: Overlay closes, but app continues running (tray icon still visible)
5. **Expected**: Pressing F11 again shows the overlay (app is still running)

### Test 2: Close Settings Window
1. Right-click the tray icon
2. Select "Settings" to open the settings window
3. Close the settings window (click X button)
4. **Expected**: Settings window closes, but app continues running (tray icon still visible)
5. **Expected**: Pressing F11 shows the overlay (app is still running)

### Test 3: Close All Windows
1. Press F11 to show the overlay
2. Right-click the tray icon and select "Settings"
3. Now you have both overlay and settings windows open
4. Close the overlay (F11 or Escape)
5. Close the settings window (click X button)
6. **Expected**: All windows are closed, but app continues running (tray icon still visible)
7. **Expected**: Pressing F11 shows the overlay (app is still running)

### Test 4: Quit from Tray Menu
1. Ensure app is running (tray icon visible)
2. Right-click the tray icon
3. Select "Quit" from the menu
4. **Expected**: App quits completely (tray icon disappears)
5. **Expected**: Pressing F11 does nothing (app is not running)
6. **Expected**: Need to restart the app to use it again

### Test 5: Tray Icon Click
1. Launch Q-Deck Launcher
2. Click the tray icon (left-click)
3. **Expected**: Overlay toggles (shows if hidden, hides if visible)
4. Click the tray icon again
5. **Expected**: Overlay toggles again

## Success Criteria
- ✅ Closing overlay doesn't quit the app
- ✅ Closing settings window doesn't quit the app
- ✅ Closing all windows doesn't quit the app
- ✅ App continues running in system tray
- ✅ F11 hotkey works after closing windows
- ✅ Tray icon remains visible until "Quit" is selected
- ✅ Only "Quit" from tray menu exits the app completely

## Troubleshooting

### Tray icon not visible
- Check Windows system tray settings
- Look in the hidden icons area (click ^ in system tray)

### F11 not working after closing windows
- This indicates the app quit unexpectedly
- Check the implementation in `electron/main.js`
- Verify `window-all-closed` handler doesn't call `app.quit()`

### App quits when closing windows
- This indicates the `window-all-closed` handler is not working correctly
- Verify the handler is registered in `electron/main.js`
- Check for any other code that might call `app.quit()`

## Related Files
- `electron/main.js` - Window close handler implementation
- `WINDOW_CLOSE_BEHAVIOR.md` - Technical documentation
- `electron/tray.test.js` - Automated tests
