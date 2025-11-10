# Electron 29+ でのファイルドロップ問題

## 問題

Electron 29以降では、`File.path`プロパティが削除されました。これにより、レンダラープロセスからファイルのフルパスにアクセスできなくなりました。

## 試した方法（すべて失敗）

1. ❌ `file.path` - Electron 29+で削除
2. ❌ `will-navigate` - ファイルドロップでは発火しない
3. ❌ `setWindowOpenHandler` - ファイルドロップでは発火しない
4. ❌ Preload scriptで`File.path` - 同じく削除されている
5. ❌ IPCでファイル名を送信 - フルパスを取得できない

## 解決策

### 方法1: electron-drag-drop パッケージ（推奨）

```bash
npm install @electron/remote
```

```javascript
// main.js
const { enable } = require('@electron/remote/main');
enable(overlayWindow.webContents);

// renderer
const { webContents } = require('@electron/remote');
webContents.on('drop', (event, files) => {
  console.log('Files:', files); // Full paths available
});
```

### 方法2: Native Module

カスタムネイティブモジュールを作成して、ファイルパスを取得する。

### 方法3: Electronをダウングレード

Electron 28以前のバージョンを使用する（非推奨）。

```json
{
  "devDependencies": {
    "electron": "^28.0.0"
  }
}
```

### 方法4: ファイル選択ダイアログを使用

ドラッグ&ドロップの代わりに、ファイル選択ダイアログを使用する。

```javascript
const { dialog } = require('electron');

const result = await dialog.showOpenDialog({
  properties: ['openFile', 'multiSelections']
});

console.log('Selected files:', result.filePaths);
```

## 推奨アプローチ

**Phase 2を一時停止し、Phase 3（アクション実行システム）に進む**

理由：
1. ドラッグ&ドロップは現在のElectronバージョンでは実装が困難
2. 手動でボタンを追加する機能（Phase 4）で代替可能
3. アクション実行システムの方が優先度が高い

## 代替案

1. **ファイル選択ダイアログ**でボタンを追加
2. **設定画面**で手動でボタンを設定
3. **YAMLファイル**を直接編集

これらの方法なら、フルパスを確実に取得できます。
