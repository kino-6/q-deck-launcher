# Test script for Open action functionality
# This script tests opening files and folders using shell.openPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Open Action Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Open Documents folder
Write-Host "Test 1: Opening Documents folder..." -ForegroundColor Yellow
Write-Host "Expected: Explorer window opens showing Documents folder" -ForegroundColor Gray
Write-Host "Action: Click the 'Documents' button in the overlay" -ForegroundColor Gray
Write-Host ""

# Test 2: Open a text file
Write-Host "Test 2: Opening a text file..." -ForegroundColor Yellow
Write-Host "Expected: File opens in associated application (Notepad)" -ForegroundColor Gray
Write-Host "Action: Create a test file and add a button to open it" -ForegroundColor Gray
Write-Host ""

# Create a test file
$testFilePath = Join-Path $env:TEMP "q-deck-test-file.txt"
"This is a test file for Q-Deck Open action." | Out-File -FilePath $testFilePath -Encoding UTF8
Write-Host "Created test file: $testFilePath" -ForegroundColor Green
Write-Host ""

# Test 3: Open Downloads folder
Write-Host "Test 3: Opening Downloads folder..." -ForegroundColor Yellow
Write-Host "Expected: Explorer window opens showing Downloads folder" -ForegroundColor Gray
Write-Host ""

# Test 4: Open a folder with environment variable
Write-Host "Test 4: Opening folder with environment variable..." -ForegroundColor Yellow
Write-Host "Expected: User profile folder opens in Explorer" -ForegroundColor Gray
Write-Host "Path: %USERPROFILE%" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Test Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the application: .\launch.ps1" -ForegroundColor White
Write-Host "2. Press F11 to open the overlay" -ForegroundColor White
Write-Host "3. Test the following buttons:" -ForegroundColor White
Write-Host ""
Write-Host "   a) Documents button (should open Documents folder)" -ForegroundColor White
Write-Host "   b) Create a button for the test file:" -ForegroundColor White
Write-Host "      - Right-click on empty cell" -ForegroundColor White
Write-Host "      - Select 'Settings'" -ForegroundColor White
Write-Host "      - Add new button with:" -ForegroundColor White
Write-Host "        * Type: Open" -ForegroundColor White
Write-Host "        * Label: Test File" -ForegroundColor White
Write-Host "        * Target: $testFilePath" -ForegroundColor White
Write-Host "      - Click the button (should open in Notepad)" -ForegroundColor White
Write-Host ""
Write-Host "4. Verify each action opens the correct file/folder" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these buttons to your config.yaml for testing:" -ForegroundColor Yellow
Write-Host ""

$testConfig = @"
- position: { row: 1, col: 2 }
  action_type: 'Open'
  label: 'Documents'
  icon: '📁'
  config:
    target: '$env:USERPROFILE\Documents'

- position: { row: 1, col: 3 }
  action_type: 'Open'
  label: 'Downloads'
  icon: '⬇️'
  config:
    target: '$env:USERPROFILE\Downloads'

- position: { row: 1, col: 4 }
  action_type: 'Open'
  label: 'Test File'
  icon: '📄'
  config:
    target: '$testFilePath'

- position: { row: 2, col: 1 }
  action_type: 'Open'
  label: 'User Profile'
  icon: '👤'
  config:
    target: '$env:USERPROFILE'

- position: { row: 2, col: 2 }
  action_type: 'Open'
  label: 'Program Files'
  icon: '💾'
  config:
    target: 'C:\Program Files'
"@

Write-Host $testConfig -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expected Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Documents button opens Documents folder in Explorer" -ForegroundColor Green
Write-Host "✓ Downloads button opens Downloads folder in Explorer" -ForegroundColor Green
Write-Host "✓ Test File button opens the text file in Notepad" -ForegroundColor Green
Write-Host "✓ User Profile button opens user profile folder" -ForegroundColor Green
Write-Host "✓ Program Files button opens Program Files folder" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To clean up the test file, run:" -ForegroundColor Yellow
Write-Host "Remove-Item '$testFilePath'" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to start the application..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Start the application
.\launch.ps1
