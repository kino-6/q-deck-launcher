# Test script for Terminal action (PowerShell and Cmd)
# This script tests the Terminal action implementation

Write-Host "=== Terminal Action Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Launch PowerShell
Write-Host "Test 1: Launch PowerShell" -ForegroundColor Yellow
Write-Host "Expected: PowerShell window should open"
Write-Host "Action: Click the 'PowerShell' button in the overlay"
Write-Host ""

# Test 2: Launch Cmd
Write-Host "Test 2: Launch Cmd" -ForegroundColor Yellow
Write-Host "Expected: Command Prompt window should open"
Write-Host "Action: Click the 'Command Prompt' button in the overlay"
Write-Host ""

# Test 3: Launch PowerShell with working directory
Write-Host "Test 3: Launch PowerShell with working directory" -ForegroundColor Yellow
Write-Host "Expected: PowerShell window should open in C:\Projects directory"
Write-Host "Action: Click the 'PowerShell in Projects' button"
Write-Host ""

# Test 4: Launch Cmd with working directory
Write-Host "Test 4: Launch Cmd with working directory" -ForegroundColor Yellow
Write-Host "Expected: Command Prompt window should open in C:\Projects directory"
Write-Host "Action: Click the 'Cmd in Projects' button"
Write-Host ""

# Test 5: Launch PowerShell with command
Write-Host "Test 5: Launch PowerShell with command" -ForegroundColor Yellow
Write-Host "Expected: PowerShell window should open and execute 'Get-Date'"
Write-Host "Action: Click the 'PowerShell Get-Date' button"
Write-Host ""

# Test 6: Launch Cmd with command
Write-Host "Test 6: Launch Cmd with command" -ForegroundColor Yellow
Write-Host "Expected: Command Prompt window should open and execute 'dir'"
Write-Host "Action: Click the 'Cmd Dir' button"
Write-Host ""

Write-Host "=== Manual Test Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the application: .\launch.ps1"
Write-Host "2. Press F11 to open the overlay"
Write-Host "3. Add test buttons using the config modal or by editing config.yaml"
Write-Host "4. Test each button and verify the expected behavior"
Write-Host ""

Write-Host "=== Sample Config for Testing ===" -ForegroundColor Cyan
Write-Host ""
Write-Host @"
buttons:
  - position: { row: 1, col: 1 }
    action_type: 'Terminal'
    label: 'PowerShell'
    icon: '💻'
    config:
      terminal: 'PowerShell'
  
  - position: { row: 1, col: 2 }
    action_type: 'Terminal'
    label: 'Command Prompt'
    icon: '⌨️'
    config:
      terminal: 'Cmd'
  
  - position: { row: 2, col: 1 }
    action_type: 'Terminal'
    label: 'PowerShell in Projects'
    icon: '💻'
    config:
      terminal: 'PowerShell'
      workdir: 'C:\\Projects'
  
  - position: { row: 2, col: 2 }
    action_type: 'Terminal'
    label: 'Cmd in Projects'
    icon: '⌨️'
    config:
      terminal: 'Cmd'
      workdir: 'C:\\Projects'
  
  - position: { row: 3, col: 1 }
    action_type: 'Terminal'
    label: 'PowerShell Get-Date'
    icon: '📅'
    config:
      terminal: 'PowerShell'
      command: 'Get-Date'
  
  - position: { row: 3, col: 2 }
    action_type: 'Terminal'
    label: 'Cmd Dir'
    icon: '📋'
    config:
      terminal: 'Cmd'
      command: 'dir'
"@
Write-Host ""

Write-Host "=== Running Automated Tests ===" -ForegroundColor Cyan
Write-Host ""

# Run the automated tests
npm test -- TerminalAction.test.tsx --run

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Green
