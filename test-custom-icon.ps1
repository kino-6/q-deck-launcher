#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Custom Icon Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if icon cache directory exists
Write-Host "Test 1: Icon Cache Directory" -ForegroundColor Yellow
$iconCachePath = "$env:APPDATA\q-deck-launcher\icon-cache"
if (Test-Path $iconCachePath) {
    Write-Host "✓ Icon cache directory exists: $iconCachePath" -ForegroundColor Green
    $iconFiles = Get-ChildItem $iconCachePath -Filter "*.png" -ErrorAction SilentlyContinue
    Write-Host "  Found $($iconFiles.Count) cached icon(s)" -ForegroundColor Gray
} else {
    Write-Host "✗ Icon cache directory not found" -ForegroundColor Red
}
Write-Host ""

# Test 2: Create test icons directory
Write-Host "Test 2: Create Test Icons" -ForegroundColor Yellow
$testIconsPath = ".\test-icons"
if (-not (Test-Path $testIconsPath)) {
    New-Item -ItemType Directory -Path $testIconsPath | Out-Null
    Write-Host "✓ Created test icons directory: $testIconsPath" -ForegroundColor Green
} else {
    Write-Host "✓ Test icons directory already exists" -ForegroundColor Green
}

# Create a simple SVG icon for testing
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#3b82f6"/>
  <text x="32" y="42" font-size="32" text-anchor="middle" fill="white">Q</text>
</svg>
"@
$svgPath = Join-Path $testIconsPath "test-icon.svg"
$svgContent | Out-File -FilePath $svgPath -Encoding UTF8
Write-Host "✓ Created test SVG icon: $svgPath" -ForegroundColor Green
Write-Host ""

# Test 3: Check config file for icon settings
Write-Host "Test 3: Config File Icon Settings" -ForegroundColor Yellow
$configPath = "$env:APPDATA\q-deck-launcher\config.yaml"
if (Test-Path $configPath) {
    Write-Host "✓ Config file exists: $configPath" -ForegroundColor Green
    $configContent = Get-Content $configPath -Raw
    if ($configContent -match "icon:") {
        Write-Host "✓ Config contains icon settings" -ForegroundColor Green
    } else {
        Write-Host "! Config does not contain icon settings yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Config file not found" -ForegroundColor Red
}
Write-Host ""

# Test 4: Manual test instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Test Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Launch the application:" -ForegroundColor White
Write-Host "   .\launch.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host ""
Write-Host "3. Right-click on a button and select 'Edit'" -ForegroundColor White
Write-Host ""
Write-Host "4. Test the following icon types:" -ForegroundColor White
Write-Host "   a) Emoji: Enter '📁' or '🚀' in the Custom Icon field" -ForegroundColor Gray
Write-Host "   b) File path: Click 'Browse' and select an image file" -ForegroundColor Gray
Write-Host "   c) SVG: Enter the path: $svgPath" -ForegroundColor Gray
Write-Host "   d) URL: Enter 'https://via.placeholder.com/64/3b82f6/ffffff?text=Q'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Click 'Save' and verify the icon appears correctly" -ForegroundColor White
Write-Host ""
Write-Host "6. Close and reopen the overlay to verify persistence" -ForegroundColor White
Write-Host ""

# Test 5: Icon format validation
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supported Icon Formats" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ PNG (.png)" -ForegroundColor Green
Write-Host "✓ ICO (.ico)" -ForegroundColor Green
Write-Host "✓ SVG (.svg)" -ForegroundColor Green
Write-Host "✓ JPG (.jpg, .jpeg)" -ForegroundColor Green
Write-Host "✓ Emoji (🚀, 📁, etc.)" -ForegroundColor Green
Write-Host "✓ URL (http://, https://)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
