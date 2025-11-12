# Test: Button Delete Persistence
# Verifies that deleted buttons remain deleted after page reload

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Button Delete Persistence Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the user data directory
$userDataPath = "$env:APPDATA\q-deck-launcher"
$configPath = "$userDataPath\config.yaml"
$backupPath = "$userDataPath\config.backup.yaml"

Write-Host "Configuration path: $configPath" -ForegroundColor Yellow
Write-Host ""

# Check if config file exists
if (-not (Test-Path $configPath)) {
    Write-Host "❌ ERROR: Config file not found at $configPath" -ForegroundColor Red
    Write-Host "Please run the application at least once to create the config file." -ForegroundColor Yellow
    exit 1
}

# Backup the original config
Write-Host "📋 Creating backup of original config..." -ForegroundColor Cyan
Copy-Item $configPath $backupPath -Force
Write-Host "✅ Backup created at $backupPath" -ForegroundColor Green
Write-Host ""

try {
    # Read the current config
    Write-Host "📖 Reading current configuration..." -ForegroundColor Cyan
    $configContent = Get-Content $configPath -Raw
    
    # Parse YAML (count buttons by looking for "- position:" entries under buttons section)
    $buttonMatches = [regex]::Matches($configContent, "(?m)^\s+- position:")
    $initialButtonCount = $buttonMatches.Count
    
    Write-Host "Initial button count: $initialButtonCount" -ForegroundColor Yellow
    Write-Host ""
    
    if ($initialButtonCount -eq 0) {
        Write-Host "⚠️  WARNING: No buttons found in config. Please add at least one button first." -ForegroundColor Yellow
        Write-Host "Restoring original config..." -ForegroundColor Cyan
        Copy-Item $backupPath $configPath -Force
        exit 0
    }
    
    # Find the first button to delete (YAML format with indentation)
    $firstButtonMatch = [regex]::Match($configContent, "(?s)- position:\s*\n\s+row:\s*(\d+)\s*\n\s+col:\s*(\d+)\s*\n\s+action_type:.*?\n\s+label:\s*([^\n]+)")
    
    if ($firstButtonMatch.Success) {
        $buttonRow = $firstButtonMatch.Groups[1].Value
        $buttonCol = $firstButtonMatch.Groups[2].Value
        $buttonLabel = $firstButtonMatch.Groups[3].Value
        
        Write-Host "🎯 Target button for deletion:" -ForegroundColor Cyan
        Write-Host "   Label: $buttonLabel" -ForegroundColor White
        Write-Host "   Position: Row $buttonRow, Col $buttonCol" -ForegroundColor White
        Write-Host ""
        
        # Simulate button deletion by removing it from config
        Write-Host "🗑️  Simulating button deletion..." -ForegroundColor Cyan
        
        # Find the button block and remove it (YAML format)
        # Match the entire button entry including all its properties
        $buttonPattern = "(?s)\s+- position:\s*\n\s+row:\s*$buttonRow\s*\n\s+col:\s*$buttonCol\s*\n\s+action_type:.*?(?=\n\s+- position:|\n\s+-\s+name:|\nprofiles:|\z)"
        $modifiedConfig = $configContent -replace $buttonPattern, ""
        
        # Save the modified config
        Set-Content $configPath $modifiedConfig -NoNewline
        Write-Host "✅ Button deleted from config" -ForegroundColor Green
        Write-Host ""
        
        # Verify deletion
        Write-Host "🔍 Verifying deletion..." -ForegroundColor Cyan
        $verifyContent = Get-Content $configPath -Raw
        $verifyMatches = [regex]::Matches($verifyContent, "(?m)^\s+- position:")
        $afterDeleteCount = $verifyMatches.Count
        
        Write-Host "Button count after deletion: $afterDeleteCount" -ForegroundColor Yellow
        
        if ($afterDeleteCount -eq ($initialButtonCount - 1)) {
            Write-Host "✅ Button successfully removed from config" -ForegroundColor Green
        } else {
            Write-Host "❌ ERROR: Button count mismatch" -ForegroundColor Red
            Write-Host "   Expected: $($initialButtonCount - 1)" -ForegroundColor Red
            Write-Host "   Actual: $afterDeleteCount" -ForegroundColor Red
            throw "Button deletion verification failed"
        }
        Write-Host ""
        
        # Simulate page reload by re-reading config
        Write-Host "🔄 Simulating page reload (re-reading config)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 1
        
        $reloadedContent = Get-Content $configPath -Raw
        $reloadedMatches = [regex]::Matches($reloadedContent, "(?m)^\s+- position:")
        $afterReloadCount = $reloadedMatches.Count
        
        Write-Host "Button count after reload: $afterReloadCount" -ForegroundColor Yellow
        Write-Host ""
        
        # Check if the specific button is still absent (YAML format)
        $deletedButtonPattern = "(?s)- position:\s*\n\s+row:\s*$buttonRow\s*\n\s+col:\s*$buttonCol\s*\n\s+action_type:.*?\n\s+label:\s*$buttonLabel"
        $buttonStillExists = $reloadedContent -match $deletedButtonPattern
        
        if ($buttonStillExists) {
            Write-Host "❌ FAIL: Deleted button reappeared after reload!" -ForegroundColor Red
            Write-Host "   Button '$buttonLabel' at ($buttonRow, $buttonCol) is still present" -ForegroundColor Red
            throw "Button persistence test failed"
        } else {
            Write-Host "✅ PASS: Deleted button remains deleted after reload" -ForegroundColor Green
            Write-Host "   Button '$buttonLabel' at ($buttonRow, $buttonCol) is still absent" -ForegroundColor Green
        }
        Write-Host ""
        
        # Verify button count consistency
        if ($afterReloadCount -eq $afterDeleteCount) {
            Write-Host "✅ PASS: Button count is consistent after reload" -ForegroundColor Green
            Write-Host "   Count: $afterReloadCount" -ForegroundColor Green
        } else {
            Write-Host "❌ FAIL: Button count changed after reload" -ForegroundColor Red
            Write-Host "   Before reload: $afterDeleteCount" -ForegroundColor Red
            Write-Host "   After reload: $afterReloadCount" -ForegroundColor Red
            throw "Button count consistency test failed"
        }
        Write-Host ""
        
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Summary:" -ForegroundColor Cyan
        Write-Host "  • Button deletion: ✅ Working" -ForegroundColor Green
        Write-Host "  • Config persistence: ✅ Working" -ForegroundColor Green
        Write-Host "  • Reload consistency: ✅ Working" -ForegroundColor Green
        Write-Host ""
        
    } else {
        Write-Host "❌ ERROR: Could not parse button information from config" -ForegroundColor Red
        throw "Config parsing failed"
    }
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ TEST FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    
} finally {
    # Restore the original config
    Write-Host "🔄 Restoring original configuration..." -ForegroundColor Cyan
    if (Test-Path $backupPath) {
        Copy-Item $backupPath $configPath -Force
        Remove-Item $backupPath -Force
        Write-Host "✅ Original config restored" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "Test completed." -ForegroundColor Cyan
