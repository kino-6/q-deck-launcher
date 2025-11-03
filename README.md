# Q-Deck Launcher

A powerful, customizable application launcher with hotkey support for Windows.

## Features

- 🎯 **Global Hotkeys**: Register custom hotkeys to show/hide the launcher
- 🎨 **Customizable Grid**: Configurable button layout with custom icons and actions
- ⚡ **Fast Actions**: Launch applications, open files, run commands, and more
- 🔧 **Profile System**: Multiple profiles for different workflows
- 📝 **YAML Configuration**: Easy-to-edit configuration files
- 🪟 **Overlay Mode**: Transparent, always-on-top overlay window
- 📊 **Action Logging**: Track and monitor all executed actions

## Quick Start

### Prerequisites

- **Node.js** (v16 or later) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)

### Development Mode

#### Option 1: Using Launch Scripts (Recommended)

**Windows Command Prompt:**
```cmd
launch.bat
```

**PowerShell:**
```powershell
.\launch.ps1
```

#### Option 2: Manual Commands

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Production Build

#### Using Build Script
```cmd
build.bat
```

#### Manual Build
```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

## Default Hotkeys

- **Ctrl+F12**: Show/Hide overlay

## Configuration

The application uses YAML configuration files located at:
- **Portable mode**: `config.yaml` in the application directory
- **Standard mode**: `%APPDATA%/Q-Deck/config.yaml`

### Example Configuration

```yaml
version: "1.0"
ui:
  summon:
    hotkeys:
      - "Ctrl+F12"  # Ctrl + F12 key
    edge_trigger:
      enabled: false
      edges: ["top"]
      dwell_ms: 300
      margin_px: 5
  window:
    placement: "dropdown-top"
    width_px: 1000
    height_px: 600
    cell_size_px: 96
    gap_px: 8
    opacity: 0.92
    theme: "dark"
    animation:
      enabled: true
      duration_ms: 150

profiles:
  - name: "Default"
    hotkey: null
    pages:
      - name: "Main"
        rows: 3
        cols: 6
        buttons: []
```

## Development

### Project Structure

```
q-deck-launcher/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Utilities and API wrappers
│   └── App.tsx            # Main application
├── src-tauri/             # Rust backend
│   └── src/
│       ├── modules/       # Feature modules
│       │   ├── config.rs  # Configuration management
│       │   ├── hotkey.rs  # Hotkey system
│       │   ├── logger.rs  # Logging system
│       │   └── ...
│       └── lib.rs         # Main library
├── launch.bat             # Windows development launcher
├── launch.ps1             # PowerShell development launcher
└── build.bat              # Production build script
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend for production
- `npm run tauri dev` - Start Tauri development mode
- `npm run tauri build` - Build complete application

### Testing

#### Rust Tests
```bash
cd src-tauri
cargo test
```

#### Frontend Tests
```bash
npm test
```

## Hotkey System

The application supports Windows global hotkeys with the following syntax:

### Supported Modifiers
- `Ctrl` or `Control`
- `Alt`
- `Shift`
- `Win`, `Windows`, or `Cmd`

### Supported Keys
- **Function keys**: `F1` - `F12`
- **Letters**: `A` - `Z`
- **Numbers**: `0` - `9`
- **Special keys**: `Escape`, `Space`, `Enter`, `Tab`, etc.
- **Arrow keys**: `Up`, `Down`, `Left`, `Right`

### Examples
- `Ctrl+Alt+F1`
- `Win+Space`
- `Ctrl+Shift+A`
- `Alt+Tab`

## Action Types

The launcher supports various action types:

- **LaunchApp**: Launch applications
- **Open**: Open files or URLs
- **Terminal**: Run terminal commands
- **SendKeys**: Send keystrokes
- **PowerShell**: Execute PowerShell scripts
- **Folder**: Open folders
- **MultiAction**: Execute multiple actions in sequence

## Logging

All actions are logged with structured data including:
- Timestamp
- Action type and ID
- Execution time
- Success/failure status
- Error messages (if any)
- Context information

Logs are stored in `%APPDATA%/Q-Deck/logs/` with automatic rotation.

## Troubleshooting

### Common Issues

1. **Hotkey not working**: Check if another application is using the same hotkey
2. **Build fails**: Ensure Rust and Node.js are properly installed
3. **Application won't start**: Check the logs in `%APPDATA%/Q-Deck/logs/`

### Debug Mode

Run with debug logging:
```bash
RUST_LOG=debug npm run tauri dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]

## Roadmap

- [ ] Edge trigger support
- [ ] Multi-monitor support
- [ ] Plugin system
- [ ] Cloud configuration sync
- [ ] Themes and customization
- [ ] Action marketplace

---

For more information, check the [project documentation](docs/) or open an issue on GitHub.