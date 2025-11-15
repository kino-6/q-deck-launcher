# Development Tools Testing Guide

## Overview
This guide provides instructions for testing the Q-Deck Launcher overlay window using Electron's DevTools to diagnose rendering and functionality issues.

## Prerequisites
- Application must be running in development mode
- Node.js and npm installed
- All dependencies installed (`npm install`)

## Opening DevTools

### Method 1: Automatic (Development Mode)
DevTools automatically open for both main and overlay windows when running in development mode:

```powershell
# Start the application in development mode
npm run electron:dev
```

Or using the launch script:
```powershell
.\launch.ps1
```

### Method 2: Manual Toggle
If DevTools don't open automatically, you can toggle them:
- Press `Ctrl+Shift+I` in the overlay window
- Or press `F12` in the overlay window

### Method 3: Disable Auto-Open
To run in development mode without auto-opening DevTools:

```powershell
$env:NO_DEVTOOLS="true"
npm run electron:dev
```

## Testing Checklist

### 1. Console Errors Check

**Steps:**
1. Open the overlay window (press F11)
2. Open DevTools (should open automatically in dev mode)
3. Navigate to the **Console** tab
4. Look for errors (red text) or warnings (yellow text)

**What to check:**
- [ ] No React errors (e.g., "Cannot read property of undefined")
- [ ] No module loading errors (e.g., "Failed to load resource")
- [ ] No IPC communication errors
- [ ] No CSS/styling errors
- [ ] Check for any warnings about missing dependencies

**Common errors to investigate:**
```
❌ Uncaught TypeError: Cannot read property 'X' of undefined
❌ Failed to load resource: net::ERR_FILE_NOT_FOUND
❌ Warning: Each child in a list should have a unique "key" prop
❌ Error: Config is null or undefined
```

### 2. React Component Tree Inspection

**Steps:**
1. Open DevTools in overlay window
2. Navigate to the **Components** tab (React DevTools extension)
3. Inspect the component hierarchy

**What to check:**
- [ ] `<Overlay>` component is mounted
- [ ] `<Grid>` component is rendered
- [ ] `<ActionButton>` components are present for each button
- [ ] Props are correctly passed down the component tree
- [ ] State values are correct (currentProfile, currentPage, buttons array)

**Component hierarchy should look like:**
```
<Overlay>
  └─ <ProfileProvider>
      └─ <Grid>
          ├─ <PageIndicator>
          ├─ <GridCell> (multiple)
          │   └─ <ActionButton>
          └─ <ThemeSelector>
```

**Key props to verify:**
- `config`: Should contain full configuration object
- `buttons`: Should be an array with button definitions
- `currentProfile`: Should match active profile
- `currentPage`: Should match active page

### 3. Network Requests Verification

**Steps:**
1. Open DevTools in overlay window
2. Navigate to the **Network** tab
3. Reload the overlay (close and reopen with F11)
4. Observe all network requests

**What to check:**
- [ ] All JavaScript bundles load successfully (200 status)
- [ ] All CSS files load successfully (200 status)
- [ ] Icon files load correctly
- [ ] No 404 errors for missing resources
- [ ] No CORS errors

**Expected resources:**
```
✓ index.html (or overlay route)
✓ main.js / overlay.js (Vite bundle)
✓ vendor.js (dependencies)
✓ Grid.css
✓ Icon files (PNG, ICO, SVG)
```

### 4. Application State Inspection

**Steps:**
1. Open DevTools Console tab
2. Use the following commands to inspect state:

```javascript
// Check if config is loaded
window.__QDECK_CONFIG__

// Check React component state (if exposed)
// Note: This requires React DevTools extension

// Check for global errors
window.onerror

// Check localStorage/sessionStorage
localStorage
sessionStorage
```

### 5. Performance Profiling

**Steps:**
1. Open DevTools **Performance** tab
2. Click **Record** button
3. Perform actions (open overlay, click buttons, switch pages)
4. Stop recording
5. Analyze the flame graph

**What to check:**
- [ ] Overlay opens within 200ms
- [ ] No long-running JavaScript tasks (>50ms)
- [ ] No excessive re-renders
- [ ] Smooth animations (60fps)

### 6. Memory Inspection

**Steps:**
1. Open DevTools **Memory** tab
2. Take a heap snapshot
3. Perform actions (open/close overlay multiple times)
4. Take another heap snapshot
5. Compare snapshots

**What to check:**
- [ ] No memory leaks (heap size should stabilize)
- [ ] Detached DOM nodes are cleaned up
- [ ] Event listeners are properly removed

## Common Issues and Solutions

### Issue: Grid Not Rendering

**Symptoms:**
- Empty overlay window
- No buttons visible
- Console shows no errors

**Debugging steps:**
1. Check Console for React errors
2. Inspect `<Grid>` component props in React DevTools
3. Verify `config` object is not null
4. Check if `buttons` array is empty
5. Verify CSS is loaded (check Network tab)

**Solution:**
```javascript
// In Console, check:
console.log('Config:', window.__QDECK_CONFIG__);
// Should show full config object, not null/undefined
```

### Issue: Buttons Not Clickable

**Symptoms:**
- Buttons visible but don't respond to clicks
- No console errors

**Debugging steps:**
1. Check if event listeners are attached (Elements tab → Event Listeners)
2. Verify z-index and pointer-events CSS properties
3. Check if overlay window has focus

### Issue: Icons Not Loading

**Symptoms:**
- Buttons show emoji fallback instead of custom icons
- 404 errors in Network tab

**Debugging steps:**
1. Check Network tab for failed icon requests
2. Verify icon paths in config
3. Check if icon-cache directory exists
4. Verify IPC handler for icon extraction is working

## Automated Testing Script

A Node.js script is provided to automate some of these checks:

```powershell
node verify-overlay-init.js
```

This script will:
- Launch the application
- Wait for overlay to initialize
- Check for console errors
- Verify component rendering
- Report results

## Reporting Issues

When reporting issues, include:
1. Screenshot of Console tab (with errors visible)
2. Screenshot of Network tab (showing failed requests)
3. React component tree (from React DevTools)
4. Steps to reproduce
5. Expected vs actual behavior

## Additional Resources

- [Electron DevTools Documentation](https://www.electronjs.org/docs/latest/tutorial/devtools-extension)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
