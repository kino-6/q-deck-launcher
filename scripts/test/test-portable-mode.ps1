# Test script for portable mode functionality
# This script tests that the application correctly detects and uses portable mode

Write-Host "=== Q-Deck Portable Mode Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if build configuration includes portable target
Write-Host "Test 1: Checking electron-builder configuration..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$hasPortableTarget = $packageJson.build.win.target -contains "portable"

if ($hasPortableTarget) {
    Write-Host "✓ Portable target is configured in electron-builder" -ForegroundColor Green
} else {
    Write-Host "✗ Portable target is NOT configured" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Check if getConfigPath function exists in main.js
Write-Host "Test 2: Checking portable mode logic in main.js..." -ForegroundColor Yellow
$mainJs = Get-Content "electron/main.js" -Raw

if ($mainJs -match "function getConfigPath\(\)") {
    Write-Host "✓ getConfigPath function exists" -ForegroundColor Green
} else {
    Write-Host "✗ getConfigPath function not found" -ForegroundColor Red
    exit 1
}

if ($mainJs -match "portableConfigPath") {
    Write-Host "✓ Portable config path logic exists" -ForegroundColor Green
} else {
    Write-Host "✗ Portable config path logic not found" -ForegroundColor Red
    exit 1
}

if ($mainJs -match "Portable mode detected") {
    Write-Host "✓ Portable mode detection message exists" -ForegroundColor Green
} else {
    Write-Host "✗ Portable mode detection message not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Verify icon cache path is relative to config location
Write-Host "Test 3: Checking icon cache path logic..." -ForegroundColor Yellow

if ($mainJs -match "const configDir = path\.dirname\(configPath\)") {
    Write-Host "✓ Config directory is determined from config path" -ForegroundColor Green
} else {
    Write-Host "✗ Config directory logic not found" -ForegroundColor Red
    exit 1
}

if ($mainJs -match "const iconCachePath = path\.join\(configDir, 'icon-cache'\)") {
    Write-Host "✓ Icon cache path is relative to config directory" -ForegroundColor Green
} else {
    Write-Host "✗ Icon cache path logic not correct" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 4: Build portable version
Write-Host "Test 4: Building portable version..." -ForegroundColor Yellow
Write-Host "Running: npm run electron:build:win" -ForegroundColor Gray

try {
    npm run electron:build:win 2>&1 | Out-Null
    
    # Check if portable executable was created
    $portableExe = Get-ChildItem -Path "release" -Filter "*.exe" -Recurse | Where-Object { $_.Name -notmatch "Setup" -and $_.Name -notmatch "Installer" }
    
    if ($portableExe) {
        Write-Host "✓ Portable executable created: $($portableExe.Name)" -ForegroundColor Green
    } else {
        Write-Host "✗ Portable executable not found in release directory" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Build failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== All Portable Mode Tests Passed ===" -ForegroundColor Green
Write-Host ""
Write-Host "Manual Testing Instructions:" -ForegroundColor Cyan
Write-Host "1. Copy the portable executable to a test directory" -ForegroundColor White
Write-Host "2. Create a config.yaml file in the same directory as the executable" -ForegroundColor White
Write-Host "3. Run the portable executable" -ForegroundColor White
Write-Host "4. Verify that the application uses the config.yaml from the executable directory" -ForegroundColor White
Write-Host "5. Check that icon-cache folder is created in the same directory" -ForegroundColor White
Write-Host ""
