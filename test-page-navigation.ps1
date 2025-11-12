# Test script for page navigation keyboard shortcuts
# Tests arrow keys and PageUp/PageDown for page switching

Write-Host "=== Page Navigation Keyboard Test ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "This test verifies keyboard-based page navigation:" -ForegroundColor Yellow
Write-Host "  - Arrow Left/Right keys for page switching"
Write-Host "  - PageUp/PageDown keys for page switching"
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  1. Application must be running (launch.ps1)"
Write-Host "  2. Config must have a profile with multiple pages"
Write-Host ""

Write-Host "Test Steps:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Launch the application" -ForegroundColor Cyan
Write-Host "   Command: .\launch.ps1"
Write-Host ""

Write-Host "2. Press F11 to open the overlay" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Test Arrow Key Navigation" -ForegroundColor Cyan
Write-Host "   a. Press ArrowRight key"
Write-Host "      Expected: Navigate to next page (if available)"
Write-Host "   b. Press ArrowLeft key"
Write-Host "      Expected: Navigate to previous page (if available)"
Write-Host "   c. At first page, press ArrowLeft"
Write-Host "      Expected: No navigation (stay on first page)"
Write-Host "   d. At last page, press ArrowRight"
Write-Host "      Expected: No navigation (stay on last page)"
Write-Host ""

Write-Host "4. Test PageUp/PageDown Navigation" -ForegroundColor Cyan
Write-Host "   a. Press PageDown key"
Write-Host "      Expected: Navigate to next page (if available)"
Write-Host "   b. Press PageUp key"
Write-Host "      Expected: Navigate to previous page (if available)"
Write-Host "   c. At first page, press PageUp"
Write-Host "      Expected: No navigation (stay on first page)"
Write-Host "   d. At last page, press PageDown"
Write-Host "      Expected: No navigation (stay on last page)"
Write-Host ""

Write-Host "5. Test Input Field Behavior" -ForegroundColor Cyan
Write-Host "   a. Right-click on a button and select 'Edit'"
Write-Host "   b. Focus on the label input field"
Write-Host "   c. Press ArrowLeft or ArrowRight"
Write-Host "      Expected: Cursor moves in input, NO page navigation"
Write-Host "   d. Close the edit modal"
Write-Host "   e. Press ArrowLeft or ArrowRight again"
Write-Host "      Expected: Page navigation works normally"
Write-Host ""

Write-Host "6. Test Page Persistence" -ForegroundColor Cyan
Write-Host "   a. Navigate to page 2 using ArrowRight"
Write-Host "   b. Press Escape to close overlay"
Write-Host "   c. Press F11 to reopen overlay"
Write-Host "      Expected: Still on page 2 (state persisted)"
Write-Host ""

Write-Host "7. Verify Console Logs" -ForegroundColor Cyan
Write-Host "   a. Open DevTools (F12)"
Write-Host "   b. Navigate between pages"
Write-Host "      Expected: See 'Navigated to next/previous page' logs"
Write-Host "   c. Try to navigate past boundaries"
Write-Host "      Expected: See 'Already at first/last page' logs"
Write-Host ""

Write-Host "Expected Results:" -ForegroundColor Green
Write-Host "  ✓ Arrow keys navigate between pages"
Write-Host "  ✓ PageUp/PageDown keys navigate between pages"
Write-Host "  ✓ Navigation stops at first/last page"
Write-Host "  ✓ Navigation disabled when input is focused"
Write-Host "  ✓ Page state persists after closing/reopening overlay"
Write-Host "  ✓ No console errors during navigation"
Write-Host ""

Write-Host "Run automated tests:" -ForegroundColor Yellow
Write-Host "  npm test -- src/hooks/usePageNavigation.test.tsx src/components/PageNavigation.test.tsx"
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
