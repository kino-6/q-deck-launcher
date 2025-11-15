# Test Profile Hotkeys
# Tests profile-specific hotkey functionality

Write-Host "=== Profile Hotkey Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if config file exists
$configPath = "$env:APPDATA\q-deck-launcher\config.yaml"
if (-not (Test-Path $configPath)) {
    Write-Host "❌ Config file not found at: $configPath" -ForegroundColor Red
    Write-Host "Please run the application first to create the config file." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Config file found" -ForegroundColor Green
Write-Host ""

# Read and display current config
Write-Host "Current Configuration:" -ForegroundColor Yellow
$configContent = Get-Content $configPath -Raw
Write-Host $configContent
Write-Host ""

# Check if profiles have hotkeys defined
Write-Host "Checking for profile hotkeys..." -ForegroundColor Yellow
if ($configContent -match "hotkey:") {
    Write-Host "✅ Profile hotkeys found in config" -ForegroundColor Green
} else {
    Write-Host "⚠️  No profile hotkeys found in config" -ForegroundColor Yellow
    Write-Host "Adding sample profile hotkeys..." -ForegroundColor Cyan
    
    # Backup original config
    Copy-Item $configPath "$configPath.backup" -Force
    Write-Host "✅ Config backed up to: $configPath.backup" -ForegroundColor Green
    
    # Add hotkeys to profiles
    $configContent = $configContent -replace "(\s+name:\s*['\"]?Development['\"]?)", "`$1`n    hotkey: 'Ctrl+1'"
    $configContent = $configContent -replace "(\s+name:\s*['\"]?Gaming['\"]?)", "`$1`n    hotkey: 'Ctrl+2'"
    $configContent = $configContent -replace "(\s+name:\s*['\"]?Work['\"]?)", "`$1`n    hotkey: 'Ctrl+3'"
    
    Set-Content $configPath $configContent -Force
    Write-Host "✅ Profile hotkeys added to config" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Manual Test Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the application:" -ForegroundColor White
Write-Host "   .\launch.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test profile hotkeys:" -ForegroundColor White
Write-Host "   - Press Ctrl+1 to switch to first profile" -ForegroundColor Gray
Write-Host "   - Press Ctrl+2 to switch to second profile" -ForegroundColor Gray
Write-Host "   - Press Ctrl+3 to switch to third profile" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Expected behavior:" -ForegroundColor White
Write-Host "   - Overlay should show when pressing profile hotkey" -ForegroundColor Gray
Write-Host "   - Profile should switch to the corresponding profile" -ForegroundColor Gray
Write-Host "   - Profile name should be displayed in the navigation header" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify in console:" -ForegroundColor White
Write-Host "   - Look for 'Profile hotkey Ctrl+X pressed for profile: Y'" -ForegroundColor Gray
Write-Host "   - Look for 'Switched to profile: Y (index: Z)'" -ForegroundColor Gray
Write-Host "   - Look for 'Profile changed event received:' in renderer" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start the app
Write-Host "Do you want to start the application now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting application..." -ForegroundColor Cyan
    & ".\launch.ps1"
} else {
    Write-Host ""
    Write-Host "Test preparation complete. Run .\launch.ps1 when ready." -ForegroundColor Green
}
