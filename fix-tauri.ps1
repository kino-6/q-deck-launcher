# Tauri Repair Script
Write-Host "Starting Tauri repair process..." -ForegroundColor Green

# Step 1: Terminate processes
Write-Host "1. Terminating existing processes..." -ForegroundColor Yellow
Get-Process -Name "q-deck-launcher" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "vite" } | Stop-Process -Force

# Step 2: Clear cache
Write-Host "2. Clearing cache..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "src-tauri/target") {
    Remove-Item -Recurse -Force "src-tauri/target"
}

# Step 3: Reinstall dependencies
Write-Host "3. Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# Step 4: Reinstall Tauri dependencies
Write-Host "4. Reinstalling Tauri dependencies..." -ForegroundColor Yellow
npm install @tauri-apps/api@^2 @tauri-apps/plugin-opener@^2 @tauri-apps/cli@^2

# Step 5: TypeScript type check
Write-Host "5. TypeScript type check..." -ForegroundColor Yellow
npx tsc --noEmit

# Step 6: Rust build check
Write-Host "6. Rust build check..." -ForegroundColor Yellow
cd src-tauri
cargo check
cd ..

Write-Host "Repair process completed" -ForegroundColor Green
Write-Host "Start app with: npm run tauri dev" -ForegroundColor Cyan