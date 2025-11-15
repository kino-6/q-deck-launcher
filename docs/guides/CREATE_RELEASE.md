# GitHub Release作成手順

## 現在の状態

✅ ビルド済み: `release/Q-Deck Launcher 0.1.0.exe` (68MB)
✅ リリースノート準備完了: `RELEASE_NOTES.md`
✅ README更新済み: ダウンロードリンク追加済み

## GitHub Releaseの作成手順

### 方法1: GitHub Web UI（推奨）

1. **GitHubのReleasesページを開く**
   ```
   https://github.com/kino-6/q-deck-launcher/releases
   ```

2. **"Draft a new release"をクリック**

3. **リリース情報を入力**

   **Tag version:**
   ```
   v0.1.0
   ```
   
   **Target:** `feature/electron-migration` (または `main` にマージ後)

   **Release title:**
   ```
   Q-Deck Launcher v0.1.0 - Initial Electron Release
   ```

   **Description:** 
   `RELEASE_NOTES.md` の内容をコピー＆ペースト

4. **バイナリファイルをアップロード**
   
   "Attach binaries by dropping them here or selecting them" エリアに以下をドラッグ＆ドロップ:
   
   ```
   release/Q-Deck Launcher 0.1.0.exe
   ```
   
   アップロード後、ファイル名を変更（推奨）:
   ```
   Q-Deck.Launcher.0.1.0.exe
   ```

5. **オプション設定**
   
   - ✅ **"Set as the latest release"** にチェック
   - ⬜ "Set as a pre-release" はチェックしない（正式リリースの場合）

6. **"Publish release"をクリック**

### 方法2: GitHub CLI

```powershell
# GitHub CLIをインストール（未インストールの場合）
# https://cli.github.com/

# 認証
gh auth login

# リリース作成
cd q-deck-launcher

gh release create v0.1.0 `
  --title "Q-Deck Launcher v0.1.0 - Initial Electron Release" `
  --notes-file RELEASE_NOTES.md `
  --target feature/electron-migration `
  "release/Q-Deck Launcher 0.1.0.exe#Q-Deck.Launcher.0.1.0.exe"
```

## リリース後の確認

### 1. ダウンロードリンクの確認

READMEのリンクが正しく動作するか確認:
```
https://github.com/kino-6/q-deck-launcher/releases/latest
```

### 2. ダウンロードテスト

1. リリースページから `Q-Deck.Launcher.0.1.0.exe` をダウンロード
2. ダウンロードしたファイルを実行
3. 正常に起動することを確認

### 3. README更新の確認

GitHubのREADMEページで以下を確認:
- ダウンロードセクションが表示されている
- リンクが正しく機能している

## トラブルシューティング

### ファイルサイズが大きすぎる

GitHubの制限:
- 単一ファイル: 2GB まで
- リリース全体: 制限なし

現在のファイルサイズ: 68MB（問題なし）

### アップロードが失敗する

1. ブラウザのキャッシュをクリア
2. 別のブラウザで試す
3. GitHub CLIを使用する

### リリースが表示されない

- ブランチが正しいか確認（`feature/electron-migration`）
- "Set as the latest release" にチェックが入っているか確認
- ページをリフレッシュ

## 次のステップ

リリース作成後:

1. **mainブランチにマージ**（オプション）
   ```powershell
   git checkout main
   git merge feature/electron-migration
   git push origin main
   ```

2. **リリースの告知**
   - GitHub Discussions
   - SNS
   - 関連コミュニティ

3. **フィードバック収集**
   - GitHub Issuesを監視
   - ユーザーからの報告に対応

4. **次のバージョン計画**
   - 新機能の検討
   - バグ修正の優先順位付け

## リリースノートのプレビュー

以下の内容が `RELEASE_NOTES.md` に含まれています:

- 🎉 新機能の一覧
- 📥 インストール手順
- 🚀 クイックスタートガイド
- 📝 設定方法
- 🎯 主要機能の説明
- 🐛 既知の問題
- 📖 ドキュメントリンク
- 🔮 ロードマップ
- 🙏 フィードバック方法

## 参考リンク

- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Semantic Versioning](https://semver.org/)

---

準備完了！リリースを作成してください 🚀
