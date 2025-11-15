# Test Script for Button Customization (Task 4.3)
# This script provides manual testing instructions for button color and font customization

Write-Host "=== Button Customization Test (Task 4.3) ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "1. Application must be running (use .\launch.ps1)"
Write-Host "2. At least one button should exist in the grid"
Write-Host ""

Write-Host "Test Steps:" -ForegroundColor Green
Write-Host ""

Write-Host "Test 1: Open Button Edit Modal" -ForegroundColor Cyan
Write-Host "  1. Press F11 to open the overlay"
Write-Host "  2. Right-click on any button"
Write-Host "  3. Select 'Edit' from the context menu"
Write-Host "  4. Verify: Edit modal opens with current button settings"
Write-Host ""

Write-Host "Test 2: Change Background Color" -ForegroundColor Cyan
Write-Host "  1. In the edit modal, find 'Background Color' section"
Write-Host "  2. Click the color picker and select a new color (e.g., red #ff0000)"
Write-Host "  3. Verify: Preview updates immediately with new background color"
Write-Host "  4. Alternative: Type hex color in text input (e.g., #00ff00)"
Write-Host "  5. Verify: Preview updates with typed color"
Write-Host ""

Write-Host "Test 3: Change Text Color" -ForegroundColor Cyan
Write-Host "  1. Find 'Text Color' section"
Write-Host "  2. Click the color picker and select a new color (e.g., black #000000)"
Write-Host "  3. Verify: Preview text color updates immediately"
Write-Host "  4. Alternative: Type hex color in text input (e.g., #ffff00)"
Write-Host "  5. Verify: Preview updates with typed color"
Write-Host ""

Write-Host "Test 4: Change Font Size" -ForegroundColor Cyan
Write-Host "  1. Find 'Font Size (px)' section"
Write-Host "  2. Change the number (try values like 18, 24, 32)"
Write-Host "  3. Verify: Preview text size updates immediately"
Write-Host "  4. Try minimum (8) and maximum (48) values"
Write-Host "  5. Verify: Values are constrained to valid range"
Write-Host ""

Write-Host "Test 5: Change Font Family" -ForegroundColor Cyan
Write-Host "  1. Find 'Font Family' dropdown"
Write-Host "  2. Select different fonts (Arial, Courier New, Verdana, etc.)"
Write-Host "  3. Verify: Preview font changes immediately"
Write-Host "  4. Try multiple fonts to see differences"
Write-Host ""

Write-Host "Test 6: Preview All Changes" -ForegroundColor Cyan
Write-Host "  1. Change all settings:"
Write-Host "     - Background: Red (#ff0000)"
Write-Host "     - Text: Yellow (#ffff00)"
Write-Host "     - Font Size: 20"
Write-Host "     - Font Family: Courier New"
Write-Host "  2. Verify: Preview shows all changes simultaneously"
Write-Host "  3. Verify: Preview looks correct and readable"
Write-Host ""

Write-Host "Test 7: Save Changes" -ForegroundColor Cyan
Write-Host "  1. Click 'Save' button"
Write-Host "  2. Verify: Modal closes"
Write-Host "  3. Verify: Page reloads automatically"
Write-Host "  4. Verify: Button in grid shows new styling"
Write-Host "  5. Press F11 to close overlay"
Write-Host "  6. Press F11 again to reopen"
Write-Host "  7. Verify: Changes persist after reopening"
Write-Host ""

Write-Host "Test 8: Cancel Changes" -ForegroundColor Cyan
Write-Host "  1. Right-click button and select 'Edit'"
Write-Host "  2. Make some changes to colors/fonts"
Write-Host "  3. Click 'Cancel' button"
Write-Host "  4. Verify: Modal closes without saving"
Write-Host "  5. Verify: Button retains original styling"
Write-Host ""

Write-Host "Test 9: Close with Escape Key" -ForegroundColor Cyan
Write-Host "  1. Right-click button and select 'Edit'"
Write-Host "  2. Make some changes"
Write-Host "  3. Press Escape key"
Write-Host "  4. Verify: Modal closes without saving"
Write-Host ""

Write-Host "Test 10: Close with X Button" -ForegroundColor Cyan
Write-Host "  1. Right-click button and select 'Edit'"
Write-Host "  2. Make some changes"
Write-Host "  3. Click the X button in top-right corner"
Write-Host "  4. Verify: Modal closes without saving"
Write-Host ""

Write-Host "Test 11: Edit Multiple Buttons" -ForegroundColor Cyan
Write-Host "  1. Edit first button with red background"
Write-Host "  2. Save changes"
Write-Host "  3. Edit second button with blue background"
Write-Host "  4. Save changes"
Write-Host "  5. Verify: Each button has its own unique styling"
Write-Host "  6. Verify: Styles don't interfere with each other"
Write-Host ""

Write-Host "Test 12: Button Without Existing Style" -ForegroundColor Cyan
Write-Host "  1. Find a button that hasn't been customized"
Write-Host "  2. Right-click and select 'Edit'"
Write-Host "  3. Verify: Modal shows default values"
Write-Host "  4. Change some settings and save"
Write-Host "  5. Verify: New style is applied correctly"
Write-Host ""

Write-Host "Expected Results:" -ForegroundColor Yellow
Write-Host "✓ Edit modal opens when 'Edit' is selected from context menu"
Write-Host "✓ Background color can be changed via picker or text input"
Write-Host "✓ Text color can be changed via picker or text input"
Write-Host "✓ Font size can be adjusted (8-48px range)"
Write-Host "✓ Font family can be selected from dropdown"
Write-Host "✓ Preview updates in real-time for all changes"
Write-Host "✓ Save button applies changes and reloads page"
Write-Host "✓ Cancel/Escape/X button closes modal without saving"
Write-Host "✓ Changes persist across application restarts"
Write-Host "✓ Multiple buttons can have different styles"
Write-Host ""

Write-Host "Configuration File:" -ForegroundColor Yellow
Write-Host "Changes are saved to: %APPDATA%\q-deck-launcher\config.yaml"
Write-Host "You can verify the style section in the YAML file:"
Write-Host ""
Write-Host "  buttons:" -ForegroundColor Gray
Write-Host "    - position: { row: 1, col: 1 }" -ForegroundColor Gray
Write-Host "      label: 'My Button'" -ForegroundColor Gray
Write-Host "      style:" -ForegroundColor Gray
Write-Host "        background_color: '#ff0000'" -ForegroundColor Gray
Write-Host "        text_color: '#ffffff'" -ForegroundColor Gray
Write-Host "        font_size: 18" -ForegroundColor Gray
Write-Host "        font_family: 'Arial, sans-serif'" -ForegroundColor Gray
Write-Host ""

Write-Host "Automated Tests:" -ForegroundColor Yellow
Write-Host "Run: npm test -- ButtonCustomization.test.tsx"
Write-Host "All 20 tests should pass"
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "If all tests pass, Task 4.3 is successfully implemented!" -ForegroundColor Green
