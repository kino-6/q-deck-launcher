# Q-Deck Launcher v0.1.0

First stable release of Q-Deck Launcher - a powerful, customizable application launcher for Windows.

## ✨ Highlights

- 🎯 **Global Hotkey** - Press F11 to show/hide launcher
- 🪟 **System Tray** - Runs in background, always accessible
- 🎨 **Customizable Grid** - Drag & drop buttons, multiple profiles
- ⚡ **Fast Actions** - Launch apps, open files, run commands
- 🚀 **Optimized** - Fast startup (< 1s), efficient memory usage

## 📥 Download & Install

1. Download `Q-Deck.Launcher.0.1.0.exe` below
2. Run it (no installation needed - portable app)
3. Press **F11** to start using!

**System Requirements:** Windows 10/11 (64-bit)

## 🎯 Key Features

### Action Types
- **LaunchApp** - Launch any Windows application
- **Open** - Open files, folders, or URLs
- **Terminal** - Run terminal commands
- **System** - Access settings

### User Experience
- Drag & drop button reordering
- Smooth dropdown animation
- Auto-close after opening files
- Icon extraction from executables
- Keyboard shortcuts (1-9, 0)

### Performance
- Fast startup (< 1 second)
- Memory optimization with icon caching
- Auto-update support

## 📝 Quick Start

```yaml
# Configuration file: %APPDATA%\q-deck-launcher\config.yaml

ui:
  summon:
    hotkeys: ["F11"]
  window:
    width_px: 1000
    height_px: 600

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

## 🔮 Coming Soon

- SendKeys action
- PowerShell action
- Folder navigation
- MultiAction support
- Edge trigger
- More themes

## 📖 Documentation

- [README](https://github.com/kino-6/q-deck-launcher#readme)
- [Configuration Guide](https://github.com/kino-6/q-deck-launcher#configuration)
- [Report Issues](https://github.com/kino-6/q-deck-launcher/issues)

---

Thank you for using Q-Deck Launcher! 🚀
