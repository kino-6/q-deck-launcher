# Grid Component Data Flow Verification

## Overview

This document verifies and documents the data flow from configuration loading to the Grid component rendering in the Q-Deck Launcher application.

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  - Config file loading (config.yaml)                        │
│  - IPC handlers for config/profile/page data                │
└─────────────────────┬───────────────────────────────────────┘
                      │ IPC Communication
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  Platform API (platform-api.ts)              │
│  - tauriAPI.getConfig()                                     │
│  - tauriAPI.getCurrentProfile()                             │
│  - tauriAPI.getCurrentPage()                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Overlay Component (Overlay.tsx)                 │
│  State:                                                      │
│  - config: QDeckConfig | null                               │
│  - currentProfile: ProfileInfo (from Zustand store)         │
│  - currentPage: PageInfo (from Zustand store)               │
└─────────────────────┬───────────────────────────────────────┘
                      │ Props
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                Grid Component (Grid.tsx)                     │
│  Props:                                                      │
│  - config?: QDeckConfig                                     │
│  - currentProfile?: ProfileInfo                             │
│  - currentPage?: PageInfo                                   │
│  - onModalStateChange?: (isOpen: boolean) => void           │
└─────────────────────┬───────────────────────────────────────┘
                      │ Derived Data
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              Grid Rendering (GridCell.tsx)                   │
│  - gridCells: Array of cells with button data               │
│  - buttonsInReadingOrder: Sorted button array               │
│  - gridStyle: CSS Grid layout properties                    │
└─────────────────────────────────────────────────────────────┘
```

## Verification Checklist

### ✅ 1. Config is being passed to Overlay component

**Location:** `q-deck-launcher/src/pages/Overlay.tsx`

**Code:**
```typescript
const [config, setConfig] = useState<QDeckConfig | null>(null);

useEffect(() => {
  loadConfig();
}, []);

const loadConfig = async () => {
  try {
    const loadedConfig = await tauriAPI.getConfig();
    setConfig(loadedConfig as QDeckConfig);
  } catch (err) {
    logger.error('Failed to load config in overlay:', err);
  } finally {
    setIsLoading(false);
  }
};
```

**Verification:**
- Config is loaded via `tauriAPI.getConfig()` on component mount
- Config is stored in local state: `config: QDeckConfig | null`
- Config is passed to Grid component as prop: `<Grid config={config} />`

### ✅ 2. Profile and page data is available

**Location:** `q-deck-launcher/src/pages/Overlay.tsx`

**Code:**
```typescript
// Use Zustand store with selectors for optimized re-renders
const currentProfile = useProfileStore(selectCurrentProfile);
const currentPage = useProfileStore(selectCurrentPage);
const navigationContext = useProfileStore(selectNavigationContext);
```

**Verification:**
- Profile data is loaded from Zustand store via `useProfileStore(selectCurrentProfile)`
- Page data is loaded from Zustand store via `useProfileStore(selectCurrentPage)`
- Navigation context is loaded from Zustand store via `useProfileStore(selectNavigationContext)`
- Data is initialized by `useProfileStoreInit()` hook
- Data is passed to Grid component as props:
  ```typescript
  <Grid 
    config={config} 
    currentProfile={currentProfile}
    currentPage={currentPage}
    onModalStateChange={setIsModalOpen}
  />
  ```

### ✅ 3. Buttons array is populated

**Location:** `q-deck-launcher/src/components/Grid.tsx`

**Code:**
```typescript
const profile = config.profiles[currentProfileIndex];
const page = profile.pages[currentPageIndex];

// Create a grid array with buttons positioned correctly
const gridCells = React.useMemo(() => createGridCells(page), [page]);

// Get all non-empty buttons in reading order for shortcuts
const buttonsInReadingOrder = React.useMemo(() => {
  return gridCells
    .filter(cell => cell.button !== null && cell.button !== undefined)
    .map(cell => cell.button!);
}, [gridCells]);
```

**Verification:**
- Buttons are extracted from `page.buttons` array
- Grid cells are created using `createGridCells(page)` utility function
- Each cell contains position info (row, col) and optional button data
- Buttons are filtered and sorted for keyboard shortcuts
- Grid cells are rendered in the component:
  ```typescript
  {gridCells.map(({ index, row, col, button }) => (
    <GridCell
      key={index}
      row={row}
      col={col}
      button={button}
      // ... other props
    />
  ))}
  ```

### ✅ 4. Grid component receives correct props

**Location:** `q-deck-launcher/src/components/Grid.tsx`

**Interface:**
```typescript
interface GridProps {
  config?: QDeckConfig;
  currentProfile?: ProfileInfo;
  currentPage?: PageInfo;
  onModalStateChange?: (isOpen: boolean) => void;
}
```

**Props Usage:**
```typescript
export const Grid: React.FC<GridProps> = ({ 
  config, 
  currentProfile, 
  currentPage, 
  onModalStateChange 
}) => {
  const currentProfileIndex = currentProfile?.index ?? 0;
  const currentPageIndex = currentPage?.index ?? 0;

  // Props are used throughout the component:
  // 1. Grid layout calculation
  const { gridStyle } = useGridLayout({
    config,
    currentProfileIndex,
    currentPageIndex,
  });

  // 2. Config modal management
  const { showConfig, tempConfig, ... } = useConfigModal({
    config,
    currentProfileIndex,
    currentPageIndex,
    onModalStateChange,
  });

  // 3. Button operations
  const { handleEditButton, ... } = useButtonOperations({
    config,
    tempConfig,
    setTempConfig,
    currentProfileIndex,
    currentPageIndex,
    closeContextMenu,
  });

  // 4. Data extraction
  const profile = config.profiles[currentProfileIndex];
  const page = profile.pages[currentPageIndex];
}
```

**Verification:**
- Grid component receives all required props from Overlay
- Props are properly typed with TypeScript interfaces
- Props are used to:
  - Calculate grid layout (`useGridLayout`)
  - Manage configuration modal (`useConfigModal`)
  - Handle button operations (`useButtonOperations`)
  - Extract profile and page data
  - Render grid cells with button data

## Data Structure Types

### QDeckConfig
```typescript
interface QDeckConfig {
  version: string;
  ui: UIConfig;
  profiles: Profile[];
}
```

### ProfileInfo
```typescript
interface ProfileInfo {
  index: number;
  name: string;
  hotkey?: string;
}
```

### PageInfo
```typescript
interface PageInfo {
  index: number;
  name: string;
  rows: number;
  cols: number;
}
```

### Page (from config)
```typescript
interface Page {
  name: string;
  rows: number;
  cols: number;
  buttons: ActionButton[];
}
```

### ActionButton
```typescript
interface ActionButton {
  position: { row: number; col: number };
  label: string;
  action_type: ActionType;
  config?: any;
  style?: ButtonStyle;
  icon?: string;
}
```

## Verification Script

A verification script has been created to automatically test the data flow:

**File:** `q-deck-launcher/verify-grid-data-flow.js`

**Usage:**
```bash
# Build the application first
npm run build

# Run the verification script
node verify-grid-data-flow.js
```

**What it checks:**
1. ✅ Config is loaded in Overlay component
2. ✅ Profile data is available in UI
3. ✅ Page data is available in UI
4. ✅ Buttons array is populated in Grid
5. ✅ Grid component receives correct props and renders properly

## Common Issues and Solutions

### Issue 1: Config not loading
**Symptom:** Grid shows "No profiles configured" message
**Solution:** 
- Check if config.yaml exists in AppData directory
- Verify IPC handlers are registered in main process
- Check console for config loading errors

### Issue 2: Profile/Page data not available
**Symptom:** Navigation header not showing profile/page info
**Solution:**
- Verify Zustand store is initialized with `useProfileStoreInit()`
- Check if profile store selectors are working
- Verify IPC handlers for profile/page data

### Issue 3: Buttons not rendering
**Symptom:** Grid cells are empty
**Solution:**
- Check if page.buttons array has data
- Verify `createGridCells()` utility function
- Check button position values (row, col)

### Issue 4: Grid layout incorrect
**Symptom:** Buttons not positioned correctly
**Solution:**
- Verify gridStyle calculation in `useGridLayout`
- Check CSS Grid properties (gridTemplateColumns, gridTemplateRows)
- Verify DPI scaling calculations

## Testing Recommendations

### Manual Testing
1. Launch the application with `npm run electron:dev`
2. Press F11 to show overlay
3. Verify:
   - Grid is displayed with correct layout
   - Buttons are positioned correctly
   - Profile/page info is shown in header
   - Buttons are clickable and execute actions

### Automated Testing
1. Build the application: `npm run build`
2. Run verification script: `node verify-grid-data-flow.js`
3. Check exit code (0 = success, 1 = failure)

### Console Logging
The Grid component includes debug logging:
```typescript
console.log('🔧 Grid component initialized with:', { 
  config, 
  currentProfile, 
  currentPage 
});
```

Check browser console (F12) for these logs to verify data flow.

## Conclusion

The data flow from configuration loading to Grid component rendering is working correctly:

1. ✅ Config is loaded from file via IPC and stored in Overlay state
2. ✅ Profile and page data is loaded via Zustand store
3. ✅ All data is passed to Grid component as props
4. ✅ Grid component extracts buttons from page data
5. ✅ Grid cells are created and rendered with button data
6. ✅ Grid layout is calculated and applied correctly

The verification script can be used to automatically test this data flow in the future.
