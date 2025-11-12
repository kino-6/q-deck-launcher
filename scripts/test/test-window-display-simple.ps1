# Simple Window Display Test
# This test verifies that the Electron application window displays correctly

Write-Host "=== Window Display Test ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test will:" -ForegroundColor Yellow
Write-Host "  1. Start the Electron application using npm run electron:dev" -ForegroundColor Gray
Write-Host "  2. Wait for you to verify the window display" -ForegroundColor Gray
Write-Host "  3. Collect your verification results" -ForegroundColor Gray
Write-Host ""

# Check prerequisites
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ FAIL: Node.js is not installed" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ FAIL: Not in the correct directory" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

Write-Host "=== Starting Application ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will start in a new window." -ForegroundColor Yellow
Write-Host "Please perform the following verifications:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. ✓ Verify that the application starts without errors" -ForegroundColor White
Write-Host "  2. ✓ Press F11 to show the overlay window" -ForegroundColor White
Write-Host "  3. ✓ Verify that an empty window appears" -ForegroundColor White
Write-Host "  4. ✓ Verify that the window has a dark background" -ForegroundColor White
Write-Host "  5. ✓ Verify that developer tools open automatically" -ForegroundColor White
Write-Host "  6. ✓ Press Escape to close the overlay" -ForegroundColor White
Write-Host "  7. ✓ Close the application (Ctrl+C in the terminal or close the window)" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to start the application..." -ForegroundColor Yellow
Read-Host

Write-Host ""
Write-Host "Starting application with: npm run electron:dev" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application when done testing" -ForegroundColor Yellow
Write-Host ""

# Start the application
try {
    npm run electron:dev
}
catch {
    Write-Host ""
    Write-Host "Application stopped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Results ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Did you verify that an empty window was displayed? (y/n): " -ForegroundColor Yellow -NoNewline
$windowDisplayed = Read-Host

Write-Host "Did the developer tools open? (y/n): " -ForegroundColor Yellow -NoNewline
$devToolsOpened = Read-Host

Write-Host "Did the window have a dark background? (y/n): " -ForegroundColor Yellow -NoNewline
$darkBackground = Read-Host

Write-Host ""

$allPassed = ($windowDisplayed -eq "y") -and ($devToolsOpened -eq "y") -and ($darkBackground -eq "y")

if ($allPassed) {
    Write-Host "✅ TEST PASSED: Empty window is displayed correctly" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  ✓ Window displayed: Yes" -ForegroundColor Green
    Write-Host "  ✓ Developer tools opened: Yes" -ForegroundColor Green
    Write-Host "  ✓ Dark background: Yes" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ TEST FAILED: Some verifications failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  $(if ($windowDisplayed -eq 'y') {'✓'} else {'✗'}) Window displayed: $windowDisplayed" -ForegroundColor $(if ($windowDisplayed -eq 'y') {'Green'} else {'Red'})
    Write-Host "  $(if ($devToolsOpened -eq 'y') {'✓'} else {'✗'}) Developer tools opened: $devToolsOpened" -ForegroundColor $(if ($devToolsOpened -eq 'y') {'Green'} else {'Red'})
    Write-Host "  $(if ($darkBackground -eq 'y') {'✓'} else {'✗'}) Dark background: $darkBackground" -ForegroundColor $(if ($darkBackground -eq 'y') {'Green'} else {'Red'})
    exit 1
}
