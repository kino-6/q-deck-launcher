# Clean script for q-deck-launcher
# Removes build artifacts and temporary files

Write-Host "Cleaning q-deck-launcher..." -ForegroundColor Green

# Remove node_modules if exists
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

# Remove dist if exists
if (Test-Path "dist") {
    Write-Host "Removing dist..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

# Remove Tauri target directory if exists
if (Test-Path "src-tauri/target") {
    Write-Host "Removing Tauri target..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "src-tauri/target"
}

# Remove coverage reports if exists
if (Test-Path "coverage") {
    Write-Host "Removing coverage..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "coverage"
}

# Remove test results if exists
if (Test-Path "test-results") {
    Write-Host "Removing test-results..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "test-results"
}

# Remove .vite cache if exists
if (Test-Path ".vite") {
    Write-Host "Removing .vite cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".vite"
}

Write-Host "Clean completed!" -ForegroundColor Green