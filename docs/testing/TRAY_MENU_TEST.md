# Tray Context Menu - Manual Test Guide

## Test Objective
Verify that the system tray icon and context menu work correctly according to task requirements.

## Prerequisites
- Application built and ready to run
- Windows system tray visible

## Test Scenarios

### 1. Tray Icon Visibility
**Steps:**
1. Launch the application using `.\launch.ps1`
2. Look at the Windows system tray (bottom-right corner)

**Expected Result:**
- ✅ Q-Deck icon appears in system tray
- ✅ Icon is visible and recognizable

### 2. Tray Tooltip
**Steps:**
1. Hover mouse over the tray icon

**Expected Result:**
- ✅ Tooltip displays "Q-Deck Launcher"

### 3. Tray Left-Click (Toggle Overlay)
**Steps:**
1. Left-click the tray icon
2. Left-click the tray icon again

**Expected Result:**
- ✅ First click: Overlay appears
- ✅ Second click: Overlay disappears
- ✅ Behavior is same as F11 hotkey

### 4. Tray Right-Click (Context Menu)
**Steps:**
1. Right-click the tray icon

**Expected Result:**
- ✅ Context menu appears with 4 items:
  1. "Show/Hide Overlay"
  2. "Settings"
  3. (separator line)
  4. "Quit"

### 5. Context Menu - Show/Hide Overlay
**Steps:**
1. Right-click tray icon
2. Click "Show/Hide Overlay"
3. Repeat steps 1-2

**Expected Result:**
- ✅ First click: Overlay toggles (shows if hidden, hides if visible)
- ✅ Second click: Overlay toggles again
- ✅ Behavior is same as F11 hotkey

### 6. Context Menu - Settings
**Steps:**
1. Right-click tray icon
2. Click "Settings"

**Expected Result:**
- ✅ Settings window (mainWindow) opens
- ✅ Settings window comes to foreground and has focus

### 7. Context Menu - Quit
**Steps:**
1. Right-click tray icon
2. Click "Quit"

**Expected Result:**
- ✅ Application exits completely
- ✅ Tray icon disappears
- ✅ All windows close

### 8. App Continues Running When Windows Close
**Steps:**
1. Launch application
2. Press F11 to show overlay
3. Press F11 to hide overlay (or click outside)
4. Verify tray icon is still visible

**Expected Result:**
- ✅ Application continues running in system tray
- ✅ Tray icon remains visible
- ✅ Can still open overlay with F11 or tray click

### 9. App Only Quits via Tray Menu
**Steps:**
1. Launch application
2. Try to close all windows (if any are open)
3. Verify app is still running via tray icon
4. Right-click tray icon and select "Quit"

**Expected Result:**
- ✅ Closing windows doesn't quit the app
- ✅ App only quits when "Quit" is selected from tray menu
- ✅ Tray icon disappears after quit

## Test Results

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| 1. Tray Icon Visibility | ⬜ | |
| 2. Tray Tooltip | ⬜ | |
| 3. Tray Left-Click | ⬜ | |
| 4. Tray Right-Click | ⬜ | |
| 5. Show/Hide Overlay | ⬜ | |
| 6. Settings | ⬜ | |
| 7. Quit | ⬜ | |
| 8. App Continues Running | ⬜ | |
| 9. App Only Quits via Tray | ⬜ | |

## Notes
- All tests should pass for the tray context menu implementation to be considered complete
- If any test fails, document the issue and fix before marking task as complete
