# Test: Overlay Display
# Verifies that the overlay window is created and displayed correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Overlay Display Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This test checks:" -ForegroundColor Yellow
Write-Host "1. Vite dev server is running" -ForegroundColor White
Write-Host "2. Electron process is running" -ForegroundColor White
Write-Host "3. Overlay URL is accessible" -ForegroundColor White
Write-Host ""

# Check if Vite server is running
Write-Host "Step 1: Checking Vite dev server..." -ForegroundColor Cyan
$viteRunning = $false
$vitePort = $null

foreach ($port in 1420..1425) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  Found Vite server on port $port" -ForegroundColor Green
            $viteRunning = $true
            $vitePort = $port
            break
        }
    }
    catch {
        # Port not available, continue
    }
}

if (-not $viteRunning) {
    Write-Host "  ERROR: Vite server is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  Run in another terminal:" -ForegroundColor White
    Write-Host "     .\launch.ps1" -ForegroundColor Cyan
    Write-Host "  Or:" -ForegroundColor White
    Write-Host "     npm run electron:dev" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if Electron process is running
Write-Host ""
Write-Host "Step 2: Checking Electron process..." -ForegroundColor Cyan
$electronProcess = Get-Process -Name "electron" -ErrorAction SilentlyContinue

if ($electronProcess) {
    Write-Host "  Found Electron process" -ForegroundColor Green
    Write-Host "  Process count: $($electronProcess.Count)" -ForegroundColor Gray
    foreach ($proc in $electronProcess) {
        Write-Host "  PID: $($proc.Id)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ERROR: Electron process not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  The app may not be running" -ForegroundColor White
    Write-Host "  Run: .\launch.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Check if overlay URL is accessible
Write-Host ""
Write-Host "Step 3: Checking overlay URL..." -ForegroundColor Cyan
$overlayURL = "http://localhost:$vitePort/overlay"

try {
    $response = Invoke-WebRequest -Uri $overlayURL -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  Overlay URL is accessible: $overlayURL" -ForegroundColor Green
        Write-Host "  Status code: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "  Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  ERROR: Cannot access overlay URL: $overlayURL" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  1. Try accessing in browser:" -ForegroundColor White
    Write-Host "     $overlayURL" -ForegroundColor Cyan
    Write-Host "  2. Check routing configuration" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check window visibility
Write-Host ""
Write-Host "Step 4: Window visibility check..." -ForegroundColor Cyan
Write-Host "  This check must be done manually" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please verify:" -ForegroundColor White
Write-Host "  1. Press F11 key" -ForegroundColor Cyan
Write-Host "  2. Check if overlay window appears" -ForegroundColor Cyan
Write-Host "  3. If not, check Task Manager for Electron windows" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automated checks completed" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Diagnosis results:" -ForegroundColor Cyan
Write-Host "  Vite server: Running on port $vitePort" -ForegroundColor Green
Write-Host "  Electron process: Running" -ForegroundColor Green
Write-Host "  Overlay URL: Accessible" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Press F11 to show overlay" -ForegroundColor White
Write-Host "  2. If not visible, check:" -ForegroundColor White
Write-Host "     - Electron console log (terminal)" -ForegroundColor Gray
Write-Host "     - DevTools console (F12)" -ForegroundColor Gray
Write-Host "     - Task Manager for window existence" -ForegroundColor Gray
Write-Host ""

Write-Host "Test in browser:" -ForegroundColor Cyan
Write-Host "  $overlayURL" -ForegroundColor White
Write-Host ""

# Offer to open in browser
$openBrowser = Read-Host "Open overlay URL in browser? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process $overlayURL
    Write-Host "  Opened in browser" -ForegroundColor Green
}

Write-Host ""
Write-Host "Test completed" -ForegroundColor Cyan
