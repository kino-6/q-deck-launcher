# 既知の不具合 (Known Issues)

## 🚨 重大な問題

### ドラッグ&ドロップが機能しない
**状態**: 未解決  
**影響**: ファイルをドラッグ&ドロップしてボタンを自動生成する機能が使用できない

**問題の詳細**:
- Tauri v2の透明ウィンドウ（`transparent: true`）とWindowsのドラッグ&ドロップの互換性問題
- HTML drag-dropイベント（dragEnter, dragOver, drop）が全く発火しない
- Tauri native file-dropイベント（`tauri://file-drop`）も発火しない

**調査結果**:
- Tauri v2 + Windows + 透明ウィンドウの組み合わせで既知の問題
- `transparent: false`に変更すると、イベントが発火する可能性があるが、UIの透明性が失われる
- overlay用のcapability設定を追加済み（`src-tauri/capabilities/overlay.json`）

**回避策**:
現時点では回避策なし。手動でボタンを追加する必要があります。

**修正予定**:
- Phase 1: 透明ウィンドウの代替案を検討
  - オプション1: 半透明ウィンドウ（`transparent: false` + CSS opacity）
  - オプション2: レイヤードウィンドウ（Windows API）
  - オプション3: ドラッグ&ドロップ専用の非透明領域を作成
- Phase 2: 選択した代替案を実装
- Phase 3: フルパス取得の実装
- Phase 4: ボタン自動生成機能の実装

**関連タスク**: `.kiro/specs/q-deck-launcher/tasks.md` - タスク5.2

---

## ✅ 修正済み

### Escキーイベントが横取りされる問題
**状態**: 修正済み  
**修正日**: 2025-11-09

**問題の詳細**:
設定モーダルを開いた状態でEscキーを押すと、モーダルが閉じずにオーバーレイ全体が閉じてしまう

**修正内容**:
- Grid.tsxから`showConfig`の状態をOverlay.tsxに伝える仕組みを実装
- モーダルが開いている場合、グローバルEscキーハンドラーを無効化
- モーダル内でEscキーイベントを`stopPropagation()`で処理

---

## 📝 その他の注意事項

### テスト環境
- OS: Windows 11
- Tauri: v2.9.2
- Node.js: v18+
- Rust: 1.70+

### 報告方法
不具合を発見した場合は、以下の情報を含めてIssueを作成してください：
1. 問題の詳細な説明
2. 再現手順
3. 期待される動作
4. 実際の動作
5. 環境情報（OS、Tauriバージョン等）
