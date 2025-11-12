# Test: Verify empty window is displayed
# This script tests that the Electron application creates and displays windows correctly

Write-Host "=== Window Display Test ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test verifies that:" -ForegroundColor Yellow
Write-Host "  1. The application starts without errors" -ForegroundColor Gray
Write-Host "  2. An empty window is created and can be displayed" -ForegroundColor Gray
Write-Host "  3. The developer tools can be opened" -ForegroundColor Gray
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ FAIL: Node.js is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js is installed: $(node --version)" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ FAIL: Not in the correct directory (package.json not found)" -ForegroundColor Red
    exit 1
}

Write-Host "✓ In correct directory" -ForegroundColor Green

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠ Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ FAIL: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Dependencies are installed" -ForegroundColor Green
Write-Host ""

# Start the application in the background
Write-Host "Starting Electron application..." -ForegroundColor Yellow
Write-Host "This will:" -ForegroundColor Gray
Write-Host "  - Start the Vite dev server" -ForegroundColor Gray
Write-Host "  - Launch the Electron application" -ForegroundColor Gray
Write-Host "  - Create the main and overlay windows" -ForegroundColor Gray
Write-Host ""

# Set environment variable for development
$env:NODE_ENV = "development"

# Start the dev server and electron in background
$viteJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1
}

Write-Host "⏳ Waiting for Vite dev server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if Vite is running
$viteRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:1420" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $viteRunning = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $viteRunning) {
    Write-Host "❌ FAIL: Vite dev server did not start" -ForegroundColor Red
    Stop-Job -Job $viteJob
    Remove-Job -Job $viteJob
    exit 1
}

Write-Host "✓ Vite dev server is running on http://localhost:1420" -ForegroundColor Green

# Start Electron
Write-Host ""
Write-Host "Launching Electron application..." -ForegroundColor Yellow
$electronJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:NODE_ENV = "development"
    electron . 2>&1
}

Write-Host "⏳ Waiting for Electron to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if Electron process is running
$electronProcess = Get-Process -Name "electron" -ErrorAction SilentlyContinue

if ($electronProcess) {
    Write-Host "✓ Electron process is running (PID: $($electronProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Electron process not found" -ForegroundColor Red
    Stop-Job -Job $viteJob, $electronJob
    Remove-Job -Job $viteJob, $electronJob
    exit 1
}

Write-Host ""
Write-Host "=== Manual Verification Required ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please verify the following:" -ForegroundColor Yellow
Write-Host "  1. Press F11 to show the overlay window" -ForegroundColor White
Write-Host "  2. Verify that an empty window appears" -ForegroundColor White
Write-Host "  3. Verify that the window is transparent/semi-transparent" -ForegroundColor White
Write-Host "  4. Verify that developer tools can be opened (should open automatically)" -ForegroundColor White
Write-Host "  5. Press Escape to close the overlay" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when you have completed the verification..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Did all verifications pass? (y/n): " -ForegroundColor Yellow -NoNewline
$result = Read-Host

# Cleanup
Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
Stop-Job -Job $viteJob, $electronJob -ErrorAction SilentlyContinue
Remove-Job -Job $viteJob, $electronJob -ErrorAction SilentlyContinue

if ($electronProcess) {
    Stop-Process -Id $electronProcess.Id -Force -ErrorAction SilentlyContinue
}

# Kill any remaining processes
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -match "vite"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

if ($result -eq "y" -or $result -eq "Y") {
    Write-Host "✅ TEST PASSED: Empty window is displayed correctly" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ TEST FAILED: Window display verification failed" -ForegroundColor Red
    exit 1
}
