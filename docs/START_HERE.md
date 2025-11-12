# Q-Deck Launcher - スタートガイド

## 🚀 起動方法（これだけ覚えればOK）

```powershell
.\launch.ps1 -Force
```

**これが標準の起動方法です。常にこのコマンドを使用してください。**

## 📋 初回セットアップ

```powershell
# 1. 依存関係をインストール
npm install

# 2. アプリケーションを起動
.\launch.ps1 -Force
```

## 🎮 基本操作

1. **F11キー** - オーバーレイの表示/非表示
2. **ファイルをドロップ** - ボタンを自動作成
3. **右クリック** - コンテキストメニュー
4. **F12キー** - DevToolsを開く（デバッグ用）

## 📚 詳細ドキュメント

- **`HOW_TO_RUN.md`** - 起動方法の完全ガイド
- **`QUICK_USER_TEST.md`** - テストシナリオ
- **`README.md`** - プロジェクト概要

## ⚠️ 重要

**他のコマンドは使用しないでください:**

- ❌ `npm run dev` - Electron APIが使えない
- ❌ `npm run electron:dev` - ポート管理がない

**常に `.\launch.ps1 -Force` を使用してください。**

## 🔧 トラブルシューティング

### 起動しない場合

```powershell
# 既存プロセスを全て終了
Get-Process -Name "node","electron" | Stop-Process -Force

# 再起動
.\launch.ps1 -Force
```

### 依存関係エラー

```powershell
# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
npm install
.\launch.ps1 -Force
```

---

**それでは、`.\launch.ps1 -Force` で起動してみましょう！**
