# Test All Action Types
# This script tests that all action types work correctly after refactoring

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing All Action Types" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Function to run a test
function Run-Test {
    param(
        [string]$TestName,
        [string]$TestScript
    )
    
    Write-Host "Running: $TestName" -ForegroundColor Yellow
    
    if (Test-Path $TestScript) {
        try {
            & $TestScript
            if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
                Write-Host "✓ $TestName PASSED" -ForegroundColor Green
                $script:testsPassed++
            } else {
                Write-Host "✗ $TestName FAILED" -ForegroundColor Red
                $script:testsFailed++
            }
        } catch {
            Write-Host "✗ $TestName FAILED: $_" -ForegroundColor Red
            $script:testsFailed++
        }
    } else {
        Write-Host "⚠ $TestName SKIPPED (script not found)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Test 1: LaunchApp Action
Run-Test "LaunchApp Action" ".\test-launch-app-action.ps1"

# Test 2: LaunchApp with Arguments
Run-Test "LaunchApp with Arguments" ".\test-launch-app-args.ps1"

# Test 3: Open Action
Run-Test "Open Action" ".\test-open-action.ps1"

# Test 4: Terminal Action
Run-Test "Terminal Action" ".\test-terminal-action.ps1"

# Test 5: Windows Terminal & WSL
Run-Test "Windows Terminal & WSL" ".\test-windows-terminal-wsl.ps1"

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}
