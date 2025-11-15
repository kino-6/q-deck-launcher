#!/usr/bin/env pwsh
# Test script for Electron drag & drop functionality

Write-Host "=== Electron Drag & Drop Test Script ===" -ForegroundColor Cyan
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
Write-Host "Test Instructions:" -ForegroundColor Green
Write-Host "1. Wait for the app to start" -ForegroundColor White
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host "3. Open File Explorer and navigate to a folder with files" -ForegroundColor White
Write-Host "4. Drag a file (e.g., notepad.exe from C:\Windows\System32) onto the grid" -ForegroundColor White
Write-Host "5. Drop it on an empty cell" -ForegroundColor White
Write-Host "6. Check the console for drag & drop logs" -ForegroundColor White
Write-Host "7. Verify a button is created at the drop position" -ForegroundColor White
Write-Host ""
Write-Host "Expected Console Output:" -ForegroundColor Green
Write-Host "  🎯 HTML dragEnter event fired" -ForegroundColor Gray
Write-Host "  📥 Files detected in drag enter" -ForegroundColor Gray
Write-Host "  📥 HTML drop event" -ForegroundColor Gray
Write-Host "  🔧 Electron drop handler" -ForegroundColor Gray
Write-Host "  📁 Dropped file paths: [...]" -ForegroundColor Gray
Write-Host "  ✅ Successfully added button for [filename]" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the app when done testing" -ForegroundColor Yellow
Write-Host ""

# Start the Electron app
npm run electron:dev
