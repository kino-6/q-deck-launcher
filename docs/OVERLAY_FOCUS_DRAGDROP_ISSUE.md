# オーバーレイフォーカス制御とドラッグ&ドロップの問題

## 問題の概要

現在の実装では、オーバーレイウィンドウがフォーカスを失うと自動的に閉じる仕様になっています。しかし、この仕様はドラッグ&ドロップ操作と競合します。

### 問題の詳細

1. **ユーザーがWindowsエクスプローラーからファイルをドラッグ開始**
   - エクスプローラーウィンドウがアクティブになる
   - オーバーレイウィンドウがフォーカスを失う

2. **オーバーレイが自動的に閉じる**
   - フォーカス喪失検知により`hideOverlay()`が呼ばれる
   - オーバーレイウィンドウが非表示になる

3. **ドロップ先が消える**
   - ユーザーはファイルをドロップできない
   - ドラッグ&ドロップ操作が失敗する

## 現在の実装

### Electronメインプロセス (`electron/main.ts`)

```typescript
overlayWindow.on('blur', () => {
  console.log('Overlay window lost focus');
  if (overlayWindow && overlayWindow.isVisible()) {
    overlayWindow.hide();
  }
});
```

この実装により、オーバーレイがフォーカスを失うと即座に閉じます。

## 解決策

### アプローチ1: ドラッグ中のフォーカス制御を無効化（推奨）

ドラッグ操作中は、フォーカス喪失による自動クローズを一時的に無効化します。

#### 実装手順

1. **ドラッグ状態の管理**
   - `useDragDrop`フックで`isDragging`状態を管理（既存）
   - ドラッグ開始時に`isDragging = true`
   - ドロップまたはキャンセル時に`isDragging = false`

2. **Electronへの通知**
   - 新しいIPCチャンネルを追加:
     - `overlay:set-drag-mode` - ドラッグモードの有効/無効を通知
   - レンダラープロセスからメインプロセスへ通知

3. **メインプロセスでの制御**
   - ドラッグモード中は`blur`イベントを無視
   - ドラッグ完了後は通常のフォーカス制御に戻る

#### コード例

**レンダラープロセス (`GridDragDrop.tsx`)**:
```typescript
// ドラッグ開始時
const handleDragEnter = useCallback((event: React.DragEvent) => {
  // ... 既存のコード ...
  if (hasFiles) {
    setDragging(true);
    // Electronに通知
    if (isElectron()) {
      window.electron.ipcRenderer.send('overlay:set-drag-mode', true);
    }
  }
}, [setDragging]);

// ドロップ完了時
const handleDrop = useCallback(async (event: React.DragEvent) => {
  // ... 既存のコード ...
  
  // ドラッグモード解除
  if (isElectron()) {
    window.electron.ipcRenderer.send('overlay:set-drag-mode', false);
  }
}, []);

// ドラッグキャンセル時
const handleDragLeave = useCallback((event: React.DragEvent) => {
  // ... 既存のコード ...
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    setDragging(false);
    setDragOverPosition(null);
    
    // ドラッグモード解除
    if (isElectron()) {
      window.electron.ipcRenderer.send('overlay:set-drag-mode', false);
    }
  }
}, [setDragging, setDragOverPosition]);
```

**メインプロセス (`electron/main.ts`)**:
```typescript
let isDragMode = false;

// IPCハンドラー追加
ipcMain.on('overlay:set-drag-mode', (event, enabled: boolean) => {
  console.log('Drag mode:', enabled);
  isDragMode = enabled;
});

// blurイベントハンドラー修正
overlayWindow.on('blur', () => {
  console.log('Overlay window lost focus');
  
  // ドラッグモード中は閉じない
  if (isDragMode) {
    console.log('Drag mode active - keeping overlay open');
    return;
  }
  
  if (overlayWindow && overlayWindow.isVisible()) {
    overlayWindow.hide();
  }
});
```

### アプローチ2: 遅延クローズ

フォーカス喪失後、一定時間（例: 500ms）待ってから閉じる。この間にドラッグ操作が開始されれば、クローズをキャンセル。

**メリット**:
- シンプルな実装
- IPCチャンネル追加不要

**デメリット**:
- タイミングによっては閉じてしまう可能性
- ユーザー体験が不安定

### アプローチ3: オーバーレイを常に最前面に保持

`setAlwaysOnTop(true)`を使用し、オーバーレイを常に最前面に保持。

**メリット**:
- ドラッグ中も確実に表示される

**デメリット**:
- 他のウィンドウの操作を妨げる
- ユーザー体験が悪い

## 推奨実装

**アプローチ1（ドラッグ中のフォーカス制御を無効化）**を推奨します。

### 理由

1. **確実性**: ドラッグ操作中は確実にオーバーレイが開いたまま
2. **ユーザー体験**: 通常時は既存の動作を維持
3. **制御性**: ドラッグ状態を明示的に管理
4. **拡張性**: 将来的な機能追加に対応しやすい

## 実装タスク

タスク2.8として追加済み:

- [ ] 2.8 ドラッグ&ドロップ - オーバーレイフォーカス制御
  - [ ] ドラッグ中はオーバーレイが閉じないように修正
  - [ ] ドラッグ開始時にフォーカス喪失による自動クローズを無効化
  - [ ] ドロップ完了後またはキャンセル後にフォーカス制御を再有効化
  - [ ] **テスト**: エクスプローラーからドラッグ中にオーバーレイが閉じないこと
  - [ ] **テスト**: ドロップ完了後は通常のフォーカス制御に戻ること
  - [ ] **テスト**: ドラッグキャンセル後は通常のフォーカス制御に戻ること

## テストシナリオ

### テスト1: ドラッグ中のオーバーレイ保持

1. オーバーレイを開く（F11）
2. Windowsエクスプローラーを開く
3. ファイルをドラッグ開始
4. オーバーレイ上にマウスを移動
5. **期待結果**: オーバーレイが閉じない

### テスト2: ドロップ後の通常動作

1. オーバーレイを開く
2. ファイルをドラッグ&ドロップ
3. ボタンが作成される
4. 別のウィンドウをクリック
5. **期待結果**: オーバーレイが閉じる

### テスト3: ドラッグキャンセル後の通常動作

1. オーバーレイを開く
2. ファイルをドラッグ開始
3. オーバーレイ外でドロップ（キャンセル）
4. 別のウィンドウをクリック
5. **期待結果**: オーバーレイが閉じる

### テスト4: 複数回のドラッグ操作

1. オーバーレイを開く
2. ファイル1をドラッグ&ドロップ
3. ファイル2をドラッグ&ドロップ
4. ファイル3をドラッグ&ドロップ
5. **期待結果**: すべての操作が正常に完了

## 関連ファイル

- `electron/main.ts` - メインプロセス、オーバーレイウィンドウ管理
- `electron/preload.ts` - IPCブリッジ
- `src/components/GridDragDrop.tsx` - ドラッグ&ドロップ処理
- `src/hooks/useDragDrop.ts` - ドラッグ状態管理
- `src/lib/electron-adapter.ts` - Electron API アダプター

## 参考情報

### Electron API

- `BrowserWindow.on('blur')` - フォーカス喪失イベント
- `ipcMain.on()` - IPCメッセージ受信
- `ipcRenderer.send()` - IPCメッセージ送信

### HTML5 Drag and Drop API

- `dragenter` - ドラッグ開始
- `dragleave` - ドラッグ離脱
- `dragover` - ドラッグ中
- `drop` - ドロップ

## まとめ

この問題は、ドラッグ&ドロップ機能を実装する上で重要な課題です。ドラッグ中のフォーカス制御を適切に管理することで、ユーザーがスムーズにファイルをドロップできるようになります。

推奨実装（アプローチ1）により、以下を実現します:

✅ ドラッグ中はオーバーレイが閉じない
✅ 通常時は既存のフォーカス制御を維持
✅ ユーザー体験の向上
✅ 確実なドラッグ&ドロップ操作
