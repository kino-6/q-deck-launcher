#!/usr/bin/env pwsh
# Test script for profile switching functionality

Write-Host "=== Profile Switching Test ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create a test config with multiple profiles
Write-Host "Step 1: Creating test config with multiple profiles..." -ForegroundColor Yellow

$testConfig = @"
version: '1.0'
ui:
  summon:
    hotkeys:
    - F11
    edge_trigger:
      enabled: false
      edges:
      - top
      dwell_ms: 300
      margin_px: 5
  window:
    placement: dropdown-top
    width_px: 1000
    height_px: 600
    cell_size_px: 96
    gap_px: 8
    opacity: 0.92
    theme: dark
    animation:
      enabled: true
      duration_ms: 150
profiles:
- name: Default
  hotkey: null
  pages:
  - name: Main
    rows: 4
    cols: 6
    buttons:
    - position:
        row: 1
        col: 1
      action_type: LaunchApp
      label: Notepad
      icon: 📝
      config:
        path: notepad.exe
      style: null
      action: null
    - position:
        row: 1
        col: 2
      action_type: Open
      label: Windows
      icon: 📁
      config:
        target: C:\Windows
      style: null
      action: null
- name: Development
  hotkey: Ctrl+1
  pages:
  - name: Code
    rows: 4
    cols: 6
    buttons:
    - position:
        row: 1
        col: 1
      action_type: LaunchApp
      label: VS Code
      icon: 💻
      config:
        path: code
      style: null
      action: null
    - position:
        row: 1
        col: 2
      action_type: Terminal
      label: PowerShell
      icon: 🖥️
      config:
        terminal: PowerShell
        workdir: C:\
      style: null
      action: null
  - name: Tools
    rows: 4
    cols: 6
    buttons:
    - position:
        row: 1
        col: 1
      action_type: Open
      label: Projects
      icon: 📂
      config:
        target: C:\Projects
      style: null
      action: null
- name: Gaming
  hotkey: Ctrl+2
  pages:
  - name: Games
    rows: 4
    cols: 6
    buttons:
    - position:
        row: 1
        col: 1
      action_type: LaunchApp
      label: Steam
      icon: 🎮
      config:
        path: steam://open/games
      style: null
      action: null
"@

# Get the config path
$userDataPath = "$env:APPDATA\q-deck-launcher"
$configPath = "$userDataPath\config.yaml"

# Backup existing config if it exists
if (Test-Path $configPath) {
    $backupPath = "$configPath.backup"
    Write-Host "  Backing up existing config to: $backupPath" -ForegroundColor Gray
    Copy-Item $configPath $backupPath -Force
}

# Write test config
Write-Host "  Writing test config to: $configPath" -ForegroundColor Gray
$testConfig | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "  ✓ Test config created" -ForegroundColor Green
Write-Host ""

# Step 2: Launch the application
Write-Host "Step 2: Launching application..." -ForegroundColor Yellow
Write-Host "  Starting Electron app..." -ForegroundColor Gray

# Start the app in the background
$process = Start-Process -FilePath "npm" -ArgumentList "run", "electron:dev" -WorkingDirectory "." -PassThru -WindowStyle Hidden

Write-Host "  ✓ Application started (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""

# Step 3: Manual testing instructions
Write-Host "Step 3: Manual Testing Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "The application should now be running with 3 profiles:" -ForegroundColor White
Write-Host "  1. Default (2 buttons: Notepad, Windows folder)" -ForegroundColor Cyan
Write-Host "  2. Development (2 pages: Code with 2 buttons, Tools with 1 button)" -ForegroundColor Cyan
Write-Host "  3. Gaming (1 button: Steam)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the following:" -ForegroundColor White
Write-Host "  ✓ Press F11 to open the overlay" -ForegroundColor Gray
Write-Host "  ✓ Verify you see the 'Default' profile with 2 buttons" -ForegroundColor Gray
Write-Host "  ✓ Close the overlay (Escape or F11)" -ForegroundColor Gray
Write-Host ""
Write-Host "Profile Switching (requires implementation in UI):" -ForegroundColor White
Write-Host "  ✓ Open overlay and look for profile selector" -ForegroundColor Gray
Write-Host "  ✓ Switch to 'Development' profile" -ForegroundColor Gray
Write-Host "  ✓ Verify you see 'Code' page with 2 buttons" -ForegroundColor Gray
Write-Host "  ✓ Navigate to 'Tools' page (arrow keys or page navigation)" -ForegroundColor Gray
Write-Host "  ✓ Close and reopen overlay - should remember Development profile" -ForegroundColor Gray
Write-Host ""
Write-Host "Profile State Persistence:" -ForegroundColor White
Write-Host "  ✓ Check that profile-state.json is created in: $userDataPath" -ForegroundColor Gray
Write-Host "  ✓ Switch profiles and verify the state file is updated" -ForegroundColor Gray
Write-Host "  ✓ Restart the app and verify it remembers the last profile" -ForegroundColor Gray
Write-Host ""

# Wait for user input
Write-Host "Press Enter when you're done testing..." -ForegroundColor Yellow
Read-Host

# Step 4: Cleanup
Write-Host ""
Write-Host "Step 4: Cleanup..." -ForegroundColor Yellow

# Stop the process
Write-Host "  Stopping application..." -ForegroundColor Gray
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Application stopped" -ForegroundColor Green

# Restore backup if it exists
$backupPath = "$configPath.backup"
if (Test-Path $backupPath) {
    Write-Host "  Restoring original config..." -ForegroundColor Gray
    Copy-Item $backupPath $configPath -Force
    Remove-Item $backupPath -Force
    Write-Host "  ✓ Original config restored" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the profile state file at:" -ForegroundColor White
Write-Host "  $userDataPath\profile-state.json" -ForegroundColor Cyan
Write-Host ""
