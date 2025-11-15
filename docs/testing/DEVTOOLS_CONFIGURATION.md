# DevTools Configuration Documentation

## Current Configuration

The Q-Deck Launcher is configured to automatically open DevTools in development mode for both the main window and overlay window.

## Configuration Details

### Environment Variables

```javascript
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
```

**Behavior:**
- **Development mode** (`NODE_ENV=development`): DevTools open automatically
- **Production mode** (`NODE_ENV=production`): DevTools disabled
- **Manual override** (`NO_DEVTOOLS=true`): DevTools disabled even in dev mode

### Main Window DevTools

**Location:** `electron/main.js` lines 336-342

```javascript
if (process.env.NODE_ENV === 'development') {
  const port = process.env.VITE_PORT || process.env.PORT || 1420;
  const mainURL = `http://localhost:${port}`;
  log('Main window URL:', mainURL);
  mainWindow.loadURL(mainURL);
  if (!noDevTools) {
    mainWindow.webContents.openDevTools();
  }
}
```

**When DevTools open:**
- In development mode
- When `NO_DEVTOOLS` is not set to `true`
- Automatically after window loads

### Overlay Window DevTools

**Location:** `electron/main.js` lines 393-399

```javascript
if (process.env.NODE_ENV === 'development') {
  const port = process.env.VITE_PORT || process.env.PORT || 1420;
  const overlayURL = `http://localhost:${port}/overlay`;
  log('Overlay URL:', overlayURL);
  overlayWindow.loadURL(overlayURL);
  if (!noDevTools) {
    overlayWindow.webContents.openDevTools();
  }
}
```

**When DevTools open:**
- In development mode
- When `NO_DEVTOOLS` is not set to `true`
- Automatically after overlay window loads

### Console Message Forwarding

**Location:** `electron/main.js` lines 410-428

The overlay window forwards all console messages to the main process terminal:

```javascript
overlayWindow.webContents.on('console-message', (_event, level, message) => {
  const levelMap = {
    0: 'LOG',
    1: 'WARN',
    2: 'ERROR',
    3: 'DEBUG'
  };
  const levelName = levelMap[level] || 'LOG';
  
  // Filter out some noisy messages
  if (message.includes('DevTools') || 
      message.includes('Security Warning') || 
      message.includes('Autofill')) {
    return;
  }
  
  console.log(`[RENDERER ${levelName}] ${message}`);
});
```

**Benefits:**
- See renderer console logs in terminal
- Easier debugging of drag & drop issues
- Centralized logging

## Usage Examples

### Standard Development Mode

```powershell
# DevTools open automatically
npm run electron:dev
```

Or:
```powershell
.\launch.ps1
```

### Development Mode Without DevTools

```powershell
# Disable DevTools for cleaner testing
$env:NO_DEVTOOLS="true"
npm run electron:dev
```

### Production Mode

```powershell
# DevTools always disabled
$env:NODE_ENV="production"
npm run electron:dev
```

## Manual DevTools Toggle

Even when DevTools don't open automatically, you can toggle them manually:

**Keyboard shortcuts:**
- `Ctrl+Shift+I` - Toggle DevTools
- `F12` - Toggle DevTools
- `Ctrl+Shift+C` - Inspect element

**From menu (if available):**
- View → Toggle Developer Tools

## DevTools Features Used

### 1. Console Tab
- View JavaScript errors and warnings
- Execute JavaScript commands
- Monitor IPC communication logs
- Check config loading status

### 2. Network Tab
- Monitor resource loading (JS, CSS, images)
- Check for 404 errors
- Verify icon loading
- Measure load times

### 3. Elements Tab
- Inspect DOM structure
- Verify CSS styles
- Check element visibility
- Debug layout issues

### 4. Components Tab (React DevTools)
- Inspect React component tree
- View component props and state
- Track component re-renders
- Debug React-specific issues

### 5. Performance Tab
- Profile application performance
- Identify slow operations
- Check animation frame rates
- Find performance bottlenecks

### 6. Memory Tab
- Take heap snapshots
- Detect memory leaks
- Monitor memory usage
- Find detached DOM nodes

## Troubleshooting

### DevTools Not Opening

**Problem:** DevTools don't open in development mode

**Solutions:**
1. Check `NODE_ENV` is set to `development`
2. Verify `NO_DEVTOOLS` is not set to `true`
3. Try manual toggle: `Ctrl+Shift+I`
4. Check console for errors

### DevTools Opening in Production

**Problem:** DevTools open in production build

**Solutions:**
1. Verify `NODE_ENV=production` is set
2. Check build configuration
3. Ensure production build script sets correct env vars

### Console Messages Not Showing

**Problem:** Renderer console messages not appearing in terminal

**Solutions:**
1. Check console message forwarding is enabled (line 410-428)
2. Verify message is not filtered (DevTools, Security Warning, Autofill)
3. Check terminal output for `[RENDERER LOG]` prefix

## Best Practices

### During Development

1. **Keep DevTools open** - Catch errors immediately
2. **Monitor Console tab** - Watch for warnings and errors
3. **Check Network tab** - Verify all resources load
4. **Use React DevTools** - Inspect component state and props

### Before Committing

1. **Check for console errors** - Fix all red errors
2. **Review warnings** - Address yellow warnings
3. **Test without DevTools** - Ensure app works normally
4. **Verify production build** - Test with DevTools disabled

### Performance Testing

1. **Use Performance tab** - Profile critical operations
2. **Monitor memory** - Check for leaks
3. **Test on target hardware** - Verify performance on slower machines
4. **Measure startup time** - Ensure < 1000ms target

## Related Files

- `electron/main.js` - Main DevTools configuration
- `test-devtools-overlay.js` - Automated testing script
- `DEV_TOOLS_TESTING_GUIDE.md` - Comprehensive testing guide
- `DEVTOOLS_CHECKLIST.md` - Quick reference checklist

## References

- [Electron DevTools Documentation](https://www.electronjs.org/docs/latest/tutorial/devtools-extension)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
