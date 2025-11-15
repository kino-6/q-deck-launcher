# Release Guide - Q-Deck Launcher

## Creating a New Release

### 1. Build the Application

```powershell
# Navigate to project directory
cd q-deck-launcher

# Install dependencies (if not already done)
npm install

# Build the application
npm run electron:build:win
```

This will create:
- `release/Q-Deck Launcher X.X.X.exe` - Portable executable (recommended for distribution)
- `release/Q-Deck Launcher Setup X.X.X.exe` - Installer (optional)

### 2. Test the Build

```powershell
# Test the portable version
.\release\Q-Deck Launcher 0.1.0.exe

# Verify:
# - Application starts without errors
# - F11 shows/hides overlay
# - System tray icon appears
# - Configuration is created at %APPDATA%\q-deck-launcher\config.yaml
# - All buttons work correctly
```

### 3. Create GitHub Release

#### Option A: Using GitHub Web Interface

1. Go to https://github.com/kino-6/q-deck-launcher/releases
2. Click **"Draft a new release"**
3. Fill in the release information:

**Tag version:** `v0.1.0` (or appropriate version)

**Release title:** `Q-Deck Launcher v0.1.0 - Initial Electron Release`

**Description:**
```markdown
# Q-Deck Launcher v0.1.0

First stable release of Q-Deck Launcher built with Electron.

## 🎉 What's New

- ✅ Electron-based application (migrated from Tauri)
- ✅ Global hotkey support (F11 to show/hide)
- ✅ System tray integration
- ✅ Customizable grid layout
- ✅ Multiple action types (LaunchApp, Open, Terminal, System)
- ✅ Profile and page management
- ✅ Drag & drop button reordering
- ✅ Smooth dropdown animation
- ✅ Auto-update support
- ✅ Production error logging
- ✅ Memory and startup optimization

## 📥 Installation

### Portable Version (Recommended)

1. Download `Q-Deck.Launcher.0.1.0.exe`
2. Run the executable (no installation required)
3. Press **F11** to show/hide the launcher

### System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 100MB minimum
- **Disk**: 200MB free space

## 🚀 Quick Start

1. Launch the application
2. Press **F11** to open the overlay
3. Click the **Settings** button (⚙️) to configure
4. Add your favorite applications and shortcuts

## 📝 Configuration

Configuration file location: `%APPDATA%\q-deck-launcher\config.yaml`

See [Configuration Guide](https://github.com/kino-6/q-deck-launcher#configuration) for details.

## 🐛 Known Issues

- None reported yet

## 📖 Documentation

- [README](https://github.com/kino-6/q-deck-launcher/blob/feature/electron-migration/README.md)
- [Configuration Guide](https://github.com/kino-6/q-deck-launcher#configuration)
- [Development Guide](https://github.com/kino-6/q-deck-launcher#development)

## 🙏 Feedback

Please report issues or suggestions on the [GitHub Issues](https://github.com/kino-6/q-deck-launcher/issues) page.
```

4. **Attach files:**
   - Drag and drop `release/Q-Deck Launcher 0.1.0.exe` to the release assets area
   - Optionally attach `release/Q-Deck Launcher Setup 0.1.0.exe` if you built the installer

5. Check **"Set as the latest release"**
6. Click **"Publish release"**

#### Option B: Using GitHub CLI

```powershell
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Create release
gh release create v0.1.0 `
  --title "Q-Deck Launcher v0.1.0 - Initial Electron Release" `
  --notes-file RELEASE_NOTES.md `
  "release/Q-Deck Launcher 0.1.0.exe#Q-Deck.Launcher.0.1.0.exe"

# Or with both portable and installer
gh release create v0.1.0 `
  --title "Q-Deck Launcher v0.1.0 - Initial Electron Release" `
  --notes-file RELEASE_NOTES.md `
  "release/Q-Deck Launcher 0.1.0.exe#Q-Deck.Launcher.0.1.0.exe" `
  "release/Q-Deck Launcher Setup 0.1.0.exe#Q-Deck.Launcher.Setup.0.1.0.exe"
```

### 4. Update README

After creating the release, verify that the download link in README.md works:

```markdown
**Latest Release:** [Download Q-Deck Launcher](https://github.com/kino-6/q-deck-launcher/releases/latest)
```

### 5. Announce the Release

Consider announcing on:
- GitHub Discussions
- Project website
- Social media
- Developer communities

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.0.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Examples:
- `v0.1.0` - Initial release
- `v0.1.1` - Bug fix release
- `v0.2.0` - New features added
- `v1.0.0` - First stable release

## Release Checklist

Before creating a release:

- [ ] All tests pass (`npm run test`)
- [ ] Application builds successfully (`npm run electron:build:win`)
- [ ] Portable version tested manually
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated (if exists)
- [ ] README.md updated with new features
- [ ] All documentation is up to date
- [ ] No critical bugs or issues
- [ ] System tray icon works
- [ ] Hotkeys work correctly
- [ ] Configuration saves/loads properly
- [ ] Auto-update works (if applicable)

## Troubleshooting

### Build Fails

```powershell
# Clean build artifacts
npm run clean

# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install

# Try building again
npm run electron:build:win
```

### Release Upload Fails

- Check file size (GitHub has a 2GB limit per file)
- Ensure you have write permissions to the repository
- Try using GitHub CLI instead of web interface

### Auto-Update Not Working

- Verify `publish` configuration in `package.json`
- Check that release is marked as "latest"
- Ensure executable is properly signed (for production)

## Next Steps

After releasing:

1. Monitor GitHub Issues for bug reports
2. Collect user feedback
3. Plan next release with new features
4. Update documentation based on user questions

## Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic Versioning](https://semver.org/)
- [GitHub CLI](https://cli.github.com/)
