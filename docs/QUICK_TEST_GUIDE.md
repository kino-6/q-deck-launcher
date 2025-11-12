# Quick Test Guide - Drop Position Detection

## Quick Start

1. **Start the application**:
   ```bash
   cd q-deck-launcher
   npm run electron:dev
   ```

2. **Open the overlay**:
   - Press F11 (or click the overlay window if visible)

3. **Test drag and drop**:
   - Open Windows Explorer
   - Drag a file (e.g., notepad.exe, a .txt file, or any file)
   - Hover over different grid cells
   - Observe the green highlight on cells
   - Drop the file on a cell

## What to Look For

### ✅ Success Indicators

1. **Visual Feedback**:
   - Grid border turns green when dragging
   - Cell highlights with green border when hovering
   - Drop indicator shows in empty cells

2. **Console Logs** (check terminal):
   ```
   🎯 Calculating drop position for coordinates: { mouseX: 450, mouseY: 300 }
   📐 Grid bounds: { left: 200, right: 800, ... }
   ✅ Drop position found: { row: 2, col: 3 }
   ✅ Valid drop position: { row: 2, col: 3 }
   ```

3. **Button Creation**:
   - Button appears at the dropped position
   - Button label matches the file name
   - Page reloads to show the new button

### ❌ Error Cases to Test

1. **Drop Outside Grid**:
   - Drop file in the margin area
   - Should show alert: "Please drop files inside the grid cells"
   - Console: "⚠️ Drop position is outside grid bounds"

2. **Drop in Gap**:
   - Drop file precisely between two cells
   - Should show alert: "Please drop files inside the grid cells"
   - Console: "⚠️ No cell found at drop position (between cells or in gap)"

## Quick Test Checklist

- [ ] Drag file over grid - grid turns green
- [ ] Hover over cell - cell highlights
- [ ] Drop on cell - button created at correct position
- [ ] Drop outside grid - error message shown
- [ ] Drop in gap - error message shown
- [ ] Test with 2×4 grid size
- [ ] Test with 5×8 grid size
- [ ] Drop .exe file - creates LaunchApp button
- [ ] Drop .txt file - creates Open button

## Troubleshooting

**Grid not visible?**
- Press F11 to toggle overlay
- Check if overlay window is behind other windows

**No visual feedback?**
- Check browser console (F12) for errors
- Verify Grid.css is loaded

**Drop not working?**
- Check console for error messages
- Verify file has full path (should contain `:` or start with `/`)
- Try dropping a different file type

**Position incorrect?**
- Check console logs for calculated position
- Verify grid cell has data-row and data-col attributes
- Try resizing window and testing again

## Console Commands

Open DevTools (F12) and try:

```javascript
// Check grid element
document.querySelector('.grid')

// Check grid cells
document.querySelectorAll('.grid-cell').length

// Check cell attributes
Array.from(document.querySelectorAll('.grid-cell')).map(cell => ({
  row: cell.dataset.row,
  col: cell.dataset.col
}))
```

## Next Steps

After verifying drop position detection works:

1. Update `TEST_DROP_POSITION_DETECTION.md` with test results
2. Take screenshots of visual feedback
3. Copy console logs to documentation
4. Move to next task: 2.6 ドラッグ&ドロップ - ボタン生成

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Review `DROP_POSITION_IMPLEMENTATION.md` for technical details
3. Verify all files are saved and application is restarted
4. Check that you're using the latest code changes
