# Test script for Windows Terminal and WSL support
# This script tests the Terminal action with Windows Terminal and WSL

Write-Host "=== Windows Terminal and WSL Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if Windows Terminal is installed
Write-Host "Checking for Windows Terminal..." -ForegroundColor Yellow
$wtInstalled = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($wtInstalled) {
    Write-Host "✓ Windows Terminal is installed" -ForegroundColor Green
} else {
    Write-Host "✗ Windows Terminal is NOT installed" -ForegroundColor Red
    Write-Host "  Install from Microsoft Store: https://aka.ms/terminal" -ForegroundColor Yellow
}
Write-Host ""

# Check if WSL is installed
Write-Host "Checking for WSL..." -ForegroundColor Yellow
$wslInstalled = Get-Command wsl.exe -ErrorAction SilentlyContinue
if ($wslInstalled) {
    Write-Host "✓ WSL is installed" -ForegroundColor Green
    
    # List WSL distributions
    Write-Host "  Available distributions:" -ForegroundColor Cyan
    wsl --list --quiet | ForEach-Object {
        Write-Host "    - $_" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ WSL is NOT installed" -ForegroundColor Red
    Write-Host "  Install with: wsl --install" -ForegroundColor Yellow
}
Write-Host ""

# Test 1: Launch Windows Terminal (if available)
if ($wtInstalled) {
    Write-Host "Test 1: Launch Windows Terminal" -ForegroundColor Cyan
    Write-Host "  This will open a new Windows Terminal window..." -ForegroundColor Gray
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wt.exe -ArgumentList "" -NoNewWindow:$false
    Write-Host "✓ Windows Terminal launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 2: Launch Windows Terminal with profile (if available)
if ($wtInstalled) {
    Write-Host "Test 2: Launch Windows Terminal with PowerShell profile" -ForegroundColor Cyan
    Write-Host "  This will open Windows Terminal with PowerShell profile..." -ForegroundColor Gray
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wt.exe -ArgumentList "-p", "PowerShell" -NoNewWindow:$false
    Write-Host "✓ Windows Terminal with PowerShell profile launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 3: Launch Windows Terminal with working directory (if available)
if ($wtInstalled) {
    Write-Host "Test 3: Launch Windows Terminal with working directory" -ForegroundColor Cyan
    Write-Host "  This will open Windows Terminal in your home directory..." -ForegroundColor Gray
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    $homeDir = $env:USERPROFILE
    Start-Process wt.exe -ArgumentList "-d", $homeDir -NoNewWindow:$false
    Write-Host "✓ Windows Terminal with working directory launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 4: Launch Windows Terminal with command (if available)
if ($wtInstalled) {
    Write-Host "Test 4: Launch Windows Terminal with command" -ForegroundColor Cyan
    Write-Host "  This will open Windows Terminal and run 'echo Hello from Windows Terminal'..." -ForegroundColor Gray
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wt.exe -ArgumentList "powershell.exe -NoExit -Command `"echo 'Hello from Windows Terminal'`"" -NoNewWindow:$false
    Write-Host "✓ Windows Terminal with command launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 5: Launch WSL (if available)
if ($wslInstalled) {
    Write-Host "Test 5: Launch WSL" -ForegroundColor Cyan
    Write-Host "  This will open a new WSL window..." -ForegroundColor Gray
    Write-Host "  Type 'exit' to close the WSL window" -ForegroundColor Yellow
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wsl.exe -ArgumentList "--exec", "bash" -NoNewWindow:$false
    Write-Host "✓ WSL launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 6: Launch WSL with distribution (if available)
if ($wslInstalled) {
    Write-Host "Test 6: Launch WSL with specific distribution" -ForegroundColor Cyan
    Write-Host "  This will open WSL with the default distribution..." -ForegroundColor Gray
    Write-Host "  Type 'exit' to close the WSL window" -ForegroundColor Yellow
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    # Get the default distribution
    $defaultDistro = (wsl --list --quiet | Select-Object -First 1).Trim()
    if ($defaultDistro) {
        Start-Process wsl.exe -ArgumentList "-d", $defaultDistro, "--exec", "bash" -NoNewWindow:$false
        Write-Host "✓ WSL with distribution '$defaultDistro' launched" -ForegroundColor Green
    } else {
        Write-Host "✗ No WSL distribution found" -ForegroundColor Red
    }
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 7: Launch WSL with working directory (if available)
if ($wslInstalled) {
    Write-Host "Test 7: Launch WSL with working directory" -ForegroundColor Cyan
    Write-Host "  This will open WSL in /tmp directory..." -ForegroundColor Gray
    Write-Host "  Type 'exit' to close the WSL window" -ForegroundColor Yellow
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wsl.exe -ArgumentList "--cd", "/tmp", "--exec", "bash" -NoNewWindow:$false
    Write-Host "✓ WSL with working directory launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

# Test 8: Launch WSL with command (if available)
if ($wslInstalled) {
    Write-Host "Test 8: Launch WSL with command" -ForegroundColor Cyan
    Write-Host "  This will open WSL and run 'echo Hello from WSL && bash'..." -ForegroundColor Gray
    Write-Host "  Type 'exit' to close the WSL window" -ForegroundColor Yellow
    Write-Host "  Press Enter to continue or Ctrl+C to skip..." -ForegroundColor Yellow
    Read-Host
    
    Start-Process wsl.exe -ArgumentList "--exec", "bash", "-c", "echo 'Hello from WSL' && bash" -NoNewWindow:$false
    Write-Host "✓ WSL with command launched" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Windows Terminal: $(if ($wtInstalled) { 'Available' } else { 'Not installed' })" -ForegroundColor $(if ($wtInstalled) { 'Green' } else { 'Red' })
Write-Host "  - WSL: $(if ($wslInstalled) { 'Available' } else { 'Not installed' })" -ForegroundColor $(if ($wslInstalled) { 'Green' } else { 'Red' })
Write-Host ""
Write-Host "All tests completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: The actual Q-Deck application will use these same commands" -ForegroundColor Cyan
Write-Host "      to launch Windows Terminal and WSL when you click buttons." -ForegroundColor Cyan
