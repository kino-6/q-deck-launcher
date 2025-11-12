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
# 通常の開発モード（DevTools付き）
.\launch.ps1 -Force

# UX評価モード（DevToolsなし）
.\launch.ps1 -Force -NoDevTools
```

**launch.ps1の機能:**
- ✅ 自動的にポートの競合を解決
- ✅ 既存プロセスのクリーンアップ
- ✅ エラーハンドリング
- ✅ 環境チェック
- ✅ DevToolsの有効/無効切り替え

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
├── src/                    # React frontend source code
│   ├── components/         # UI components (Grid, ButtonEditModal, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API wrappers
│   ├── store/             # State management (Zustand stores)
│   ├── styles/            # CSS and theme files
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── electron/              # Electron main process
│   ├── actions/           # Action executors (LaunchApp, Terminal, etc.)
│   ├── ipc/               # IPC handlers
│   ├── main.js            # Main process entry point
│   ├── preload.cjs        # Preload script
│   └── ProfileStateManager.js  # Profile state management
├── scripts/               # Build and utility scripts
│   └── test/              # Test scripts (PowerShell)
├── docs/                  # Documentation and implementation notes
├── test-files/            # Test assets (images, icons, etc.)
├── public/                # Static assets
├── dist/                  # Built frontend (generated)
├── release/               # Built Electron app (generated)
├── .kiro/                 # Kiro specs and configuration
│   └── specs/q-deck-launcher/  # Feature specs and tasks
├── launch.ps1             # Development launcher (recommended)
├── build.bat              # Production build script
├── package.json           # Node.js dependencies
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

### Key Directories

- **`src/`**: React frontend with TypeScript
- **`electron/`**: Electron main process and IPC handlers
- **`scripts/test/`**: PowerShell test scripts for manual testing
- **`docs/`**: Implementation notes, task summaries, and guides
- **`.kiro/specs/`**: Feature specifications and task lists

### Available Scripts

**開発:**
- `.\launch.ps1 -Force` - 開発モードで起動（DevTools付き）
- `.\launch.ps1 -Force -NoDevTools` - UX評価モード（DevToolsなし）
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

All documentation has been organized in the `docs/` directory:

- **`docs/HOW_TO_RUN.md`** - 起動方法の完全ガイド
- **`docs/QUICK_USER_TEST.md`** - ユーザ操作テストシナリオ
- **`docs/REFACTORING_PLAN.md`** - コードリファクタリング計画
- **`docs/TASK_*.md`** - 各機能の実装ドキュメント
- **`.kiro/specs/q-deck-launcher/`** - 機能仕様とタスク

Test scripts are located in `scripts/test/`.

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