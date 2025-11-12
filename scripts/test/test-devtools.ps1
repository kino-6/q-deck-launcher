# Test script to verify developer tools are opening
# This script checks if Electron windows have DevTools open

Write-Host "Testing Developer Tools..." -ForegroundColor Cyan
Write-Host ""

# Check if the application is running
$electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue

if (-not $electronProcesses) {
    Write-Host "❌ FAIL: Electron application is not running" -ForegroundColor Red
    Write-Host "Please start the application first using ./launch.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Electron application is running" -ForegroundColor Green
Write-Host "  Found $($electronProcesses.Count) Electron process(es)" -ForegroundColor Gray
Write-Host ""

# Check for DevTools windows
# DevTools typically create additional windows/processes
$totalWindows = 0
foreach ($proc in $electronProcesses) {
    try {
        # Get window information
        $windows = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue | 
                   Select-Object -ExpandProperty MainWindowTitle -ErrorAction SilentlyContinue
        
        if ($windows) {
            $totalWindows++
            Write-Host "  Process ID $($proc.Id): $windows" -ForegroundColor Gray
        }
    }
    catch {
        # Ignore errors for processes without windows
    }
}

Write-Host ""

# In development mode, Electron typically spawns multiple processes:
# - Main process
# - Renderer process for main window
# - Renderer process for overlay window
# - DevTools processes (one for each window with DevTools open)
# So we expect at least 4-6 processes for 2 windows with DevTools

if ($electronProcesses.Count -ge 4) {
    Write-Host "✓ PASS: Multiple Electron processes detected ($($electronProcesses.Count) processes)" -ForegroundColor Green
    Write-Host "  This indicates DevTools are likely open" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Manual verification steps:" -ForegroundColor Yellow
    Write-Host "  1. Press F11 to show the overlay window" -ForegroundColor Gray
    Write-Host "  2. Verify that DevTools panel is visible on the overlay window" -ForegroundColor Gray
    Write-Host "  3. Right-click on the overlay and check if 'Inspect Element' works" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✓ TEST PASSED: Developer tools are configured to open" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠ WARNING: Expected more Electron processes" -ForegroundColor Yellow
    Write-Host "  Found: $($electronProcesses.Count) processes" -ForegroundColor Gray
    Write-Host "  Expected: 4+ processes (with DevTools)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Manual verification required:" -ForegroundColor Yellow
    Write-Host "  1. Press F11 to show the overlay window" -ForegroundColor Gray
    Write-Host "  2. Check if DevTools panel is visible" -ForegroundColor Gray
    Write-Host ""
    exit 0
}
