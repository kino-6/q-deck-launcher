#!/usr/bin/env pwsh
# Test script for Page Indicator feature

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Page Indicator Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This test verifies the page indicator functionality:" -ForegroundColor Yellow
Write-Host "1. Page indicator displays when there are multiple pages" -ForegroundColor White
Write-Host "2. Current page is correctly highlighted" -ForegroundColor White
Write-Host "3. Page name and count are displayed" -ForegroundColor White
Write-Host "4. Navigation hints show when appropriate" -ForegroundColor White
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "- Config file with multiple pages in a profile" -ForegroundColor White
Write-Host "- Application running in development mode" -ForegroundColor White
Write-Host ""

# Check if config file exists
$configPath = "$env:APPDATA\q-deck-launcher\config.yaml"
if (-not (Test-Path $configPath)) {
    Write-Host "❌ Config file not found at: $configPath" -ForegroundColor Red
    Write-Host "Please run the application first to create a config file." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Config file found" -ForegroundColor Green
Write-Host ""

Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host ""

# Start the application
$process = Start-Process -FilePath "npm" -ArgumentList "run", "electron:dev" -WorkingDirectory "." -PassThru -NoNewWindow

Write-Host "Application started (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Test Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Press F11 to open the overlay" -ForegroundColor Yellow
Write-Host "   Expected: Overlay opens with grid" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Check if page indicator is visible at the bottom" -ForegroundColor Yellow
Write-Host "   Expected: Page indicator shows if profile has multiple pages" -ForegroundColor Gray
Write-Host "   - Page dots (one for each page)" -ForegroundColor Gray
Write-Host "   - Current page name" -ForegroundColor Gray
Write-Host "   - Page count (e.g., '1 / 3')" -ForegroundColor Gray
Write-Host "   - Navigation hints (← / PageUp, → / PageDown)" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Press Right Arrow or PageDown" -ForegroundColor Yellow
Write-Host "   Expected: Navigate to next page" -ForegroundColor Gray
Write-Host "   - Page indicator updates" -ForegroundColor Gray
Write-Host "   - Active dot moves to next position" -ForegroundColor Gray
Write-Host "   - Page name and count update" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Press Left Arrow or PageUp" -ForegroundColor Yellow
Write-Host "   Expected: Navigate to previous page" -ForegroundColor Gray
Write-Host "   - Page indicator updates" -ForegroundColor Gray
Write-Host "   - Active dot moves to previous position" -ForegroundColor Gray
Write-Host "   - Page name and count update" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Navigate to first page" -ForegroundColor Yellow
Write-Host "   Expected: Only 'next' hint is shown (→ / PageDown)" -ForegroundColor Gray
Write-Host ""

Write-Host "6. Navigate to last page" -ForegroundColor Yellow
Write-Host "   Expected: Only 'previous' hint is shown (← / PageUp)" -ForegroundColor Gray
Write-Host ""

Write-Host "7. Switch to a profile with only one page" -ForegroundColor Yellow
Write-Host "   Expected: Page indicator is hidden" -ForegroundColor Gray
Write-Host ""

Write-Host "8. Press Escape to close the overlay" -ForegroundColor Yellow
Write-Host "   Expected: Overlay closes" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Visual Checks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Page Indicator Appearance:" -ForegroundColor Yellow
Write-Host "- Semi-transparent dark background" -ForegroundColor Gray
Write-Host "- Rounded corners with subtle border" -ForegroundColor Gray
Write-Host "- Centered at bottom of screen" -ForegroundColor Gray
Write-Host "- Smooth animations when changing pages" -ForegroundColor Gray
Write-Host ""

Write-Host "Page Dots:" -ForegroundColor Yellow
Write-Host "- Inactive dots: small circles, semi-transparent" -ForegroundColor Gray
Write-Host "- Active dot: elongated pill shape, bright blue with glow" -ForegroundColor Gray
Write-Host ""

Write-Host "Navigation Hints:" -ForegroundColor Yellow
Write-Host "- Previous hint: orange/amber color" -ForegroundColor Gray
Write-Host "- Next hint: green color" -ForegroundColor Gray
Write-Host "- Monospace font for keyboard shortcuts" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to stop the application..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop the application
Stop-Process -Id $process.Id -Force
Write-Host ""
Write-Host "Application stopped" -ForegroundColor Green
Write-Host ""

Write-Host "Did all tests pass? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "✓ Page Indicator tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the implementation." -ForegroundColor Red
    exit 1
}
