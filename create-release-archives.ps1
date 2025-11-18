# Release Archive Creation Script
# Creates ZIP archive for GitHub Release

$ErrorActionPreference = "Stop"

Write-Host "=== Q-Deck Launcher Release Archive Creator ===" -ForegroundColor Cyan
Write-Host ""

# Paths
$exePath = "release\Q-Deck Launcher 0.1.0.exe"
$zipPath = "Q-Deck.Launcher.0.1.0.zip"

# Check if exe exists
if (-not (Test-Path $exePath)) {
    Write-Host "❌ Error: $exePath not found!" -ForegroundColor Red
    Write-Host "Please build the application first: npm run electron:build:win" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Creating ZIP archive..." -ForegroundColor Yellow

# Remove existing ZIP if present
if (Test-Path $zipPath) {
    Write-Host "Removing existing ZIP..." -ForegroundColor Gray
    Remove-Item $zipPath -Force
}

try {
    # Create ZIP using .NET (more reliable than Compress-Archive)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    # Create temporary directory
    $tempDir = New-Item -ItemType Directory -Path "temp_zip" -Force
    
    # Copy exe to temp directory with new name
    Copy-Item $exePath -Destination "$tempDir\Q-Deck.Launcher.0.1.0.exe"
    
    # Create ZIP
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir.FullName, $zipPath, 'Optimal', $false)
    
    # Clean up temp directory
    Remove-Item $tempDir -Recurse -Force
    
    # Verify ZIP was created
    if (Test-Path $zipPath) {
        $zipInfo = Get-Item $zipPath
        $exeInfo = Get-Item $exePath
        
        Write-Host ""
        Write-Host "✅ ZIP created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Original EXE:" -ForegroundColor Cyan
        Write-Host "  File: $($exeInfo.Name)" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($exeInfo.Length/1MB,2)) MB" -ForegroundColor White
        Write-Host ""
        Write-Host "ZIP Archive:" -ForegroundColor Cyan
        Write-Host "  File: $($zipInfo.Name)" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($zipInfo.Length/1MB,2)) MB" -ForegroundColor White
        Write-Host "  Compression: $([math]::Round((1 - $zipInfo.Length/$exeInfo.Length) * 100, 1))%" -ForegroundColor White
        Write-Host ""
        Write-Host "📤 Ready to upload to GitHub Release!" -ForegroundColor Green
        Write-Host "Upload both files:" -ForegroundColor Yellow
        Write-Host "  1. $($exeInfo.Name) (for direct download)" -ForegroundColor White
        Write-Host "  2. $($zipInfo.Name) (for policy-restricted environments)" -ForegroundColor White
    } else {
        Write-Host "❌ ZIP creation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error creating ZIP: $_" -ForegroundColor Red
    
    # Clean up temp directory if it exists
    if (Test-Path "temp_zip") {
        Remove-Item "temp_zip" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    exit 1
}

Write-Host ""
Write-Host "=== Complete ===" -ForegroundColor Cyan
