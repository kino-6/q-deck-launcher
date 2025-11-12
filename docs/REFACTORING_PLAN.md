# Grid.tsx リファクタリング計画

## 現状分析

**Grid.tsx**: 840行 - 複雑度が高い

### 責務の分析

Grid.tsxは現在、以下の責務を持っている：

1. **グリッドレイアウト管理** (100行)
   - セルサイズ計算
   - グリッドスタイル生成
   - レスポンシブ対応

2. **設定管理** (150行)
   - 設定モーダルの表示/非表示
   - グリッドサイズ変更
   - テーマカラー変更
   - 設定の保存

3. **コンテキストメニュー管理** (100行)
   - ボタン用メニュー
   - 空セル用メニュー
   - グリッド背景用メニュー

4. **ボタン操作** (150行)
   - ボタン削除
   - ボタン追加
   - ボタン編集
   - テーマ適用

5. **システムアクション** (50行)
   - 設定画面表示
   - オーバーレイ制御

6. **画面情報管理** (50行)
   - DPIスケール
   - 画面サイズ検出

7. **Undo機能** (50行)
   - Undo操作

8. **レンダリング** (190行)
   - グリッドセル生成
   - モーダル表示
   - コンテキストメニュー表示

## リファクタリング戦略

### Phase 1: カスタムフック抽出

#### 1.1 `useGridLayout.ts`
```typescript
// グリッドレイアウト関連のロジック
export const useGridLayout = (config, currentProfileIndex, currentPageIndex) => {
  const calculateOptimalCellSize = useCallback(...);
  const calculateOptimalGapSize = useCallback(...);
  const gridStyle = useMemo(...);
  
  return { optimalCellSize, optimalGapSize, gridStyle };
};
```

#### 1.2 `useScreenInfo.ts`
```typescript
// 画面情報とDPI管理
export const useScreenInfo = () => {
  const [screenInfo, setScreenInfo] = useState(...);
  const [dpiScale, setDpiScale] = useState(1);
  
  useEffect(() => {
    // DPI検出とリサイズハンドリング
  }, []);
  
  return { screenInfo, dpiScale };
};
```

#### 1.3 `useConfigModal.ts`
```typescript
// 設定モーダル管理
export const useConfigModal = (config, currentProfileIndex, currentPageIndex) => {
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState(null);
  
  const openConfig = useCallback(...);
  const closeConfig = useCallback(...);
  const saveConfig = useCallback(...);
  const updateGridSize = useCallback(...);
  const updateThemeColor = useCallback(...);
  
  return {
    showConfig,
    tempConfig,
    openConfig,
    closeConfig,
    saveConfig,
    updateGridSize,
    updateThemeColor
  };
};
```

#### 1.4 `useContextMenu.ts`
```typescript
// コンテキストメニュー管理
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({...});
  
  const handleContextMenu = useCallback(...);
  const handleEmptyCellContextMenu = useCallback(...);
  const handleGridBackgroundContextMenu = useCallback(...);
  const closeContextMenu = useCallback(...);
  
  return {
    contextMenu,
    handleContextMenu,
    handleEmptyCellContextMenu,
    handleGridBackgroundContextMenu,
    closeContextMenu
  };
};
```

#### 1.5 `useButtonOperations.ts`
```typescript
// ボタン操作（追加、削除、編集）
export const useButtonOperations = (config, tempConfig, setTempConfig, currentProfileIndex, currentPageIndex) => {
  const handleRemoveButton = useCallback(...);
  const handleAddButton = useCallback(...);
  const handleEditButton = useCallback(...);
  const handleUndo = useCallback(...);
  
  return {
    handleRemoveButton,
    handleAddButton,
    handleEditButton,
    handleUndo
  };
};
```

#### 1.6 `useThemeSelector.ts`
```typescript
// テーマセレクター管理
export const useThemeSelector = (tempConfig) => {
  const [themeSelector, setThemeSelector] = useState({...});
  
  const handleThemeButton = useCallback(...);
  const handleThemeSelect = useCallback(...);
  const closeThemeSelector = useCallback(...);
  
  return {
    themeSelector,
    handleThemeButton,
    handleThemeSelect,
    closeThemeSelector
  };
};
```

### Phase 2: コンポーネント分割

#### 2.1 `ConfigModal.tsx`
```typescript
// 設定モーダルを独立したコンポーネントに
export const ConfigModal: React.FC<ConfigModalProps> = ({
  isVisible,
  config,
  tempConfig,
  currentProfileIndex,
  currentPageIndex,
  onClose,
  onSave,
  onUpdateGridSize,
  onUpdateThemeColor,
  onUndo
}) => {
  // モーダルのレンダリングロジック
};
```

#### 2.2 `GridCell.tsx`
```typescript
// グリッドセルを独立したコンポーネントに
export const GridCell: React.FC<GridCellProps> = ({
  row,
  col,
  button,
  isDragOver,
  dpiScale,
  screenInfo,
  onSystemAction,
  onContextMenu,
  onEmptyCellContextMenu
}) => {
  // セルのレンダリングロジック
};
```

### Phase 3: ユーティリティ関数抽出

#### 3.1 `gridCalculations.ts`
```typescript
// グリッド計算関連のユーティリティ
export const calculateOptimalCellSize = (...) => {...};
export const calculateOptimalGapSize = (...) => {...};
export const getDPICategory = (...) => {...};
```

#### 3.2 `configOperations.ts`
```typescript
// 設定操作のユーティリティ
export const updateButtonInConfig = (...) => {...};
export const removeButtonFromConfig = (...) => {...};
export const addButtonToConfig = (...) => {...};
```

## リファクタリング実行計画

### ステップ1: テスト準備
```powershell
# 現在の状態をstash
git add .
git stash push -m "Before Grid.tsx refactoring"

# 全テストを実行してベースラインを確立
npm test
```

### ステップ2: カスタムフック抽出（1つずつ）
1. `useScreenInfo.ts` を作成
2. Grid.tsxから該当コードを移動
3. テスト実行 → OK確認
4. コミット

5. `useGridLayout.ts` を作成
6. Grid.tsxから該当コードを移動
7. テスト実行 → OK確認
8. コミット

（以下同様に1つずつ）

### ステップ3: コンポーネント分割
1. `ConfigModal.tsx` を作成
2. Grid.tsxから該当コードを移動
3. テスト実行 → OK確認
4. コミット

5. `GridCell.tsx` を作成
6. Grid.tsxから該当コードを移動
7. テスト実行 → OK確認
8. コミット

### ステップ4: 最終検証
```powershell
# 全テストを実行
npm test

# 手動テスト
npm run dev
# QUICK_USER_TEST.mdのシナリオを実行

# 問題なければコミット
git add .
git commit -m "Refactor: Split Grid.tsx into smaller modules"
```

### ステップ5: 問題があった場合
```powershell
# stashから元に戻す
git stash pop
```

## 期待される結果

### リファクタリング前
- `Grid.tsx`: 840行

### リファクタリング後
- `Grid.tsx`: ~150行（メインロジックのみ）
- `hooks/useScreenInfo.ts`: ~80行
- `hooks/useGridLayout.ts`: ~100行
- `hooks/useConfigModal.ts`: ~150行
- `hooks/useContextMenu.ts`: ~100行
- `hooks/useButtonOperations.ts`: ~150行
- `hooks/useThemeSelector.ts`: ~80行
- `components/ConfigModal.tsx`: ~150行
- `components/GridCell.tsx`: ~80行
- `utils/gridCalculations.ts`: ~50行
- `utils/configOperations.ts`: ~100行

**合計**: 約1,190行（モジュール化により若干増加するが、可読性と保守性が大幅に向上）

## メリット

1. **可読性向上**: 各ファイルが単一責任を持つ
2. **テスト容易性**: 各フックとユーティリティを個別にテスト可能
3. **再利用性**: フックを他のコンポーネントでも使用可能
4. **保守性向上**: 変更の影響範囲が明確
5. **並行開発**: 複数人で異なるファイルを同時に編集可能

## 次のステップ

このリファクタリングを実行しますか？実行する場合は、以下のコマンドで開始できます：

```powershell
# 現在の状態を保存
git add .
git stash push -m "Before Grid.tsx refactoring"

# リファクタリング開始
# 私が1つずつステップを実行します
```
