#!/usr/bin/env pwsh
# Test script for file path extraction in drag & drop

Write-Host "=== File Path Extraction Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the q-deck-launcher directory" -ForegroundColor Red
    exit 1
}

Write-Host "Starting Electron app in development mode..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=== TEST INSTRUCTIONS ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Wait for the app to start and open Developer Tools (F12)" -ForegroundColor White
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host "3. Open File Explorer" -ForegroundColor White
Write-Host "4. Navigate to C:\Windows\System32" -ForegroundColor White
Write-Host "5. Drag notepad.exe onto an empty grid cell" -ForegroundColor White
Write-Host "6. Check the console output" -ForegroundColor White
Write-Host ""
Write-Host "=== EXPECTED CONSOLE OUTPUT ===" -ForegroundColor Green
Write-Host ""
Write-Host "  🔧 Electron drop handler" -ForegroundColor Gray
Write-Host "  ✅ Full file path extracted: C:\Windows\System32\notepad.exe" -ForegroundColor Gray
Write-Host "  📁 All dropped file paths: ['C:\Windows\System32\notepad.exe']" -ForegroundColor Gray
Write-Host "  ✅ All paths are full paths" -ForegroundColor Gray
Write-Host ""
Write-Host "=== VERIFICATION CHECKLIST ===" -ForegroundColor Green
Write-Host ""
Write-Host "  [ ] Path includes drive letter (C:)" -ForegroundColor Yellow
Write-Host "  [ ] Path is absolute (not relative)" -ForegroundColor Yellow
Write-Host "  [ ] Path includes full directory structure" -ForegroundColor Yellow
Write-Host "  [ ] No warning messages appear" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== ADDITIONAL TESTS ===" -ForegroundColor Green
Write-Host ""
Write-Host "Test 2: Drop multiple files at once" -ForegroundColor White
Write-Host "Test 3: Drop a file with spaces in the name" -ForegroundColor White
Write-Host "Test 4: Drop a file from a different drive (if available)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the app when done testing" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting app..." -ForegroundColor Cyan
Write-Host ""

# Start the Electron app
npm run electron:dev
