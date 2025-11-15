# Test script for LaunchApp action (Task 3.1)
# This script tests that notepad.exe and calc.exe can be launched

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LaunchApp Action Test (Task 3.1)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This test verifies that the LaunchApp action can launch applications using child_process." -ForegroundColor White
Write-Host ""

Write-Host "Test Steps:" -ForegroundColor Yellow
Write-Host "1. Start the application with: .\launch.ps1" -ForegroundColor White
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host "3. Click on the 'Notepad' button (row 1, col 1)" -ForegroundColor White
Write-Host "4. Verify that Notepad opens" -ForegroundColor White
Write-Host "5. Press F11 again to reopen the overlay" -ForegroundColor White
Write-Host "6. Click on the 'Calculator' button (row 1, col 3)" -ForegroundColor White
Write-Host "7. Verify that Calculator opens" -ForegroundColor White
Write-Host ""

Write-Host "Expected Results:" -ForegroundColor Yellow
Write-Host "  ✓ Notepad.exe launches successfully" -ForegroundColor Green
Write-Host "  ✓ Calculator (calc.exe) launches successfully" -ForegroundColor Green
Write-Host "  ✓ Applications run independently (overlay can be closed)" -ForegroundColor Green
Write-Host "  ✓ No errors in the console" -ForegroundColor Green
Write-Host ""

Write-Host "Default Button Configuration:" -ForegroundColor Yellow
Write-Host "  - Row 1, Col 1: Notepad (notepad.exe)" -ForegroundColor Gray
Write-Host "  - Row 1, Col 3: Calculator (calc.exe)" -ForegroundColor Gray
Write-Host ""

Write-Host "Console Output to Check:" -ForegroundColor Yellow
Write-Host "  When clicking a button, you should see:" -ForegroundColor Gray
Write-Host "    Executing action: LaunchApp { path: 'notepad.exe' }" -ForegroundColor Gray
Write-Host "    or" -ForegroundColor Gray
Write-Host "    Executing action: LaunchApp { path: 'calc.exe' }" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to start the application..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Starting application..." -ForegroundColor Green
& ".\launch.ps1"
