# Test script for LaunchApp action with arguments and working directory
# This script tests task 3.2: 引数、作業ディレクトリ、環境変数のサポート実装

Write-Host "=== Testing LaunchApp with Arguments and Working Directory ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Launch notepad with a file argument
Write-Host "Test 1: Launch notepad with file argument" -ForegroundColor Yellow
Write-Host "Creating a test file..." -ForegroundColor Gray

$testFile = "$env:TEMP\q-deck-test-file.txt"
"This is a test file for Q-Deck LaunchApp action testing." | Out-File -FilePath $testFile -Encoding UTF8

Write-Host "Test file created at: $testFile" -ForegroundColor Green
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor Cyan
Write-Host "  - Notepad should open with the test file loaded" -ForegroundColor Gray
Write-Host "  - The file should contain the test text" -ForegroundColor Gray
Write-Host ""
Write-Host "To test this manually:" -ForegroundColor Cyan
Write-Host "  1. Add a button with action_type: 'LaunchApp'" -ForegroundColor Gray
Write-Host "  2. Set config.path to 'notepad.exe'" -ForegroundColor Gray
Write-Host "  3. Set config.args to ['$testFile']" -ForegroundColor Gray
Write-Host "  4. Click the button" -ForegroundColor Gray
Write-Host ""

# Test 2: Launch PowerShell with working directory
Write-Host "Test 2: Launch PowerShell with working directory" -ForegroundColor Yellow
Write-Host "Creating a test directory..." -ForegroundColor Gray

$testDir = "$env:TEMP\q-deck-test-workdir"
if (Test-Path $testDir) {
    Remove-Item $testDir -Recurse -Force
}
New-Item -ItemType Directory -Path $testDir | Out-Null

Write-Host "Test directory created at: $testDir" -ForegroundColor Green
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor Cyan
Write-Host "  - PowerShell should open in the test directory" -ForegroundColor Gray
Write-Host "  - Running 'pwd' should show: $testDir" -ForegroundColor Gray
Write-Host ""
Write-Host "To test this manually:" -ForegroundColor Cyan
Write-Host "  1. Add a button with action_type: 'LaunchApp'" -ForegroundColor Gray
Write-Host "  2. Set config.path to 'powershell.exe'" -ForegroundColor Gray
Write-Host "  3. Set config.workdir to '$testDir'" -ForegroundColor Gray
Write-Host "  4. Click the button" -ForegroundColor Gray
Write-Host "  5. In the opened PowerShell, run 'pwd' to verify the working directory" -ForegroundColor Gray
Write-Host ""

# Test 3: Launch cmd with environment variable
Write-Host "Test 3: Launch cmd with environment variable" -ForegroundColor Yellow
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor Cyan
Write-Host "  - Cmd should open with custom environment variable set" -ForegroundColor Gray
Write-Host "  - Running 'echo %Q_DECK_TEST%' should show: 'Hello from Q-Deck'" -ForegroundColor Gray
Write-Host ""
Write-Host "To test this manually:" -ForegroundColor Cyan
Write-Host "  1. Add a button with action_type: 'LaunchApp'" -ForegroundColor Gray
Write-Host "  2. Set config.path to 'cmd.exe'" -ForegroundColor Gray
Write-Host "  3. Set config.env to { Q_DECK_TEST: 'Hello from Q-Deck' }" -ForegroundColor Gray
Write-Host "  4. Click the button" -ForegroundColor Gray
Write-Host "  5. In the opened cmd, run 'echo %Q_DECK_TEST%' to verify the environment variable" -ForegroundColor Gray
Write-Host ""

# Test 4: Combined test - PowerShell with args, workdir, and env
Write-Host "Test 4: Combined test - PowerShell with args, workdir, and env" -ForegroundColor Yellow
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor Cyan
Write-Host "  - PowerShell should open in the test directory" -ForegroundColor Gray
Write-Host "  - PowerShell should execute the command: Write-Host `$env:Q_DECK_COMBINED" -ForegroundColor Gray
Write-Host "  - The output should show: 'Combined Test Success'" -ForegroundColor Gray
Write-Host ""
Write-Host "To test this manually:" -ForegroundColor Cyan
Write-Host "  1. Add a button with action_type: 'LaunchApp'" -ForegroundColor Gray
Write-Host "  2. Set config.path to 'powershell.exe'" -ForegroundColor Gray
Write-Host "  3. Set config.args to ['-NoExit', '-Command', 'Write-Host `$env:Q_DECK_COMBINED -ForegroundColor Green']" -ForegroundColor Gray
Write-Host "  4. Set config.workdir to '$testDir'" -ForegroundColor Gray
Write-Host "  5. Set config.env to { Q_DECK_COMBINED: 'Combined Test Success' }" -ForegroundColor Gray
Write-Host "  6. Click the button" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Test Configuration Examples ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Example 1: Notepad with file argument" -ForegroundColor Yellow
Write-Host @"
{
  "position": { "row": 1, "col": 1 },
  "action_type": "LaunchApp",
  "label": "Test File",
  "icon": "📝",
  "config": {
    "path": "notepad.exe",
    "args": ["$testFile"]
  }
}
"@ -ForegroundColor Gray
Write-Host ""

Write-Host "Example 2: PowerShell with working directory" -ForegroundColor Yellow
Write-Host @"
{
  "position": { "row": 1, "col": 2 },
  "action_type": "LaunchApp",
  "label": "PS in TestDir",
  "icon": "💻",
  "config": {
    "path": "powershell.exe",
    "workdir": "$testDir"
  }
}
"@ -ForegroundColor Gray
Write-Host ""

Write-Host "Example 3: Cmd with environment variable" -ForegroundColor Yellow
Write-Host @"
{
  "position": { "row": 1, "col": 3 },
  "action_type": "LaunchApp",
  "label": "Cmd with Env",
  "icon": "⚙️",
  "config": {
    "path": "cmd.exe",
    "env": {
      "Q_DECK_TEST": "Hello from Q-Deck"
    }
  }
}
"@ -ForegroundColor Gray
Write-Host ""

Write-Host "Example 4: Combined test" -ForegroundColor Yellow
Write-Host @"
{
  "position": { "row": 1, "col": 4 },
  "action_type": "LaunchApp",
  "label": "Combined Test",
  "icon": "🚀",
  "config": {
    "path": "powershell.exe",
    "args": ["-NoExit", "-Command", "Write-Host `$env:Q_DECK_COMBINED -ForegroundColor Green"],
    "workdir": "$testDir",
    "env": {
      "Q_DECK_COMBINED": "Combined Test Success"
    }
  }
}
"@ -ForegroundColor Gray
Write-Host ""

Write-Host "=== Automated Test ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running automated verification..." -ForegroundColor Yellow

# Verify the implementation exists in main.js
$mainJsPath = "electron\main.js"
if (Test-Path $mainJsPath) {
    $mainJsContent = Get-Content $mainJsPath -Raw
    
    $checks = @(
        @{ Name = "Args support"; Pattern = "args\s*\|\|\s*\[\]" },
        @{ Name = "Workdir support"; Pattern = "if\s*\(\s*workdir\s*\)" },
        @{ Name = "Env support"; Pattern = "if\s*\(\s*env\s*\)" },
        @{ Name = "Spawn with options"; Pattern = "spawn\s*\(\s*appPath\s*,\s*args" }
    )
    
    $allPassed = $true
    foreach ($check in $checks) {
        if ($mainJsContent -match $check.Pattern) {
            Write-Host "✓ $($check.Name) - Implementation found" -ForegroundColor Green
        } else {
            Write-Host "✗ $($check.Name) - Implementation NOT found" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    Write-Host ""
    if ($allPassed) {
        Write-Host "✓ All implementation checks passed!" -ForegroundColor Green
    } else {
        Write-Host "✗ Some implementation checks failed!" -ForegroundColor Red
    }
} else {
    Write-Host "✗ main.js not found at: $mainJsPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Start the application: .\launch.ps1" -ForegroundColor Gray
Write-Host "2. Add test buttons using the examples above" -ForegroundColor Gray
Write-Host "3. Click each button to verify the behavior" -ForegroundColor Gray
Write-Host "4. Clean up test files when done:" -ForegroundColor Gray
Write-Host "   Remove-Item '$testFile' -Force" -ForegroundColor Gray
Write-Host "   Remove-Item '$testDir' -Recurse -Force" -ForegroundColor Gray
Write-Host ""
