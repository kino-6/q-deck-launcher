# Test script for Grid Resize functionality (Task 4.1)
# Tests: グリッドサイズを変更できること、グリッドが正しく表示されること

Write-Host "=== Grid Resize Test (Task 4.1) ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Steps:" -ForegroundColor Yellow
Write-Host "1. Launch the application"
Write-Host "2. Press F11 to open the overlay"
Write-Host "3. Right-click on the grid background"
Write-Host "4. Click 'Settings' in the context menu"
Write-Host "5. Try changing the grid size (e.g., from 4×6 to 3×6)"
Write-Host "6. Click 'Save'"
Write-Host "7. Verify the grid resizes correctly"
Write-Host "8. Press F11 to close and reopen - verify size persists"
Write-Host ""

Write-Host "Expected Results:" -ForegroundColor Green
Write-Host "✓ Grid displays with correct initial size (4×6)"
Write-Host "✓ Settings modal shows current grid size highlighted"
Write-Host "✓ Clicking different grid size updates the preview"
Write-Host "✓ After saving, grid resizes smoothly"
Write-Host "✓ Grid cells are properly aligned in CSS Grid layout"
Write-Host "✓ Buttons remain in their correct positions"
Write-Host "✓ Empty cells are visible and properly spaced"
Write-Host "✓ After reopening, the new size is maintained"
Write-Host ""

Write-Host "Starting application..." -ForegroundColor Cyan
npm run electron:dev
