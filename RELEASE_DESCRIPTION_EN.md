# Q-Deck Launcher v0.1.0

First stable release of Q-Deck Launcher built with Electron.

## 🎉 What's New

### Core Features
- ✅ **Electron-based application** - Migrated from Tauri for better Windows integration
- ✅ **Global hotkey support** - Press F11 to show/hide the launcher
- ✅ **System tray integration** - App runs in background with tray icon
- ✅ **Customizable grid layout** - Configure rows, columns, and button positions
- ✅ **Profile and page management** - Multiple profiles and pages for different workflows

### Action Types
- ✅ **LaunchApp** - Launch any Windows application
- ✅ **Open** - Open files, folders, or URLs
- ✅ **Terminal** - Run terminal commands
- ✅ **System** - Access settings and system actions

### User Experience
- ✅ **Drag & drop button reordering** - Easily reorganize buttons
- ✅ **Smooth dropdown animation** - Polished overlay appearance
- ✅ **Auto-close on Open action** - Overlay closes automatically after opening files
- ✅ **Icon extraction** - Automatically extract icons from executables
- ✅ **Keyboard shortcuts** - Number keys (1-9, 0) for quick button access

### Performance & Reliability
- ✅ **Startup optimization** - Fast application startup (< 1 second)
- ✅ **Memory optimization** - Efficient memory usage with icon caching
- ✅ **Bundle optimization** - Optimized build size
- ✅ **Production error logging** - Comprehensive error tracking
- ✅ **Auto-update support** - Automatic updates for future releases

## 📥 Installation

### Portable Version (Recommended)

1. Download `Q-Deck.Launcher.0.1.0.exe` from the assets below
2. Run the executable (no installation required)
3. Press **F11** to show/hide the launcher

The application will automatically create a configuration file at:
`%APPDATA%\q-deck-launcher\config.yaml`

### System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 100MB minimum
- **Disk**: 200MB free space

## 🚀 Quick Start

1. **Launch the application**
   - Double-click `Q-Deck.Launcher.0.1.0.exe`
   - The app will start in the system tray

2. **Open the overlay**
   - Press **F11** (or click the tray icon)
   - The overlay will appear at the top of your screen

3. **Configure your launcher**
   - Click the **Settings** button (⚙️) in the overlay
   - Add your favorite applications and shortcuts
   - Customize the grid layout

4. **Use the launcher**
   - Press **F11** to show the overlay
   - Click a button to execute an action
   - Press **F11** again to hide the overlay

## 📝 Configuration

### Configuration File Location

`%APPDATA%\q-deck-launcher\config.yaml`

### Example Configuration

```yaml
version: "1.0"
ui:
  summon:
    hotkeys:
      - "F11"
  window:
    width_px: 1000
    height_px: 600
    cell_size_px: 96
    gap_px: 8
    opacity: 0.92
    theme: "dark"

profiles:
  - name: "Default"
    pages:
      - name: "Main"
        rows: 4
        cols: 6
        buttons:
          - position: { row: 1, col: 1 }
            action_type: "LaunchApp"
            label: "Notepad"
            icon: "📝"
            config:
              path: "notepad.exe"
```

See the [Configuration Guide](https://github.com/kino-6/q-deck-launcher#configuration) for more details.

## 🎯 Key Features Explained

### Global Hotkeys
- Default hotkey: **F11**
- Customizable in config.yaml
- Works even when other apps are focused

### System Tray
- App runs in background
- Click tray icon to toggle overlay
- Right-click for context menu (Show/Hide, Settings, Quit)

### Drag & Drop
- Drag buttons to reorder them
- Visual feedback during drag
- Changes saved automatically

### Icon Extraction
- Automatically extracts icons from .exe files
- Cached for performance
- Fallback to emoji if extraction fails

### Keyboard Shortcuts
- **1-9, 0**: Quick access to first 10 buttons
- **Escape**: Close overlay
- **F11**: Toggle overlay

## 🐛 Known Issues

None reported yet. Please report any issues on the [GitHub Issues](https://github.com/kino-6/q-deck-launcher/issues) page.

## 📖 Documentation

- [README](https://github.com/kino-6/q-deck-launcher/blob/master/README.md)
- [Configuration Guide](https://github.com/kino-6/q-deck-launcher#configuration)
- [Development Guide](https://github.com/kino-6/q-deck-launcher#development)

## 🔮 Roadmap

Future releases will include:

- [ ] **SendKeys action** - Send keystrokes to applications
- [ ] **PowerShell action** - Execute PowerShell scripts
- [ ] **Folder action** - Navigate into sub-grids
- [ ] **MultiAction** - Execute multiple actions in sequence
- [ ] **Edge trigger** - Show overlay by moving mouse to screen edge
- [ ] **Profile hotkeys** - Switch profiles with hotkeys
- [ ] **Themes** - More color themes and customization
- [ ] **Cloud sync** - Sync configuration across devices

## 🙏 Feedback & Support

### Report Issues
If you encounter any bugs or have feature requests, please open an issue:
https://github.com/kino-6/q-deck-launcher/issues

### Contribute
Contributions are welcome! See the [Development Guide](https://github.com/kino-6/q-deck-launcher#development) to get started.

### Contact
- GitHub: [@kino-6](https://github.com/kino-6)
- Repository: https://github.com/kino-6/q-deck-launcher

---

Thank you for using Q-Deck Launcher! 🚀
