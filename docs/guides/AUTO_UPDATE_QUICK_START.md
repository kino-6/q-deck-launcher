# Auto-Update Quick Start Guide

## Overview

Q-Deck Launcher now includes automatic update functionality that checks for new versions via GitHub Releases.

## For Users

### How It Works

1. **Automatic Checks**: The app checks for updates weekly
2. **Notification**: You'll see a dialog when an update is available
3. **User Control**: You choose when to download and install
4. **Background Process**: Updates download without interrupting your work

### Update Process

#### When Update is Available

1. Dialog appears: "Version X.X.X is available"
2. Choose:
   - **Download Update**: Download now
   - **Later**: Check again later

#### When Update is Downloaded

1. Dialog appears: "Update downloaded"
2. Choose:
   - **Restart Now**: Install immediately
   - **Later**: Install on next app restart

### Manual Update Check

Currently, manual update checks are available via the developer console:

```javascript
// Open DevTools (Ctrl+Shift+I in development)
await window.electron.invoke('check-for-updates');
```

## For Developers

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure GitHub Repository**
   
   Already configured in `package.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "tkino",
     "repo": "q-deck-launcher"
   }
   ```

3. **Set GitHub Token** (for publishing)
   ```bash
   set GH_TOKEN=your_github_personal_access_token
   ```

### Testing

Run the auto-updater tests:

```bash
# Run all tests
npm test

# Run only auto-updater tests
npm test autoUpdater.test.js

# Run IPC handler tests
npm test updateHandlers.test.js
```

### Development Mode

Auto-updater is **disabled** in development mode to prevent interference.

### Production Mode

Auto-updater is **enabled** in production builds:

```bash
npm run electron:build:win
```

### Publishing a Release

1. **Update Version**
   ```bash
   npm version patch  # 0.1.0 -> 0.1.1
   npm version minor  # 0.1.0 -> 0.2.0
   npm version major  # 0.1.0 -> 1.0.0
   ```

2. **Build and Publish**
   ```bash
   # Build for Windows
   npm run electron:build:win
   
   # Publish to GitHub Releases
   npx electron-builder --win --publish always
   ```

3. **Verify Release**
   - Check GitHub Releases page
   - Verify files are uploaded
   - Test update on another machine

### Configuration

Update settings in `electron/autoUpdater.js`:

```javascript
this.config = {
  autoDownload: false,              // User control
  autoInstallOnAppQuit: true,       // Install on quit
  checkInterval: 7 * 24 * 60 * 60 * 1000,  // 7 days
};
```

### Logging

All update events are logged:

```javascript
// Check logs in:
// %APPDATA%/q-deck-launcher/logs/
```

## Architecture

### Files

- `electron/autoUpdater.js` - Main auto-update logic
- `electron/ipc/updateHandlers.js` - IPC communication
- `electron/autoUpdater.test.js` - Unit tests
- `electron/ipc/updateHandlers.test.js` - IPC tests
- `docs/AUTO_UPDATE.md` - Full documentation

### Integration Points

1. **main.js**: Initializes auto-updater in production
2. **IPC Handlers**: Exposes update functions to renderer
3. **Logger**: Logs all update events

## Common Tasks

### Change Update Frequency

Edit `electron/autoUpdater.js`:

```javascript
checkInterval: 24 * 60 * 60 * 1000,  // Daily instead of weekly
```

### Enable Auto-Download

Edit `electron/autoUpdater.js`:

```javascript
autoDownload: true,  // Auto-download updates
```

### Disable Auto-Install

Edit `electron/autoUpdater.js`:

```javascript
autoInstallOnAppQuit: false,  // Don't auto-install
```

## Troubleshooting

### Updates Not Detected

1. Check internet connection
2. Verify GitHub repository is public
3. Check logs for errors
4. Ensure release is published (not draft)

### Build Fails

1. Verify `electron-updater` is installed
2. Check `package.json` configuration
3. Ensure GitHub token is set (for publishing)

### Tests Fail

1. Run `npm install` to ensure dependencies
2. Check mock implementations
3. Review error messages

## Next Steps

1. ✅ Auto-update mechanism configured
2. ⏭️ Test update flow with real release
3. ⏭️ Add UI for manual update checks
4. ⏭️ Implement update settings in config modal

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Full Documentation](docs/AUTO_UPDATE.md)
