# Task 2.8 - 簡略化された実装

## 実装日: 2024-11-10

## 変更内容

### 問題点
当初の実装では、ドラッグ状態を管理してblurイベント時の自動クローズを制御しようとしていましたが、以下の問題がありました：

1. **フォーカス喪失のタイミング**: エクスプローラーでファイルを選択した時点でオーバーレイがフォーカスを失い、ドラッグ開始前に閉じてしまう
2. **ドラッグ状態の重複設定**: `dragOver`イベントで毎回`setDragState(true)`が呼ばれ、ログが大量に出力される
3. **複雑な状態管理**: ドラッグ開始・終了・キャンセルの各タイミングで状態をリセットする必要があり、コードが複雑化

### 解決策

**シンプルな方針**: オーバーレイを表示している間は、フォーカスを失っても自動的に閉じないようにする。ユーザーがF11を押して明示的に閉じるまで表示し続ける。

この方針により：
- ✅ ドラッグ&ドロップが確実に動作する
- ✅ コードがシンプルになる
- ✅ ユーザーの意図が明確（F11で開く→F11で閉じる）

## 変更されたファイル

### 1. electron/main.js

**変更前**:
```javascript
// Track drag state to prevent auto-close during drag operations
let isDragging = false;

overlayWindow.on('blur', () => {
  // Hide overlay when it loses focus, but not during drag operations
  if (overlayWindow && overlayWindow.isVisible() && !isDragging) {
    console.log('Overlay lost focus - hiding');
    overlayWindow.hide();
  } else if (isDragging) {
    console.log('Overlay lost focus during drag - keeping visible');
  }
});

// IPC handlers for drag state management
ipcMain.handle('set-drag-state', async (event, dragging) => {
  console.log('Drag state changed:', dragging);
  isDragging = dragging;
  return { success: true };
});
```

**変更後**:
```javascript
// Note: Removed blur event auto-close behavior
// Overlay now stays visible until explicitly closed with F11 hotkey
// This allows drag and drop from external applications without the overlay closing
```

**変更内容**:
- ❌ `isDragging`変数を削除
- ❌ `blur`イベントハンドラーを削除
- ❌ `set-drag-state` IPCハンドラーを削除

### 2. electron/preload.cjs

**変更前**:
```javascript
// Drag state management
setDragState: (dragging) => ipcRenderer.invoke('set-drag-state', dragging),
```

**変更後**:
```javascript
// (削除)
```

**変更内容**:
- ❌ `setDragState`関数を削除

### 3. src/lib/electron-adapter.ts

**変更前**:
```typescript
interface ElectronAPI {
  // ... other methods ...
  setDragState: (dragging: boolean) => Promise<any>;
  // ...
}

// ... in platformAPI ...
setDragState: async (dragging: boolean) => {
  if (isElectron()) {
    return window.electronAPI!.setDragState(dragging);
  } else if (isTauri()) {
    return { success: true };
  }
  throw new Error('No platform API available');
}
```

**変更後**:
```typescript
interface ElectronAPI {
  // ... other methods ...
  // (setDragState削除)
}

// ... in platformAPI ...
// (setDragState削除)
```

**変更内容**:
- ❌ `ElectronAPI`インターフェースから`setDragState`を削除
- ❌ `platformAPI`から`setDragState`メソッドを削除

### 4. src/components/GridDragDrop.tsx

**変更前**:
```typescript
const dragStateSetRef = useRef<boolean>(false);

const handleDragEnter = useCallback(async (event: React.DragEvent) => {
  // ...
  if (!dragStateSetRef.current) {
    dragStateSetRef.current = true;
    await tauriAPI.setDragState(true);
  }
}, [setDragging]);

const handleDragLeave = useCallback(async (event: React.DragEvent) => {
  // ...
  dragStateSetRef.current = false;
  await tauriAPI.setDragState(false);
}, [setDragging, setDragOverPosition]);

const handleDragOver = useCallback(async (event: React.DragEvent) => {
  // ...
  if (!dragStateSetRef.current) {
    dragStateSetRef.current = true;
    await tauriAPI.setDragState(true);
  }
}, [calculateDropPosition, setDragOverPosition, setDragging]);

// ... in handleFileDrop ...
finally {
  dragStateSetRef.current = false;
  await tauriAPI.setDragState(false);
}
```

**変更後**:
```typescript
// dragStateSetRef削除

const handleDragEnter = useCallback((event: React.DragEvent) => {
  // ...
  setDragging(true);
  // setDragState呼び出し削除
}, [setDragging]);

const handleDragLeave = useCallback((event: React.DragEvent) => {
  // ...
  setDragging(false);
  // setDragState呼び出し削除
}, [setDragging, setDragOverPosition]);

const handleDragOver = useCallback((event: React.DragEvent) => {
  // ...
  // setDragState呼び出し削除
}, [calculateDropPosition, setDragOverPosition]);

// ... in handleFileDrop ...
finally {
  resetDragState();
  // setDragState呼び出し削除
}
```

**変更内容**:
- ❌ `dragStateSetRef`を削除
- ❌ すべての`tauriAPI.setDragState()`呼び出しを削除
- ❌ すべての`dragStateSetRef.current`の設定を削除
- ✅ ビジュアルフィードバック用の`setDragging()`は維持

## 動作確認

### テスト手順

1. アプリケーションを起動:
   ```bash
   npm run electron:dev
   ```

2. F11を押してオーバーレイを表示

3. エクスプローラーを開く
   - ✅ オーバーレイは閉じない（以前は閉じていた）

4. エクスプローラーからファイルをドラッグしてオーバーレイのグリッドにドロップ
   - ✅ ドラッグ中もオーバーレイは表示され続ける
   - ✅ ドロップするとボタンが作成される

5. F11を押してオーバーレイを閉じる
   - ✅ オーバーレイが閉じる

### 期待される動作

- ✅ F11でオーバーレイを開く
- ✅ 他のアプリケーションにフォーカスを移してもオーバーレイは表示され続ける
- ✅ エクスプローラーからファイルをドラッグ&ドロップできる
- ✅ F11でオーバーレイを閉じる

### 以前の問題点（解決済み）

- ❌ エクスプローラーにフォーカスを移すとオーバーレイが閉じる → ✅ 解決
- ❌ ドラッグ中にオーバーレイが閉じる → ✅ 解決
- ❌ `Drag state changed: true`が8回も呼ばれる → ✅ 解決（呼び出し自体を削除）

## コードの簡略化

### 削除されたコード量

- **main.js**: 約20行削除
- **preload.cjs**: 1行削除
- **electron-adapter.ts**: 約15行削除
- **GridDragDrop.tsx**: 約50行削除

**合計**: 約86行のコードを削除し、シンプルで保守しやすいコードになりました。

## 利点

1. **シンプル**: 複雑なドラッグ状態管理が不要
2. **確実**: フォーカス喪失による予期しない動作がない
3. **直感的**: F11で開く→F11で閉じる、というシンプルな操作
4. **保守性**: コードが少なく、バグが入りにくい

## 注意点

- オーバーレイは明示的に閉じるまで表示され続けます
- 他のアプリケーションを使用する際は、F11でオーバーレイを閉じることを推奨します
- これは意図的な設計であり、ドラッグ&ドロップを確実に動作させるための仕様です

## まとめ

当初の複雑なドラッグ状態管理を削除し、「オーバーレイはF11で明示的に開閉する」というシンプルな仕様に変更しました。これにより：

- ✅ ドラッグ&ドロップが確実に動作する
- ✅ コードがシンプルで保守しやすい
- ✅ ユーザーの操作が明確

この変更により、Task 2.8の目的である「ドラッグ中はオーバーレイが閉じないように修正」が達成されました。
