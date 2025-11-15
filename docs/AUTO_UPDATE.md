# Auto-Update System

## Overview

Q-Deck Launcher includes an automatic update system that checks for new versions and allows users to update the application seamlessly. The system uses `electron-updater` and integrates with GitHub Releases.

## Features

- **Automatic Update Checks**: Checks for updates weekly (configurable)
- **User Control**: Users can choose when to download and install updates
- **GitHub Integration**: Updates are distributed via GitHub Releases
- **Secure Updates**: Code-signed releases ensure authenticity
- **Background Downloads**: Updates download in the background without interrupting work
- **Graceful Installation**: Updates install on app restart

## Architecture

### Components

1. **AutoUpdateManager** (`electron/autoUpdater.js`)
   - Manages update lifecycle
   - Handles user dialogs
   - Configures update behavior
   - Logs update events

2. **Update IPC Handlers** (`electron/ipc/updateHandlers.js`)
   - Exposes update functionality to renderer process
   - Handles manual update checks
   - Manages update configuration

3. **GitHub Releases Integration**
   - Configured in `package.json` under `build.publish`
   - Automatically detects new releases
   - Downloads update packages

## Configuration

### Default Settings

```javascript
{
  autoDownload: false,           // Manual download (user control)
  autoInstallOnAppQuit: true,    // Install on next app quit
  checkInterval: 604800000       // 7 days in milliseconds
}
```

### Customizing Update Behavior

Update the configuration via IPC:

```javascript
// From renderer process
const result = await window.electron.invoke('update-update-config', {
  autoDownload: true,              // Auto-download updates
  checkInterval: 86400000          // Check daily (1 day)
});
```

## Update Flow

### Automatic Update Check

1. **Startup Check**: 10 seconds after app starts
2. **Periodic Checks**: Every 7 days (configurable)
3. **Background Process**: Doesn't interrupt user workflow

### Update Available

1. Dialog shows: "Version X.X.X is available"
2. User options:
   - **Download Update**: Starts download immediately
   - **Later**: Postpones update

### Update Downloaded

1. Dialog shows: "Update downloaded"
2. User options:
   - **Restart Now**: Quits and installs update
   - **Later**: Installs on next app quit (if `autoInstallOnAppQuit` is true)

## Manual Update Check

Users can manually check for updates via IPC:

```javascript
// From renderer process
const result = await window.electron.invoke('check-for-updates');
if (result.success) {
  console.log('Update check initiated');
}
```

## Publishing Updates

### Prerequisites

1. **GitHub Repository**: Set up in `package.json`
   ```json
   "publish": {
     "provider": "github",
     "owner": "tkino",
     "repo": "q-deck-launcher"
   }
   ```

2. **GitHub Token**: Set `GH_TOKEN` environment variable
   ```bash
   set GH_TOKEN=your_github_token
   ```

3. **Code Signing** (Windows):
   - Certificate file: Set `CSC_LINK` to certificate path
   - Certificate password: Set `CSC_KEY_PASSWORD`

### Build and Publish

```bash
# Build for Windows
npm run electron:build:win

# Publish to GitHub Releases
npx electron-builder --win --publish always
```

### Release Process

1. **Update Version**: Bump version in `package.json`
   ```bash
   npm version patch  # or minor, major
   ```

2. **Build**: Create production build
   ```bash
   npm run electron:build:win
   ```

3. **Publish**: Upload to GitHub Releases
   ```bash
   npx electron-builder --win --publish always
   ```

4. **Verify**: Check GitHub Releases page for new release

## Development vs Production

### Development Mode

- Auto-updater is **disabled**
- No update checks performed
- Prevents interference during development

### Production Mode

- Auto-updater is **enabled**
- Automatic update checks start 10 seconds after launch
- Periodic checks every 7 days

## Logging

All update events are logged via the logger system:

```javascript
// Update check started
logger.info('Checking for updates...');

// Update available
logger.info('Update available', { version: '0.2.0' });

// Update downloaded
logger.info('Update downloaded', { version: '0.2.0' });

// Errors
logger.error('Error in auto-updater', { error: 'Network error' });
```

## Security

### Code Signing

- **Windows**: Sign with Authenticode certificate
- **macOS**: Sign with Apple Developer certificate
- **Verification**: electron-updater verifies signatures

### HTTPS

- All update downloads use HTTPS
- GitHub Releases provides secure hosting

### Integrity Checks

- electron-updater verifies file integrity
- SHA-512 checksums ensure file authenticity

## Troubleshooting

### Update Check Fails

**Symptom**: No updates detected despite new release

**Solutions**:
1. Check internet connection
2. Verify GitHub repository configuration
3. Check logs for error messages
4. Ensure release is published (not draft)

### Download Fails

**Symptom**: Update download doesn't complete

**Solutions**:
1. Check available disk space
2. Verify network stability
3. Check firewall settings
4. Review error logs

### Installation Fails

**Symptom**: Update doesn't install after download

**Solutions**:
1. Ensure app has write permissions
2. Close all app instances
3. Check antivirus settings
4. Review installation logs

## API Reference

### AutoUpdateManager

#### Methods

- `checkForUpdates()`: Manually check for updates
- `startAutoUpdateChecks()`: Start automatic update checks
- `stopAutoUpdateChecks()`: Stop automatic update checks
- `getConfig()`: Get current configuration
- `updateConfig(newConfig)`: Update configuration

#### Events

- `checking-for-update`: Update check started
- `update-available`: New version available
- `update-not-available`: No updates found
- `error`: Update error occurred
- `download-progress`: Download progress update
- `update-downloaded`: Update ready to install

### IPC Handlers

#### `check-for-updates`

Manually check for updates.

**Returns**: `{ success: boolean, error?: string }`

#### `get-update-config`

Get current update configuration.

**Returns**: `{ success: boolean, config?: object, error?: string }`

#### `update-update-config`

Update auto-update configuration.

**Parameters**: `newConfig: object`

**Returns**: `{ success: boolean, error?: string }`

## Best Practices

1. **Test Updates**: Test update process before releasing
2. **Semantic Versioning**: Use semver for version numbers
3. **Release Notes**: Include clear release notes
4. **Gradual Rollout**: Consider staged rollouts for major updates
5. **Backup Config**: Ensure user config is preserved during updates
6. **Monitor Logs**: Review update logs for issues

## Future Enhancements

- [ ] Delta updates (download only changes)
- [ ] Update channels (stable, beta, alpha)
- [ ] Rollback mechanism
- [ ] Update progress in UI
- [ ] Scheduled update windows
- [ ] Bandwidth throttling
