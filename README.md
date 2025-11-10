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

### Development Mode

**標準起動方法（常にこれを使用）:**

```powershell
.\launch.ps1 -Force
```

**launch.ps1の機能:**
- ✅ 自動的にポートの競合を解決
- ✅ 既存プロセスのクリーンアップ
- ✅ エラーハンドリング
- ✅ 環境チェック

**初回起動時:**
```powershell
# 依存関係をインストール
npm install

# アプリケーションを起動
.\launch.ps1 -Force
```

### Production Build

```powershell
npm run electron:build:win
```

The built application will be in `release/` directory:
- `Q-Deck Launcher Setup X.X.X.exe` - インストーラー
- `Q-Deck Launcher X.X.X.exe` - ポータブル版

## Default Hotkeys

- **F11**: Show/Hide overlay

## Configuration

The application uses YAML configuration files located at:
- **Windows**: `%APPDATA%/q-deck-launcher/config.yaml`

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

**開発:**
- `.\launch.ps1 -Force` - 開発モードで起動（標準）
- `npm run test` - テストを実行

**ビルド:**
- `npm run electron:build:win` - Windowsインストーラーをビルド

**その他（直接使用しない）:**
- `npm run dev` - Viteのみ（Electron APIなし）
- `npm run electron:dev` - 手動起動（ポート管理なし）

### Testing

```powershell
# 全テストを実行
npm run test

# テストをウォッチモードで実行
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
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

## Documentation

- **`HOW_TO_RUN.md`** - 起動方法の完全ガイド
- **`QUICK_USER_TEST.md`** - ユーザ操作テストシナリオ
- **`REFACTORING_PLAN.md`** - コードリファクタリング計画
- **`.kiro/specs/q-deck-launcher/`** - 機能仕様とタスク

## Troubleshooting

### Common Issues

1. **ポートが使用中**: `.\launch.ps1 -Force` で既存プロセスを終了
2. **Electronが起動しない**: 既存プロセスを手動で終了してから再起動
3. **依存関係エラー**: `npm install` を再実行

詳細は `HOW_TO_RUN.md` を参照してください。

### Debug Mode

開発モードでは自動的にDevToolsが開きます:
```powershell
.\launch.ps1 -Force
# F12でDevToolsを開く
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