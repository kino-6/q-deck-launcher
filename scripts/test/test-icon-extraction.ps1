#!/usr/bin/env pwsh
# Test script for icon extraction functionality

Write-Host "=== Q-Deck Icon Extraction Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if the app is running
Write-Host "Starting Q-Deck Launcher..." -ForegroundColor Yellow
npm run electron:dev

# Instructions for manual testing
Write-Host ""
Write-Host "=== Manual Test Instructions ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Press F11 to open the overlay" -ForegroundColor White
Write-Host "2. Drag and drop an .exe file (e.g., notepad.exe, calc.exe) onto the grid" -ForegroundColor White
Write-Host "3. Verify that:" -ForegroundColor White
Write-Host "   - A button is created at the drop position" -ForegroundColor Gray
Write-Host "   - The button shows the extracted icon from the executable" -ForegroundColor Gray
Write-Host "   - If icon extraction fails, a default icon (🚀) is shown" -ForegroundColor Gray
Write-Host "4. Click the button to verify it launches the application" -ForegroundColor White
Write-Host ""
Write-Host "Test executable locations:" -ForegroundColor Yellow
Write-Host "  - C:\Windows\System32\notepad.exe" -ForegroundColor Gray
Write-Host "  - C:\Windows\System32\calc.exe" -ForegroundColor Gray
Write-Host "  - C:\Windows\System32\mspaint.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "Icon cache location:" -ForegroundColor Yellow
Write-Host "  - %APPDATA%\q-deck-launcher\icon-cache\" -ForegroundColor Gray
Write-Host ""
