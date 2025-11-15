# Q-Deck Launcher v0.1.0

Windows向けの強力でカスタマイズ可能なアプリケーションランチャーの初回安定版リリースです。

## ✨ ハイライト

- 🎯 **グローバルホットキー** - F11キーでランチャーを表示/非表示
- 🪟 **システムトレイ** - バックグラウンドで動作、常にアクセス可能
- 🎨 **カスタマイズ可能なグリッド** - ドラッグ&ドロップ、複数プロファイル対応
- ⚡ **高速アクション** - アプリ起動、ファイルを開く、コマンド実行
- 🚀 **最適化済み** - 高速起動（1秒未満）、効率的なメモリ使用

## 📥 ダウンロード＆インストール

1. 下記から `Q-Deck.Launcher.0.1.0.exe` をダウンロード
2. 実行（インストール不要 - ポータブルアプリ）
3. **F11キー**を押して使い始める！

**システム要件:** Windows 10/11 (64-bit)

## 🎯 主要機能

### アクションタイプ
- **LaunchApp** - 任意のWindowsアプリケーションを起動
- **Open** - ファイル、フォルダ、URLを開く
- **Terminal** - ターミナルコマンドを実行
- **System** - 設定にアクセス

### ユーザーエクスペリエンス
- ドラッグ&ドロップでボタン並び替え
- スムーズなドロップダウンアニメーション
- ファイルを開いた後の自動クローズ
- 実行ファイルからアイコン抽出
- キーボードショートカット（1-9, 0）

### パフォーマンス
- 高速起動（1秒未満）
- アイコンキャッシュによるメモリ最適化
- 自動更新サポート

## 📝 クイックスタート

```yaml
# 設定ファイル: %APPDATA%\q-deck-launcher\config.yaml

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
            label: "メモ帳"
            icon: "📝"
            config:
              path: "notepad.exe"
```

## 🔮 今後の予定

- SendKeysアクション
- PowerShellアクション
- フォルダナビゲーション
- MultiActionサポート
- エッジトリガー
- 追加テーマ

## 📖 ドキュメント

- [README](https://github.com/kino-6/q-deck-launcher#readme)
- [設定ガイド](https://github.com/kino-6/q-deck-launcher#configuration)
- [問題を報告](https://github.com/kino-6/q-deck-launcher/issues)

---

Q-Deck Launcherをご利用いただきありがとうございます！🚀
