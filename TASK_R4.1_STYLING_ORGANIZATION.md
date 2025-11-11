# Task R4.1: スタイリングの整理 (Styling Organization)

## 概要 (Overview)

このタスクでは、Q-Deckアプリケーション全体のスタイリングシステムを統一し、保守性と拡張性を向上させました。

This task unified the styling system across the Q-Deck application to improve maintainability and extensibility.

## 実装内容 (Implementation)

### 1. CSS変数の統一 (Unified CSS Variables)

**ファイル**: `src/styles/variables.css`

すべてのCSS変数を一元管理する新しいファイルを作成しました。

Created a new file to centrally manage all CSS variables.

#### 主要な変数カテゴリ (Main Variable Categories):

- **カラーパレット (Color Palette)**
  - Primary colors: `--color-primary`, `--color-primary-light`, etc.
  - Success colors: `--color-success`, `--color-success-alpha-*`
  - Error colors: `--color-error`, `--color-error-alpha-*`
  - Warning colors: `--color-warning`, `--color-warning-alpha-*`
  - Info colors: `--color-info`, `--color-info-alpha-*`
  - Neutral colors: `--color-bg-*`, `--color-surface-*`, `--color-border-*`, `--color-text-*`

- **スペーシング (Spacing)**
  - `--spacing-xs` (4px) から `--spacing-3xl` (48px) まで

- **ボーダー半径 (Border Radius)**
  - `--radius-sm` (4px) から `--radius-full` (9999px) まで

- **シャドウ (Shadows)**
  - `--shadow-sm` から `--shadow-2xl` まで
  - コンポーネント専用: `--shadow-button`, `--shadow-modal`, `--shadow-grid`

- **タイポグラフィ (Typography)**
  - Font families: `--font-family-base`, `--font-family-mono`
  - Font sizes: `--font-size-xs` から `--font-size-4xl` まで
  - Font weights: `--font-weight-normal` から `--font-weight-bold` まで
  - Line heights: `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

- **トランジション (Transitions)**
  - Duration: `--transition-fast` (100ms) から `--transition-slower` (500ms) まで
  - Timing functions: `--transition-timing`, `--transition-timing-in-out`, etc.

- **Z-Index レイヤー (Z-Index Layers)**
  - `--z-index-base` (0) から `--z-index-context-menu` (99999) まで

- **グリッドシステム (Grid System)**
  - `--grid-gap`, `--grid-cell-size`, `--grid-padding`

- **DPIスケーリング (DPI Scaling)**
  - `--effective-dpi`, `--font-scale-modifier`

#### ライトテーマサポート (Light Theme Support)

`@media (prefers-color-scheme: light)` を使用して、ライトテーマ用の変数オーバーライドを提供。

Provides variable overrides for light theme using `@media (prefers-color-scheme: light)`.

#### 高DPI対応 (High DPI Support)

1.5x, 2x, 3x, 4x のDPI比率に対応した `--effective-dpi` 変数を自動設定。

Automatically sets `--effective-dpi` variable for 1.5x, 2x, 3x, 4x DPI ratios.

### 2. テーマシステムの抽出 (Theme System Extraction)

**ファイル**: `src/styles/theme.ts`

TypeScriptベースの包括的なテーマ管理システムを作成しました。

Created a comprehensive TypeScript-based theme management system.

#### 主要な型定義 (Main Type Definitions):

```typescript
interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  transitions: ThemeTransitions;
}
```

#### デフォルトテーマ (Default Themes):

- **darkTheme**: ダークモード用のデフォルトテーマ
- **lightTheme**: ライトモード用のデフォルトテーマ

#### ユーティリティ関数 (Utility Functions):

1. **applyTheme(theme: Theme)**: テーマをドキュメントルートに適用
2. **getSystemTheme()**: システムのテーマ設定を取得
3. **watchSystemTheme(callback)**: システムテーマの変更を監視
4. **createCustomTheme(baseTheme, overrides)**: カスタムテーマを作成
5. **buttonStyleToCSS(style)**: ButtonStyleをCSSプロパティに変換
6. **getCSSVariable(name)**: CSS変数の値を取得
7. **setCSSVariable(name, value)**: CSS変数の値を設定

### 3. 統合とテスト (Integration and Testing)

#### メインエントリーポイントの更新 (Main Entry Point Update)

`src/main.tsx` に CSS変数ファイルをインポート:

```typescript
import "./styles/variables.css";
```

#### テストファイル (Test Files)

1. **src/styles/theme.test.ts** (25 tests)
   - デフォルトテーマのテスト
   - テーマ適用のテスト
   - システムテーマ検出のテスト
   - カスタムテーマ作成のテスト
   - ButtonStyle変換のテスト
   - CSS変数操作のテスト

2. **src/styles/theme-integration.test.tsx** (14 tests)
   - テーマ適用の統合テスト
   - テーマプリセット互換性テスト
   - CSS変数統合テスト
   - テーマカテゴリのテスト
   - テーマシステムの堅牢性テスト

## テスト結果 (Test Results)

### theme.test.ts
```
✓ 25 tests passed
  ✓ Default Themes (6)
  ✓ applyTheme (5)
  ✓ getSystemTheme (2)
  ✓ watchSystemTheme (1)
  ✓ createCustomTheme (3)
  ✓ buttonStyleToCSS (5)
  ✓ getCSSVariable and setCSSVariable (3)
```

### theme-integration.test.tsx
```
✓ 14 tests passed
  ✓ Theme Application (3)
  ✓ Theme Presets Compatibility (6)
  ✓ CSS Variables Integration (1)
  ✓ Theme Categories (2)
  ✓ Theme System Robustness (2)
```

**合計**: 39 tests passed ✅

## 利点 (Benefits)

### 1. 保守性の向上 (Improved Maintainability)
- すべてのスタイル変数が一箇所に集約
- 変更が容易で、影響範囲が明確

### 2. 一貫性の確保 (Consistency)
- アプリケーション全体で統一されたデザイン言語
- カラー、スペーシング、タイポグラフィの標準化

### 3. テーマ切り替えの簡素化 (Simplified Theme Switching)
- プログラマティックなテーマ切り替え
- システムテーマの自動検出と適用

### 4. 拡張性 (Extensibility)
- 新しいテーマの追加が容易
- カスタムテーマの作成をサポート

### 5. 型安全性 (Type Safety)
- TypeScriptによる完全な型定義
- コンパイル時のエラー検出

### 6. パフォーマンス (Performance)
- CSS変数によるランタイムでの効率的なスタイル変更
- 不要な再レンダリングを回避

### 7. アクセシビリティ (Accessibility)
- システムテーマ設定の尊重
- ライト/ダークモードの自動対応

## 使用例 (Usage Examples)

### テーマの適用 (Applying a Theme)

```typescript
import { applyTheme, darkTheme, lightTheme } from './styles/theme';

// ダークテーマを適用
applyTheme(darkTheme);

// ライトテーマを適用
applyTheme(lightTheme);
```

### システムテーマの検出 (Detecting System Theme)

```typescript
import { getSystemTheme, watchSystemTheme } from './styles/theme';

// 現在のシステムテーマを取得
const currentTheme = getSystemTheme(); // 'light' | 'dark'

// システムテーマの変更を監視
const unwatch = watchSystemTheme((theme) => {
  console.log('System theme changed to:', theme);
  applyTheme(theme === 'dark' ? darkTheme : lightTheme);
});

// 監視を停止
unwatch();
```

### カスタムテーマの作成 (Creating Custom Theme)

```typescript
import { createCustomTheme, darkTheme } from './styles/theme';

const customTheme = createCustomTheme(darkTheme, {
  name: 'Custom Dark',
  colors: {
    ...darkTheme.colors,
    primary: '#ff0000',
  },
});

applyTheme(customTheme);
```

### CSS変数の使用 (Using CSS Variables)

```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal) var(--transition-timing);
}
```

### ButtonStyleの適用 (Applying ButtonStyle)

```typescript
import { buttonStyleToCSS } from './styles/theme';
import type { ButtonStyle } from './lib/platform-api';

const style: ButtonStyle = {
  background_color: '#646cff',
  text_color: '#ffffff',
  border_radius: 8,
};

const cssProperties = buttonStyleToCSS(style);
// { 'background-color': '#646cff', 'color': '#ffffff', 'border-radius': '8px' }

// Apply to element
Object.entries(cssProperties).forEach(([key, value]) => {
  element.style.setProperty(key, value);
});
```

## 今後の改善案 (Future Improvements)

1. **テーマプリセットの拡張**
   - より多くのテーマバリエーションを追加
   - ユーザーカスタムテーマの保存機能

2. **アニメーションテーマ**
   - アニメーション設定のテーマ化
   - モーション設定の統一

3. **コンポーネント固有のテーマ**
   - コンポーネントレベルでのテーマオーバーライド
   - スコープ付きテーマ変数

4. **テーマエディター**
   - ビジュアルテーマエディターUI
   - リアルタイムプレビュー

5. **テーマのインポート/エクスポート**
   - JSON形式でのテーマ保存
   - テーマの共有機能

## 関連ファイル (Related Files)

- `src/styles/variables.css` - CSS変数定義
- `src/styles/theme.ts` - テーマシステム
- `src/styles/theme.test.ts` - ユニットテスト
- `src/styles/theme-integration.test.tsx` - 統合テスト
- `src/main.tsx` - エントリーポイント（CSS変数インポート）
- `src/lib/themes.ts` - 既存のテーマプリセット（互換性維持）

## 結論 (Conclusion)

Task R4.1の実装により、Q-Deckアプリケーションのスタイリングシステムが大幅に改善されました。統一されたCSS変数と包括的なテーマシステムにより、保守性、一貫性、拡張性が向上し、今後の開発がより効率的になります。

The implementation of Task R4.1 has significantly improved the Q-Deck application's styling system. The unified CSS variables and comprehensive theme system enhance maintainability, consistency, and extensibility, making future development more efficient.

すべてのテーマが正しく適用されることを確認しました ✅

All themes are correctly applied ✅
