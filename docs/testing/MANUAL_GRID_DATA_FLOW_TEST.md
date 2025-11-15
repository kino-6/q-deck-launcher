# Manual Grid Data Flow Verification Test

## Purpose
This document provides step-by-step instructions to manually verify that data flows correctly from configuration to the Grid component.

## Prerequisites
- Application must be built: `npm run build`
- Config file must exist with at least one profile and page with buttons

## Test Procedure

### Step 1: Launch Application in Development Mode

```bash
npm run electron:dev
```

**Expected Result:**
- Application launches without errors
- Console shows no critical errors

### Step 2: Open Developer Tools

1. Press `F12` or `Ctrl+Shift+I` to open DevTools
2. Navigate to the Console tab

### Step 3: Show Overlay

1. Press `F11` to show the overlay

**Expected Result:**
- Overlay appears on screen
- No errors in console

### Step 4: Verify Config Loading

**Check Console for:**
```
🔧 Grid component initialized with: { config: {...}, currentProfile: {...}, currentPage: {...} }
```

**Verification Checklist:**
- [ ] Console shows Grid initialization log
- [ ] `config` object is not null/undefined
- [ ] `config.profiles` array exists and has length > 0
- [ ] `currentProfile` object is not null/undefined
- [ ] `currentPage` object is not null/undefined

**Manual Inspection in Console:**
```javascript
// Type this in the console to inspect the data
document.querySelector('.grid')
```

**Expected Result:**
- Returns a DOM element (not null)
- Element has CSS class 'grid'

### Step 5: Verify Profile Data

**Check UI for:**
- Profile name displayed in navigation header (top of overlay)
- Profile name is not empty or "undefined"

**Manual Inspection in Console:**
```javascript
// Check profile name
document.querySelector('.profile-name')?.textContent
```

**Expected Result:**
- Returns a non-empty string (e.g., "Development", "Personal", etc.)

**Verification Checklist:**
- [ ] Profile name is visible in UI
- [ ] Profile name matches config file
- [ ] Profile name is not empty

### Step 6: Verify Page Data

**Check UI for:**
- Page name and page number displayed in navigation header
- Format: "PageName (1/3)" or similar

**Manual Inspection in Console:**
```javascript
// Check page info
document.querySelector('.page-info')?.textContent
```

**Expected Result:**
- Returns a string like "Main (1/2)" or "Page 1 (1/1)"

**Verification Checklist:**
- [ ] Page info is visible in UI
- [ ] Page name matches config file
- [ ] Page number is correct (1-indexed)
- [ ] Total pages count is correct

### Step 7: Verify Buttons Array Population

**Check UI for:**
- Grid cells are visible
- Buttons are rendered in grid cells
- Buttons have labels and/or icons

**Manual Inspection in Console:**
```javascript
// Count total grid cells
document.querySelectorAll('.grid-cell').length

// Count cells with buttons
document.querySelectorAll('.action-button').length

// Get first button's label
document.querySelector('.action-button .button-label')?.textContent
```

**Expected Results:**
- Total grid cells = rows × cols (e.g., 3 rows × 6 cols = 18 cells)
- Button count > 0 (at least some buttons exist)
- Button labels are visible and not empty

**Verification Checklist:**
- [ ] Grid cells are rendered
- [ ] At least one button is visible
- [ ] Button labels are readable
- [ ] Button icons are displayed (if configured)
- [ ] Empty cells are visible but don't have buttons

### Step 8: Verify Grid Props and Layout

**Check UI for:**
- Grid has proper CSS Grid layout
- Buttons are positioned correctly in their cells
- Grid respects configured rows and columns

**Manual Inspection in Console:**
```javascript
// Check grid styling
const grid = document.querySelector('.grid');
const style = window.getComputedStyle(grid);

console.log('Display:', style.display);  // Should be 'grid'
console.log('Grid Template Columns:', style.gridTemplateColumns);
console.log('Grid Template Rows:', style.gridTemplateRows);
console.log('Gap:', style.gap);
```

**Expected Results:**
- `display` = "grid"
- `gridTemplateColumns` = "repeat(N, 1fr)" where N = number of columns
- `gridTemplateRows` = "repeat(M, 1fr)" where M = number of rows
- `gap` = some pixel value (e.g., "8px")

**Verification Checklist:**
- [ ] Grid uses CSS Grid layout
- [ ] Grid template columns match config
- [ ] Grid template rows match config
- [ ] Grid gap is applied
- [ ] Buttons are positioned in correct cells

### Step 9: Verify Button Interaction

**Test Actions:**
1. Hover over a button
2. Click a button
3. Right-click a button

**Expected Results:**
- Hover: Button highlights or shows visual feedback
- Click: Button action executes (app launches, file opens, etc.)
- Right-click: Context menu appears

**Verification Checklist:**
- [ ] Buttons respond to hover
- [ ] Buttons execute actions on click
- [ ] Context menu appears on right-click
- [ ] No console errors during interaction

### Step 10: Verify Data Flow with Config Changes

**Test Procedure:**
1. Right-click on grid background
2. Select "Settings" from context menu
3. Change grid size (e.g., from 3×6 to 4×8)
4. Click "Save"

**Expected Results:**
- Grid updates to new size
- Existing buttons remain in their positions
- New empty cells appear
- No console errors

**Verification Checklist:**
- [ ] Config modal opens
- [ ] Grid size can be changed
- [ ] Changes are saved
- [ ] Grid re-renders with new size
- [ ] Button positions are preserved

## Verification Summary

After completing all steps, verify the following:

### ✅ Config Data Flow
- [ ] Config is loaded from file
- [ ] Config is passed to Overlay component
- [ ] Config is passed to Grid component
- [ ] Config contains profiles array
- [ ] Config contains UI settings

### ✅ Profile Data Flow
- [ ] Profile data is loaded from Zustand store
- [ ] Current profile is available in Overlay
- [ ] Current profile is passed to Grid
- [ ] Profile name is displayed in UI
- [ ] Profile index is correct

### ✅ Page Data Flow
- [ ] Page data is loaded from Zustand store
- [ ] Current page is available in Overlay
- [ ] Current page is passed to Grid
- [ ] Page name is displayed in UI
- [ ] Page index is correct
- [ ] Page rows/cols match config

### ✅ Buttons Data Flow
- [ ] Buttons array is extracted from page
- [ ] Grid cells are created from buttons
- [ ] Buttons are rendered in correct positions
- [ ] Button labels are displayed
- [ ] Button icons are displayed
- [ ] Empty cells are handled correctly

### ✅ Grid Props
- [ ] Grid receives config prop
- [ ] Grid receives currentProfile prop
- [ ] Grid receives currentPage prop
- [ ] Grid uses props to calculate layout
- [ ] Grid renders correctly based on props

## Troubleshooting

### Issue: Grid not rendering
**Possible Causes:**
- Config not loaded
- Profile/page data missing
- Grid component not receiving props

**Debug Steps:**
1. Check console for errors
2. Verify config file exists
3. Check if Overlay component loaded config
4. Verify Zustand store is initialized

### Issue: Buttons not showing
**Possible Causes:**
- Page.buttons array is empty
- Button positions are invalid
- Grid cells not created correctly

**Debug Steps:**
1. Check config file for buttons array
2. Verify button positions (row, col)
3. Check createGridCells() function
4. Verify GridCell component rendering

### Issue: Profile/Page info not displayed
**Possible Causes:**
- Zustand store not initialized
- Profile/page data not loaded
- Navigation header not rendered

**Debug Steps:**
1. Check useProfileStoreInit() hook
2. Verify IPC handlers for profile/page data
3. Check ProfileContext or Zustand store state
4. Verify navigation header conditional rendering

## Success Criteria

All verification steps must pass:
- ✅ Config loaded and passed to Grid
- ✅ Profile data available and displayed
- ✅ Page data available and displayed
- ✅ Buttons array populated and rendered
- ✅ Grid component receives correct props
- ✅ Grid layout matches configuration
- ✅ Buttons are interactive and functional

## Automated Verification

For automated verification, use the verification script:

```bash
# Build first
npm run build

# Run with Electron
npm run electron verify-grid-data-flow.js
```

Note: The automated script requires Electron to be running, so it's easier to use the manual verification steps above.
