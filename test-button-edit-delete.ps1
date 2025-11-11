# Test script for button edit and delete functionality
# This script verifies that:
# 1. Right-clicking a button shows a context menu
# 2. The context menu has Edit and Delete options
# 3. Clicking Delete removes the button
# 4. The deletion persists after reload

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Button Edit/Delete Functionality Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Steps:" -ForegroundColor Yellow
Write-Host "1. Launch the application" -ForegroundColor White
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host "3. Right-click on any button" -ForegroundColor White
Write-Host "4. Verify context menu appears with:" -ForegroundColor White
Write-Host "   - 編集 (Edit) option" -ForegroundColor Gray
Write-Host "   - テーマ変更 (Change Theme) option" -ForegroundColor Gray
Write-Host "   - 削除 (Delete) option" -ForegroundColor Gray
Write-Host "5. Click '編集' to open edit modal" -ForegroundColor White
Write-Host "6. Verify you can change:" -ForegroundColor White
Write-Host "   - Background color" -ForegroundColor Gray
Write-Host "   - Text color" -ForegroundColor Gray
Write-Host "   - Font size" -ForegroundColor Gray
Write-Host "   - Font family" -ForegroundColor Gray
Write-Host "   - Custom icon" -ForegroundColor Gray
Write-Host "7. Save changes and verify they persist" -ForegroundColor White
Write-Host "8. Right-click the button again" -ForegroundColor White
Write-Host "9. Click '削除' to delete the button" -ForegroundColor White
Write-Host "10. Verify the button is removed" -ForegroundColor White
Write-Host "11. Press F11 to close and reopen overlay" -ForegroundColor White
Write-Host "12. Verify the button is still deleted" -ForegroundColor White
Write-Host ""

Write-Host "Starting application..." -ForegroundColor Green
Write-Host ""

# Launch the application
& ".\launch.ps1"
