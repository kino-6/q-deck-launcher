# Test Theme Selection Functionality
# This script tests the theme selection feature

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Theme Selection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test Scenario:" -ForegroundColor Yellow
Write-Host "1. Launch the application" -ForegroundColor White
Write-Host "2. Press F11 to open overlay" -ForegroundColor White
Write-Host "3. Right-click on a button" -ForegroundColor White
Write-Host "4. Select 'Change Theme' from context menu" -ForegroundColor White
Write-Host "5. Browse different theme categories" -ForegroundColor White
Write-Host "6. Search for a specific theme" -ForegroundColor White
Write-Host "7. Apply a theme to the button" -ForegroundColor White
Write-Host "8. Verify the theme is saved and persists" -ForegroundColor White
Write-Host ""

Write-Host "Expected Results:" -ForegroundColor Yellow
Write-Host "✓ Theme selector modal opens when 'Change Theme' is clicked" -ForegroundColor Green
Write-Host "✓ Category tabs are visible (Modern, Neon, Gaming, etc.)" -ForegroundColor Green
Write-Host "✓ Theme cards display with preview buttons" -ForegroundColor Green
Write-Host "✓ Search functionality filters themes correctly" -ForegroundColor Green
Write-Host "✓ Clicking 'Apply Theme' applies the theme to the button" -ForegroundColor Green
Write-Host "✓ Theme changes are saved to config.yaml" -ForegroundColor Green
Write-Host "✓ Theme persists after reloading the application" -ForegroundColor Green
Write-Host ""

Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host ""

# Launch the application
& npm run electron:dev

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Test Instructions:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Press F11 to open the overlay" -ForegroundColor White
Write-Host "2. Right-click on any button" -ForegroundColor White
Write-Host "3. Click 'Change Theme' in the context menu" -ForegroundColor White
Write-Host "4. Verify the theme selector modal opens" -ForegroundColor White
Write-Host "5. Click on different category tabs (Modern, Neon, Gaming, etc.)" -ForegroundColor White
Write-Host "6. Verify themes change based on selected category" -ForegroundColor White
Write-Host "7. Type 'blue' in the search box" -ForegroundColor White
Write-Host "8. Verify only blue-themed options appear" -ForegroundColor White
Write-Host "9. Hover over a theme card to see the preview panel" -ForegroundColor White
Write-Host "10. Click 'Apply Theme' on a theme" -ForegroundColor White
Write-Host "11. Verify the button's appearance changes" -ForegroundColor White
Write-Host "12. Press F11 to close overlay, then reopen with F11" -ForegroundColor White
Write-Host "13. Verify the theme persists on the button" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the application when testing is complete" -ForegroundColor Yellow
