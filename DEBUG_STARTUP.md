# Q-Deck起動デバッグガイド

## 問題: F11を押してもオーバーレイが表示されない

### 確認手順

#### 1. Vite開発サーバーが起動しているか確認

```powershell
# ポート1420-1425を使用しているプロセスを確認
netstat -ano | Select-String ":142"
```

**期待される出力**:
```
TCP    0.0.0.0:1420    0.0.0.0:0    LISTENING    12345
TCP    [::]:1420       [::]:0       LISTENING    12345
```

もし何も表示されない場合、Viteサーバーが起動していません。

#### 2. Electronプロセスが起動しているか確認

```powershell
Get-Process -Name "electron" -ErrorAction SilentlyContinue
```

**期待される出力**:
```
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    xxx     xxx   xxxxxx     xxxxxx      xx.xx  xxxxx   x electron
```

#### 3. ブラウザで直接アクセスしてみる

```
http://localhost:1420
http://localhost:1421
```

どちらかでReactアプリが表示されるはずです。

#### 4. Electronのコンソールログを確認

launch.ps1を実行したターミナルで以下のようなログが表示されているか確認：

```
Overlay window created with dimensions: 1000 x 600
Overlay window position: xxx , 50
Loading overlay URL...
Overlay URL: http://localhost:1421/overlay
Overlay page loaded successfully
```

## よくある問題と解決方法

### 問題1: Viteサーバーが起動しない

**症状**:
- `netstat`でポート1420-1425が見つからない
- ブラウザでlocalhost:1420にアクセスできない

**解決方法**:
```powershell
# 1. プロセスをクリーンアップ
.\launch.ps1 -Force

# 2. node_modulesを再インストール
Remove-Item -Recurse -Force node_modules
npm install

# 3. 再起動
.\launch.ps1
```

### 問題2: ポート競合

**症状**:
- `Error: Port 1420 is already in use`

**解決方法**:
```powershell
# 方法1: 強制終了して再起動
.\launch.ps1 -Force

# 方法2: 別のポートで起動
.\launch.ps1 -StartPort 1425
```

### 問題3: Electronウィンドウが表示されない

**症状**:
- Viteは起動している
- Electronプロセスは存在する
- でもウィンドウが見えない

**解決方法**:
```powershell
# 1. タスクマネージャーでElectronプロセスを確認
# 2. プロセスを終了
Get-Process -Name "electron" | Stop-Process -Force

# 3. 再起動
.\launch.ps1
```

### 問題4: F11キーが反応しない

**症状**:
- アプリは起動している
- F11を押しても何も起こらない

**原因と解決方法**:

#### 原因1: グローバルホットキーの登録失敗

**確認**:
ターミナルログで以下を探す：
```
Hotkey F11 registered successfully
```

もし`Failed to register hotkey F11`が表示されている場合：

```powershell
# 他のアプリがF11を使用している可能性
# 一時的に他のキーに変更してテスト

# config.yamlを編集
notepad $env:APPDATA\q-deck-launcher\config.yaml

# hotkeysセクションを変更
# hotkeys:
#   - F11
# ↓
# hotkeys:
#   - F12

# アプリを再起動
.\launch.ps1 -Force
```

#### 原因2: オーバーレイウィンドウが作成されていない

**確認**:
ターミナルログで以下を探す：
```
Overlay window created with dimensions: 1000 x 600
```

もし表示されていない場合：

```powershell
# main.jsのポート設定を確認
# 実際にViteが起動しているポートと一致しているか

# ブラウザで確認
# http://localhost:1420/overlay
# または
# http://localhost:1421/overlay
```

### 問題5: Content Security Policy警告

**症状**:
```
Electron Security Warning (Insecure Content-Security-Policy)
```

**注意**: これは開発モードでのみ表示される警告で、機能には影響しません。
プロダクションビルドでは表示されません。

無視しても問題ありませんが、気になる場合は以下で対応：

```javascript
// electron/main.js の webPreferences に追加
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.cjs'),
  // CSP警告を抑制（開発モードのみ）
  devTools: process.env.NODE_ENV === 'development'
}
```

## デバッグ用の詳細ログ

より詳細なログを取得する場合：

```powershell
# 環境変数を設定して起動
$env:ELECTRON_ENABLE_LOGGING = 1
$env:DEBUG = "*"
.\launch.ps1
```

## 完全なクリーンスタート

すべてをリセットして最初からやり直す：

```powershell
# 1. すべてのプロセスを終了
Get-Process -Name "node","electron" | Stop-Process -Force

# 2. キャッシュをクリア
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force node_modules/.vite

# 3. 設定ファイルをリセット
Remove-Item $env:APPDATA\q-deck-launcher\config.yaml

# 4. 再インストール
npm install

# 5. 起動
.\launch.ps1
```

## 正常起動時のログ例

```
Starting Q-Deck Launcher (Electron) in development mode...
Parameters:
  -Force: Terminate existing processes
  -NoCleanup: Skip process cleanup
  -StartPort: Starting port number (default: 1420)
  -MaxPortAttempts: Maximum port search attempts (default: 10)

Checking for existing Q-Deck processes...
No existing Q-Deck launcher processes found

Environment Check:
Node.js: v20.x.x
npm: 10.x.x

Installing dependencies...
up to date, audited xxx packages in xxs

Searching for available port starting from 1420...
Found available port: 1420

Configuring development server to use port 1420...
Environment configured:
  VITE_PORT = 1420
  HMR_PORT = 1421

Starting Electron development server on port 1420...
Press Ctrl+C to stop the application

Default hotkey: F11 to show overlay
Development server will be available at: http://localhost:1420

> q-deck-launcher@0.1.0 electron:dev
> concurrently "cross-env NODE_ENV=development npm run dev" "wait-on http://localhost:1420 && cross-env NODE_ENV=development electron ."

[0] 
[0] > q-deck-launcher@0.1.0 dev
[0] > vite
[0] 
[0]   VITE v7.0.4  ready in xxx ms
[0] 
[0]   ➜  Local:   http://localhost:1420/
[0]   ➜  Network: use --host to expose
[1] App is ready
[1] Configuration loaded: { version: '1.0', ... }
[1] Overlay window created with dimensions: 1000 x 600
[1] Overlay window position: xxx , 50
[1] Loading overlay URL...
[1] Overlay URL: http://localhost:1421/overlay
[1] Hotkey F11 registered successfully
[1] Overlay page loaded successfully
[1] ✅ File drop interceptor injected
```

## 次のステップ

上記の確認手順を実行して、どこで問題が発生しているか特定してください。

問題が特定できたら、該当する解決方法を試してください。
