# launch.ps1 修正: プロセス終了スコープの問題

## 問題

`launch.ps1 -Force`オプションを使用すると、**他のElectronアプリケーション**まで終了させてしまう問題がありました。

### 問題のあったコード

```powershell
# 問題1: すべてのElectronプロセスを終了
$electronProcesses = Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match "electron" -or
    $_.MainWindowTitle -match "q-deck"
}

# 問題2: -Forceフラグがあると、ポートを使っているすべてのプロセスを終了
if ($processName -match "(node|electron|q-deck|vite)" -or $Force) {
    $process.Kill()
}
```

### 影響

- VS Code（Electronベース）が終了する
- Discord（Electronベース）が終了する
- Slack（Electronベース）が終了する
- その他のElectronアプリが終了する

## 修正内容

### 1. Electronプロセスの識別を厳格化

**修正前**:
```powershell
$electronProcesses = Get-Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -match "electron" -or
    $_.MainWindowTitle -match "q-deck"
}
```

**修正後**:
```powershell
$electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue

foreach ($proc in $electronProcesses) {
    # コマンドライン引数をチェック
    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
    
    # Q-Deck関連のプロセスのみを対象
    $isQDeckProcess = $false
    
    if ($commandLine -match "q-deck|Q-Deck") {
        $isQDeckProcess = $true
    }
    elseif ($proc.MainWindowTitle -match "q-deck|Q-Deck") {
        $isQDeckProcess = $true
    }
    elseif ($workingDir -and $workingDir -match "q-deck") {
        $isQDeckProcess = $true
    }
    
    if ($isQDeckProcess) {
        $proc.Kill()
    }
}
```

### 2. ポート使用プロセスの識別を厳格化

**修正前**:
```powershell
if ($processName -match "(node|electron|q-deck|vite)" -or $Force) {
    $process.Kill()
}
```

**修正後**:
```powershell
# コマンドラインを取得して詳細チェック
$commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $processId").CommandLine

$isQDeckProcess = $false

# Node.jsでQ-Deckを実行している場合
if ($processName -match "node" -and $commandLine -match "q-deck|vite.*1420|vite.*1421") {
    $isQDeckProcess = $true
}
# プロセス名にq-deckが含まれる場合
elseif ($processName -match "q-deck") {
    $isQDeckProcess = $true
}
# ViteでQ-Deckを実行している場合
elseif ($processName -match "vite" -and $commandLine -match "q-deck") {
    $isQDeckProcess = $true
}

if ($isQDeckProcess) {
    $process.Kill()
}
```

### 3. Node.jsプロセスの識別を厳格化

**修正前**:
```powershell
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match "vite|q-deck" -or 
    $_.ProcessName -match "vite"
}

if ($nodeProcesses -and $Force) {
    $nodeProcesses | ForEach-Object { $_.Kill() }
}
```

**修正後**:
```powershell
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

foreach ($proc in $nodeProcesses) {
    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
    
    # Q-Deck関連のコマンドラインのみ
    if ($commandLine -match "q-deck|vite.*1420|vite.*1421|electron.*q-deck") {
        $proc.Kill()
    }
}
```

## 識別基準

修正後のスクリプトは、以下の基準でQ-Deckプロセスを識別します：

### ✅ 終了対象（Q-Deckプロセス）

1. **プロセス名に"q-deck"が含まれる**
   - `q-deck-launcher.exe`
   - `q-deck.exe`

2. **コマンドラインに"q-deck"が含まれる**
   - `node ... q-deck-launcher/...`
   - `electron q-deck-launcher`

3. **ウィンドウタイトルに"q-deck"または"Q-Deck"が含まれる**
   - `Q-Deck Launcher`

4. **Viteがポート1420-1425で実行されている**
   - `vite --port 1420`
   - `vite --port 1421`

### ❌ 終了対象外（他のアプリ）

1. **一般的なElectronアプリ**
   - VS Code (`code.exe`)
   - Discord (`Discord.exe`)
   - Slack (`slack.exe`)

2. **一般的なNode.jsプロセス**
   - 他のプロジェクトの開発サーバー
   - バックグラウンドサービス

3. **他のポートを使用しているプロセス**
   - ポート3000, 8080など

## テスト方法

### テスト1: 他のElectronアプリが終了しないことを確認

```powershell
# 1. VS CodeやDiscordなどのElectronアプリを起動
# 2. Q-Deckを起動
.\launch.ps1 -Force

# 3. 確認
# ✅ Q-Deckのプロセスのみが終了・再起動される
# ✅ VS Code、Discordなどは起動したまま
```

### テスト2: Q-Deckプロセスは正しく終了することを確認

```powershell
# 1. Q-Deckを起動
.\launch.ps1

# 2. 別のターミナルで再度起動（-Force付き）
.\launch.ps1 -Force

# 3. 確認
# ✅ 既存のQ-Deckプロセスが終了される
# ✅ 新しいQ-Deckプロセスが起動される
# ✅ ポート競合が発生しない
```

### テスト3: 複数のNode.jsプロジェクトが動いている場合

```powershell
# 1. 他のNode.jsプロジェクトを起動（例：別のReactアプリ）
cd ../other-project
npm run dev  # ポート3000で起動

# 2. Q-Deckを起動
cd ../q-deck-launcher
.\launch.ps1 -Force

# 3. 確認
# ✅ 他のNode.jsプロジェクトは起動したまま
# ✅ Q-Deckのみが起動される
```

## 安全性の向上

### Before（危険）
- すべてのElectronプロセスを終了
- `-Force`フラグで無差別に終了
- 他のアプリケーションに影響

### After（安全）
- Q-Deck関連プロセスのみを終了
- コマンドライン引数で厳密に識別
- 他のアプリケーションに影響なし

## 推奨される使用方法

### 通常の起動
```powershell
.\launch.ps1
```
- 既存のQ-Deckプロセスがあれば警告を表示
- 手動で終了するか、-Forceオプションを使用するよう促す

### 強制再起動
```powershell
.\launch.ps1 -Force
```
- Q-Deck関連プロセスのみを自動終了
- 他のアプリケーションには影響なし
- 安全に再起動できる

### ポート指定
```powershell
.\launch.ps1 -StartPort 1425
```
- 既存プロセスを終了せずに別ポートで起動
- 複数のQ-Deckインスタンスを同時実行可能

## まとめ

この修正により、`-Force`オプションが安全に使用できるようになりました：

✅ Q-Deck関連プロセスのみを終了
✅ 他のElectronアプリは保護される
✅ 他のNode.jsプロジェクトは保護される
✅ コマンドライン引数で厳密に識別
✅ 誤って他のアプリを終了するリスクを排除
