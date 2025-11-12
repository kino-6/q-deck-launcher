# Q-Deck Launcher - 起動方法ガイド

## 🚀 標準起動方法

### 開発モード（Development Mode）

**常に`launch.ps1`を使用してください。**

```powershell
cd q-deck-launcher
.\launch.ps1
```

開発中に使用するモードです。ホットリロードが有効で、コード変更が即座に反映されます。

**launch.ps1の機能**:
- ✅ 自動的にポートの競合を解決
- ✅ 既存プロセスのクリーンアップ
- ✅ エラーハンドリングが充実
- ✅ 環境チェック機能

**オプション**:
```powershell
# 既存プロセスを強制終了して起動（推奨）
.\launch.ps1 -Force

# プロセスクリーンアップをスキップ
.\launch.ps1 -NoCleanup

# カスタムポートで起動
.\launch.ps1 -StartPort 1425
```

#### 開発モードの特徴

- ✅ ホットリロード（コード変更が即座に反映）
- ✅ DevToolsが自動で開く
- ✅ 詳細なコンソールログ
- ✅ ソースマップが有効
- ⚠️ パフォーマンスは最適化されていない

### 2. プロダクションビルド（Production Build）

実際に配布するための実行ファイルを作成します。

#### Windowsインストーラー

```powershell
npm run electron:build:win
```

**生成されるファイル**:
- `release/Q-Deck Launcher Setup X.X.X.exe` - インストーラー
- `release/Q-Deck Launcher X.X.X.exe` - ポータブル版

#### macOS

```powershell
npm run electron:build:mac
```

**生成されるファイル**:
- `release/Q-Deck Launcher-X.X.X.dmg`
- `release/Q-Deck Launcher-X.X.X-mac.zip`

#### Linux

```powershell
npm run electron:build:linux
```

**生成されるファイル**:
- `release/Q-Deck Launcher-X.X.X.AppImage`
- `release/q-deck-launcher_X.X.X_amd64.deb`

#### プロダクションビルドの特徴

- ✅ 最適化されたパフォーマンス
- ✅ 小さいファイルサイズ
- ✅ DevToolsは無効
- ✅ 配布可能な実行ファイル
- ❌ ホットリロードなし

### 3. その他のコマンド（非推奨）

以下のコマンドは直接使用せず、`launch.ps1`を使用してください：

```powershell
# ❌ 使用しないでください
npm run dev          # Viteのみ（Electron APIが使えない）
npm run electron:dev # ポート競合の自動解決なし
```

**理由**: `launch.ps1`は環境チェック、ポート管理、プロセスクリーンアップを自動で行います。

## 🔧 トラブルシューティング

### ポートが使用中

**エラー**: `Port 1420 is already in use`

**解決方法**:
```powershell
# 方法1: launch.ps1を-Forceオプション付きで実行
.\launch.ps1 -Force

# 方法2: 手動でプロセスを終了
Get-Process -Name "node","electron" | Stop-Process -Force

# 方法3: 別のポートで起動
.\launch.ps1 -StartPort 1425
```

### 依存関係のエラー

**エラー**: `Cannot find module 'xxx'`

**解決方法**:
```powershell
# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

### Electronが起動しない

**症状**: Viteは起動するがElectronウィンドウが表示されない

**解決方法**:
```powershell
# 1. 既存プロセスを全て終了
Get-Process -Name "electron" | Stop-Process -Force

# 2. キャッシュをクリア
Remove-Item -Recurse -Force node_modules/.vite

# 3. 再起動
.\launch.ps1 -Force
```

### ビルドが失敗する

**エラー**: `Build failed`

**解決方法**:
```powershell
# 1. クリーンビルド
npm run clean
npm install
npm run build

# 2. TypeScriptエラーをチェック
npm run check

# 3. 再度ビルド
npm run electron:build:win
```

## 📊 各モードの比較

| 機能 | 開発モード | プロダクションビルド | Viteのみ |
|------|-----------|-------------------|---------|
| ホットリロード | ✅ | ❌ | ✅ |
| DevTools | ✅ | ❌ | ✅ |
| Electron API | ✅ | ✅ | ❌ |
| パフォーマンス | 🐢 | 🚀 | 🐢 |
| 起動速度 | 遅い | 速い | 速い |
| ファイルサイズ | - | 小さい | - |
| 配布可能 | ❌ | ✅ | ❌ |

## 🎯 推奨される使い方

### 開発中（標準）
```powershell
.\launch.ps1 -Force
```
**これが標準の起動方法です。常にこれを使用してください。**

- コードを変更しながらテスト
- F11でオーバーレイを表示
- DevToolsでデバッグ

### テスト前
```powershell
npm run test
```
- 自動テストを実行
- コードの品質を確認

### リリース前
```powershell
npm run electron:build:win
```
- プロダクションビルドを作成
- 実際の動作を確認
- インストーラーをテスト

## 🔑 重要なキーボードショートカット

### 開発モード
- **F11**: オーバーレイの表示/非表示
- **F12**: DevToolsを開く（Electronウィンドウ内で）
- **Ctrl+C**: 開発サーバーを停止（ターミナルで）
- **Ctrl+R**: ページをリロード
- **Ctrl+Shift+R**: キャッシュをクリアしてリロード

### アプリケーション
- **F11**: オーバーレイの表示/非表示
- **Esc**: モーダルを閉じる
- **右クリック**: コンテキストメニュー

## 📝 次のステップ

1. **開発モードで起動**: `.\launch.ps1 -Force`（これが標準）
2. **F11でオーバーレイ表示**
3. **QUICK_USER_TEST.mdのシナリオを試す**
4. **コードを変更して動作確認**
5. **テストを実行**: `npm run test`
6. **プロダクションビルド**: `npm run electron:build:win`

---

## ⚠️ 重要: 起動方法の統一

**全てのドキュメント、README、テストガイドで`.\launch.ps1`を標準起動方法として記載しています。**

他のコマンド（`npm run dev`、`npm run electron:dev`）は使用しないでください。
