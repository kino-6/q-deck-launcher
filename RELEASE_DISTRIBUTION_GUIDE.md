# 📦 リリース配布ガイド

## 🎯 配布ファイル

### 作成済みファイル

1. **Q-Deck Launcher 0.1.0.exe** (68.03 MB)
   - ポータブル版実行ファイル
   - インストール不要
   - 直接実行可能

2. **Q-Deck.Launcher.0.1.0.zip** (67.97 MB)
   - 上記.exeをZIP圧縮
   - ポリシー制限環境向け
   - 解凍後に実行

## 🚫 .exe転送がブロックされる場合の対応

### 問題
企業ネットワークやセキュリティポリシーにより、.exeファイルのダウンロードがブロックされることがあります。

### 解決策

#### ✅ 方法1: ZIP形式で配布（推奨）

**メリット:**
- ほとんどのポリシーをバイパス
- ファイルサイズがほぼ同じ（圧縮率0.1%）
- 標準的な配布方法

**使い方:**
```
1. Q-Deck.Launcher.0.1.0.zip をダウンロード
2. ZIPを解凍
3. Q-Deck.Launcher.0.1.0.exe を実行
```

#### 方法2: 7z形式で配布

より高い圧縮率が必要な場合：

```powershell
# 7-Zipがインストールされている場合
7z a -t7z Q-Deck.Launcher.0.1.0.7z "release\Q-Deck Launcher 0.1.0.exe" -mx=9
```

#### 方法3: RAR形式で配布

```powershell
# WinRARがインストールされている場合
rar a -m5 Q-Deck.Launcher.0.1.0.rar "release\Q-Deck Launcher 0.1.0.exe"
```

#### 方法4: 自己解凍形式（SFX）

```powershell
# 7-Zipで自己解凍形式を作成
7z a -sfx Q-Deck.Launcher.0.1.0.exe "release\Q-Deck Launcher 0.1.0.exe"
```

#### 方法5: クラウドストレージ経由

- Google Drive
- OneDrive
- Dropbox
- GitHub Releases（推奨）

## 📤 GitHub Releaseへのアップロード

### アップロードするファイル

**両方アップロード推奨:**

1. ✅ `Q-Deck Launcher 0.1.0.exe` (68.03 MB)
   - 直接ダウンロード用
   - ファイル名変更推奨: `Q-Deck.Launcher.0.1.0.exe`

2. ✅ `Q-Deck.Launcher.0.1.0.zip` (67.97 MB)
   - ポリシー制限環境用
   - 既に適切なファイル名

### アップロード手順

#### Web UI経由

1. https://github.com/kino-6/q-deck-launcher/releases/tag/v0.1.0 にアクセス
2. **"Edit release"** をクリック
3. "Attach binaries" エリアに以下をドラッグ&ドロップ:
   - `release\Q-Deck Launcher 0.1.0.exe`
   - `Q-Deck.Launcher.0.1.0.zip`
4. .exeのファイル名を `Q-Deck.Launcher.0.1.0.exe` に変更
5. **"Update release"** をクリック

#### GitHub CLI経由

```powershell
cd q-deck-launcher

# 両方のファイルをアップロード
gh release upload v0.1.0 `
  "release\Q-Deck Launcher 0.1.0.exe#Q-Deck.Launcher.0.1.0.exe" `
  "Q-Deck.Launcher.0.1.0.zip"
```

## 📝 リリース説明文の更新

ダウンロードオプションを明記：

```markdown
## 📥 Download

### Option 1: Direct Download (Recommended)
Download `Q-Deck.Launcher.0.1.0.exe` and run it directly.

### Option 2: ZIP Archive (For Restricted Environments)
If your network blocks .exe downloads:
1. Download `Q-Deck.Launcher.0.1.0.zip`
2. Extract the ZIP file
3. Run `Q-Deck.Launcher.0.1.0.exe`

**Both files contain the same portable application - no installation required!**
```

日本語版：

```markdown
## 📥 ダウンロード

### オプション1: 直接ダウンロード（推奨）
`Q-Deck.Launcher.0.1.0.exe` をダウンロードして直接実行。

### オプション2: ZIPアーカイブ（制限環境向け）
ネットワークが.exeのダウンロードをブロックする場合：
1. `Q-Deck.Launcher.0.1.0.zip` をダウンロード
2. ZIPファイルを解凍
3. `Q-Deck.Launcher.0.1.0.exe` を実行

**どちらのファイルも同じポータブルアプリケーションです - インストール不要！**
```

## 🔐 セキュリティ考慮事項

### ウイルススキャン

ユーザーが安心してダウンロードできるよう：

1. **VirusTotal でスキャン**
   - https://www.virustotal.com にアップロード
   - スキャン結果のリンクをリリースノートに追加

2. **コード署名（将来的に）**
   - Windows Code Signing Certificate を取得
   - .exeファイルに署名
   - SmartScreenの警告を回避

### チェックサム提供

ファイルの整合性確認用：

```powershell
# SHA256ハッシュを生成
Get-FileHash "Q-Deck.Launcher.0.1.0.exe" -Algorithm SHA256 | Select-Object Hash
Get-FileHash "Q-Deck.Launcher.0.1.0.zip" -Algorithm SHA256 | Select-Object Hash
```

リリースノートに追加：

```markdown
## 🔐 Checksums (SHA256)

- `Q-Deck.Launcher.0.1.0.exe`: `[hash]`
- `Q-Deck.Launcher.0.1.0.zip`: `[hash]`
```

## 📊 ファイルサイズ比較

| ファイル | サイズ | 用途 |
|---------|--------|------|
| Q-Deck Launcher 0.1.0.exe | 68.03 MB | 直接ダウンロード |
| Q-Deck.Launcher.0.1.0.zip | 67.97 MB | 制限環境向け |
| win-unpacked/ | 168 MB | 開発用（配布不要） |

## 🎯 推奨配布戦略

### GitHub Releases（メイン）

✅ **両方のファイルをアップロード:**
- .exe - 通常のユーザー向け
- .zip - 企業ユーザー向け

### 代替配布チャネル

1. **公式ウェブサイト**（将来的に）
   - 両形式を提供
   - ダウンロード統計を収集

2. **パッケージマネージャー**（将来的に）
   - Chocolatey
   - Scoop
   - WinGet

3. **Microsoft Store**（将来的に）
   - 最も信頼性の高い配布方法
   - 自動更新
   - コード署名不要

## 🚀 次のステップ

1. ✅ ZIPファイル作成完了
2. ⬜ GitHub Releaseに両ファイルをアップロード
3. ⬜ リリース説明文を更新（ダウンロードオプション追加）
4. ⬜ チェックサムを生成・追加（オプション）
5. ⬜ VirusTotalでスキャン（オプション）

## 📖 関連ドキュメント

- `create-release-archives.ps1` - アーカイブ作成スクリプト
- `RELEASE_INSTRUCTIONS.md` - リリース作成手順
- `RELEASE_DESCRIPTION_*.md` - リリース説明文テンプレート

---

**準備完了！** 両ファイルをGitHub Releaseにアップロードしてください 🚀
