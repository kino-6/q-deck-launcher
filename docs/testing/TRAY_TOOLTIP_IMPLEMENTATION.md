# Tray Tooltip Implementation

## Overview
The system tray icon now displays a tooltip that shows the application name and the current profile name.

## Features

### Basic Tooltip
- Shows "Q-Deck Launcher" when hovering over the tray icon
- Always visible, even before profiles are loaded

### Profile Name Display
- Automatically updates to show current profile name: "Q-Deck Launcher - [Profile Name]"
- Updates when switching profiles via hotkeys
- Shows only "Q-Deck Launcher" if no profile is active or available

## Implementation Details

### Functions
- `updateTrayTooltip()`: Updates the tray tooltip with current profile information
  - Checks if tray exists
  - Gets current profile from profileStateManager
  - Sets tooltip to "Q-Deck Launcher - [Profile Name]" or just "Q-Deck Launcher"

### Update Triggers
The tooltip is updated in three scenarios:

1. **Initial Creation**: When the tray icon is first created
   - Shows "Q-Deck Launcher" initially
   
2. **After Profile Manager Loads**: When profileStateManager is initialized
   - Updates to show the current profile name
   
3. **Profile Switch**: When user switches profiles via hotkey
   - Updates immediately to reflect the new profile

## Code Locations

### Main Implementation
- `electron/main.js`:
  - `updateTrayTooltip()` function (line ~591)
  - Called in `createTray()` (line ~633)
  - Called after lazy module loading (line ~832)
  - Called on profile switch (line ~720)

### Tests
- `electron/tray.test.js`:
  - Basic tooltip test
  - Profile name update test
  - No profile fallback test

## Testing

### Automated Tests
```bash
npx vitest --config vitest.config.electron.ts --run electron/tray.test.js
```

All tests passing:
- ✓ should create tray with tooltip
- ✓ should update tooltip with profile name
- ✓ should show only app name when no profile is active

### Manual Testing
1. Start the application
2. Hover over the tray icon → Should show "Q-Deck Launcher - [Current Profile]"
3. Switch profiles using hotkeys (e.g., Ctrl+1, Ctrl+2)
4. Hover over the tray icon again → Should show updated profile name

## Example Tooltips
- No profile: `Q-Deck Launcher`
- Default profile: `Q-Deck Launcher - Default`
- Development profile: `Q-Deck Launcher - Development`
- Gaming profile: `Q-Deck Launcher - Gaming`

## Requirements Satisfied
✅ Show "Q-Deck Launcher" on hover
✅ Optionally show current profile name
✅ Updates dynamically when profile changes
✅ Graceful fallback when no profile is available
