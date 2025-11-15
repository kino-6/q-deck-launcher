# 🚨 CRITICAL: ファイルパス取得問題

## 問題の本質

**Task 2.4**と**Task 2.9**は完了マークがついていますが、実際にはファイルのフルパスが取得できていません。

### 現状
```
📍 File path: undefined
```

### 影響範囲
- ✅ Task 2.3: ドラッグ&ドロップイベントは動作
- ❌ Task 2.4: フルパスが取得できない ← **ブロッカー**
- ❌ Task 2.5以降: すべてフルパスが必要

## 根本原因

Electronの`contextIsolation: true`環境では、レンダラープロセスから`File.path`プロパティに直接アクセスできません。

### 試した方法（失敗）

1. **Injected code with file.path**
   ```javascript
   const filePath = file.path; // undefined
   ```

2. **Object.getOwnPropertyDescriptor**
   ```javascript
   const pathDescriptor = Object.getOwnPropertyDescriptor(file, 'path');
   // pathDescriptor is undefined
   ```

3. **will-navigate event**
   ```javascript
   contents.on('will-navigate', (event, navigationUrl) => {
     // ファイルドロップでは発火しない
   });
   ```

## 正しい解決方法

Electronの公式ドキュメントによると、`webContents.on('will-navigate')`ではなく、**カスタムプロトコル**または**IPC with File System Access API**を使う必要があります。

### 解決策1: Native Drag & Drop with IPC (推奨)

メインプロセスで`app.on('web-contents-created')`を使い、ドロップイベントを完全にインターセプトします。

```javascript
// electron/main.js
app.on('web-contents-created', (event, contents) => {
  // Prevent default file drop behavior
  contents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault();
    }
  });
  
  // Set up custom drop handler
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file://')) {
      const filePath = decodeURIComponent(url.replace('file:///', ''));
      contents.send('file-drop-paths', [filePath]);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
});
```

### 解決策2: electron-drag-drop module

サードパーティモジュールを使用：

```bash
npm install electron-drag-drop
```

```javascript
const { setupFileDrop } = require('electron-drag-drop');

setupFileDrop(overlayWindow.webContents, (filePaths) => {
  overlayWindow.webContents.send('file-drop-paths', filePaths);
});
```

### 解決策3: Custom Protocol Handler

カスタムプロトコルを登録：

```javascript
protocol.registerFileProtocol('drop-file', (request, callback) => {
  const url = request.url.substr(12); // 'drop-file://' を削除
  callback({ path: decodeURIComponent(url) });
});
```

## 実装計画

1. **解決策1を実装**（最もシンプル）
2. **Task 2.4のテストを再実行**
3. **Task 2.9のテストを再実行**
4. **両方パスしたら、Task 2.5以降に進む**

## 次のステップ

この問題を解決しない限り、Phase 2は完了できません。

**優先度: P0 (最高)**
**ブロッカー: Task 2.5, 2.6, 2.7, 2.10以降すべて**
