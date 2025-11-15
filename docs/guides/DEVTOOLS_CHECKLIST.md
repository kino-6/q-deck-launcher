# DevTools Testing Checklist

Quick reference checklist for testing the overlay window with DevTools.

## Quick Start

```powershell
# Method 1: Automated test
node test-devtools-overlay.js

# Method 2: Manual test
npm run electron:dev
# Then press F11 to open overlay
```

## Manual Testing Checklist

### ✓ Console Tab Checks

Open DevTools → Console tab:

- [ ] No red errors visible
- [ ] No "Cannot read property" errors
- [ ] No "Failed to load resource" errors
- [ ] No "Uncaught TypeError" errors
- [ ] No React warnings about keys or props
- [ ] Config object is loaded (check logs)
- [ ] IPC handlers registered (check logs)

**Quick test in Console:**
```javascript
// Should return config object, not null/undefined
window.__QDECK_CONFIG__
```

### ✓ Network Tab Checks

Open DevTools → Network tab, then reload overlay (F11 twice):

- [ ] All JS files load (200 status)
- [ ] All CSS files load (200 status)
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] Icon files load correctly
- [ ] Total load time < 500ms

**Expected files:**
- `index.html` or overlay route
- `main.js` / `overlay.js`
- `vendor.js`
- `Grid.css`
- Icon files (if any)

### ✓ Elements Tab Checks

Open DevTools → Elements tab:

- [ ] `<div class="overlay">` exists
- [ ] `<div class="grid">` exists
- [ ] Grid cells are rendered
- [ ] Buttons are rendered inside cells
- [ ] CSS styles are applied correctly
- [ ] No inline style errors

**Quick inspection:**
1. Right-click on grid area
2. Select "Inspect Element"
3. Verify DOM structure matches expected hierarchy

### ✓ Components Tab Checks (React DevTools)

Open DevTools → Components tab (requires React DevTools extension):

- [ ] `<Overlay>` component is mounted
- [ ] `<Grid>` component is rendered
- [ ] `<ActionButton>` components exist
- [ ] Props are passed correctly
- [ ] State values are correct
- [ ] No "undefined" props

**Component hierarchy:**
```
Overlay
└─ ProfileProvider
   └─ Grid
      ├─ PageIndicator
      ├─ GridCell (multiple)
      │  └─ ActionButton
      └─ ThemeSelector
```

### ✓ Performance Tab Checks

Open DevTools → Performance tab:

1. Click Record
2. Press F11 to open overlay
3. Click a button
4. Press F11 to close overlay
5. Stop recording

Check:
- [ ] Overlay opens in < 200ms
- [ ] No long tasks (> 50ms)
- [ ] Smooth 60fps animations
- [ ] No excessive re-renders

### ✓ Memory Tab Checks

Open DevTools → Memory tab:

1. Take heap snapshot
2. Open/close overlay 10 times
3. Take another heap snapshot
4. Compare

Check:
- [ ] Heap size stabilizes (no continuous growth)
- [ ] No detached DOM nodes
- [ ] Event listeners are cleaned up

## Common Issues

### Issue: Grid Not Visible

**Check:**
1. Console for errors
2. Network tab for failed CSS loads
3. Elements tab - verify grid div exists
4. Components tab - verify Grid component mounted

### Issue: Buttons Not Clickable

**Check:**
1. Elements tab - verify button elements exist
2. Event Listeners panel - verify click handlers attached
3. Computed styles - check z-index and pointer-events

### Issue: Icons Not Loading

**Check:**
1. Network tab - look for 404 errors
2. Console - check for icon extraction errors
3. Verify icon-cache directory exists

## Automated Checks

The `test-devtools-overlay.js` script automatically checks:

- ✓ Overlay window initialization
- ✓ Console errors and warnings
- ✓ Network request failures
- ✓ React component issues

Run it with:
```powershell
node test-devtools-overlay.js
```

## Reporting

When reporting issues, include:

1. **Screenshot of Console tab** (with errors)
2. **Screenshot of Network tab** (showing failed requests)
3. **Screenshot of Elements tab** (showing DOM structure)
4. **React component tree** (from Components tab)
5. **Steps to reproduce**
6. **Expected vs actual behavior**

## Resources

- Full guide: `DEV_TOOLS_TESTING_GUIDE.md`
- Electron DevTools: https://www.electronjs.org/docs/latest/tutorial/devtools-extension
- React DevTools: https://react.dev/learn/react-developer-tools
