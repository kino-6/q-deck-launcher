# Dropdown Animation Demo Guide

## Quick Start

1. **Start the application:**
   ```powershell
   .\launch.ps1
   ```

2. **Test the dropdown animation:**
   - Press **F11** to show the overlay
   - Watch the overlay smoothly slide down from the top of the screen
   - Press **F11** or **Escape** to hide the overlay
   - Watch the overlay smoothly slide up and disappear

## What to Look For

### Dropdown Animation (Show)
- Overlay starts **above the screen** (invisible)
- Smoothly **slides down** to its final position
- Animation takes **150ms** (configurable)
- Uses **easeOutCubic** easing for natural deceleration
- Window appears **centered horizontally**

### Slide-up Animation (Hide)
- Overlay starts at its **current position**
- Smoothly **slides up** above the screen
- Animation takes **150ms** (configurable)
- Uses **easeInCubic** easing for natural acceleration
- Window disappears **smoothly**

## Configuration

Edit `%APPDATA%\q-deck-launcher\config.yaml` (or `config.yaml` in app directory for portable mode):

```yaml
ui:
  window:
    animation:
      enabled: true        # Set to false to disable animation
      duration_ms: 150     # Adjust speed (100-300ms recommended)
```

### Animation Speed Examples

- **Fast (100ms)**: Snappy, responsive
- **Default (150ms)**: Balanced, smooth
- **Slow (200ms)**: Elegant, deliberate
- **Very Slow (300ms)**: Dramatic, cinematic

## Technical Details

### Animation Characteristics

| Property | Value |
|----------|-------|
| Start Position | Y = -(window height + 20) |
| End Position | Y = 50 |
| Frame Rate | ~60fps (16ms per frame) |
| Easing (Show) | Cubic ease-out |
| Easing (Hide) | Cubic ease-in |

### Performance

- **CPU Usage**: Minimal during animation
- **Memory**: No additional allocation
- **Smoothness**: 60fps on modern hardware
- **Compatibility**: Works on all Windows 10/11 systems

## Troubleshooting

### Animation appears choppy
- Check CPU usage (should be < 5% during animation)
- Verify hardware acceleration is enabled
- Try increasing animation duration to 200ms

### Animation is too fast/slow
- Adjust `duration_ms` in config.yaml
- Recommended range: 100-300ms

### No animation visible
- Check `animation.enabled` is set to `true`
- Verify window is not minimized
- Check display scaling settings

## Comparison with Guake Terminal

The Q-Deck dropdown animation is inspired by Guake terminal:

| Feature | Guake | Q-Deck |
|---------|-------|--------|
| Dropdown from top | ✅ | ✅ |
| Smooth animation | ✅ | ✅ |
| Configurable speed | ✅ | ✅ |
| Easing function | ✅ | ✅ |
| Hotkey toggle | ✅ | ✅ |

## Next Steps

After verifying the animation works correctly:

1. Test on different screen resolutions
2. Test on multi-monitor setups
3. Test with different DPI scaling (125%, 150%, 200%)
4. Verify animation doesn't interfere with drag & drop
5. Check animation performance on lower-end hardware

## Feedback

If you notice any issues with the animation:
- Choppy motion
- Incorrect positioning
- Performance problems
- Visual glitches

Please report with:
- Windows version
- Screen resolution
- DPI scaling setting
- Hardware specs (CPU, GPU, RAM)
