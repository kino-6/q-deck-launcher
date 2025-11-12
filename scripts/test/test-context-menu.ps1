#!/usr/bin/env pwsh

Write-Host "=== Context Menu Test ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test verifies that right-clicking on a button displays a context menu." -ForegroundColor Yellow
Write-Host ""
Write-Host "Test Steps:" -ForegroundColor Green
Write-Host "1. Launch the application with: npm run electron:dev" -ForegroundColor White
Write-Host "2. Press F11 to show the overlay" -ForegroundColor White
Write-Host "3. Right-click on any button in the grid" -ForegroundColor White
Write-Host "4. Verify that a context menu appears with the following options:" -ForegroundColor White
Write-Host "   - Edit (✏️ 編集)" -ForegroundColor Gray
Write-Host "   - Theme (🎨 テーマ変更)" -ForegroundColor Gray
Write-Host "   - Delete (🗑️ 削除)" -ForegroundColor Gray
Write-Host "   - Settings (⚙️ グリッド設定)" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Green
Write-Host "✓ Context menu appears at the cursor position" -ForegroundColor White
Write-Host "✓ Menu shows the button label in the header" -ForegroundColor White
Write-Host "✓ All menu items are visible and clickable" -ForegroundColor White
Write-Host "✓ Clicking outside the menu closes it" -ForegroundColor White
Write-Host "✓ Pressing Escape closes the menu" -ForegroundColor White
Write-Host ""
Write-Host "Starting application..." -ForegroundColor Cyan
npm run electron:dev
