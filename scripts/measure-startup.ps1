# Measure Startup Time Script
# This script launches the application and measures startup time

Write-Host "=== Q-Deck Startup Time Measurement ===" -ForegroundColor Cyan
Write-Host ""

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build not found. Running build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Build found" -ForegroundColor Green
Write-Host ""
Write-Host "Launching application..." -ForegroundColor Cyan
Write-Host "Watch for startup report in console output" -ForegroundColor Yellow
Write-Host ""

# Launch application
npm run electron:dev

Write-Host ""
Write-Host "=== Measurement Complete ===" -ForegroundColor Cyan
