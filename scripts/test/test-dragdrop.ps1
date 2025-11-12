# Q-Deck Drag and Drop Test Script

Write-Host "Q-Deck Drag and Drop Test" -ForegroundColor Cyan
Write-Host "=" * 50

# Create test files directory
$testDir = "test-files"
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir | Out-Null
}

# Create test files
$testFiles = @(
    @{ Name = "test-app.exe"; Content = "Test executable"; Type = "Executable" }
    @{ Name = "test-script.ps1"; Content = "Write-Host 'Test PowerShell Script'"; Type = "Script" }
    @{ Name = "test-document.txt"; Content = "Test document content"; Type = "Document" }
    @{ Name = "test-image.png"; Content = "PNG fake content"; Type = "Image" }
)

Write-Host "Creating test files..." -ForegroundColor Yellow

foreach ($file in $testFiles) {
    $filePath = Join-Path $testDir $file.Name
    Set-Content -Path $filePath -Value $file.Content -Encoding UTF8
    Write-Host "  Created: $($file.Name) ($($file.Type))" -ForegroundColor Green
}

Write-Host ""
Write-Host "Test Instructions:" -ForegroundColor Cyan
Write-Host "1. Ensure Q-Deck application is running"
Write-Host "2. Press hotkey (Ctrl+` or Alt+Space) to show overlay"
Write-Host "3. Drag files from test-files folder to the overlay"
Write-Host "4. Verify that buttons are automatically generated"
Write-Host ""

# Check application status
Write-Host "Checking application status..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:1420" -UseBasicParsing -TimeoutSec 5
    Write-Host "  Dev server is running (port 1420)" -ForegroundColor Green
} catch {
    Write-Host "  Cannot connect to dev server" -ForegroundColor Red
    Write-Host "  Please run: npm run tauri dev" -ForegroundColor Yellow
}

# Check processes
$tauriProcess = Get-Process | Where-Object { $_.ProcessName -like "*q-deck*" -or $_.ProcessName -like "*tauri*" }
if ($tauriProcess) {
    Write-Host "  Tauri processes found:" -ForegroundColor Green
    $tauriProcess | ForEach-Object { Write-Host "    - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray }
} else {
    Write-Host "  No Tauri processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Test files location:" -ForegroundColor Cyan
Write-Host "  $(Resolve-Path $testDir)" -ForegroundColor Gray

Write-Host ""
Write-Host "Ready to test!" -ForegroundColor Green
Write-Host "Follow the instructions above to test drag and drop functionality." -ForegroundColor White

Write-Host ""
Write-Host "To check results:" -ForegroundColor Cyan
Write-Host "  Get-Content config.yaml | Select-String -Pattern 'buttons:' -Context 5" -ForegroundColor Gray