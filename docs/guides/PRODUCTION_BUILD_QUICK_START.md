# Production Build Quick Start

## Building for Production

### Windows (Recommended)

```bash
npm run electron:build:win
```

This creates:
- NSIS installer: `release/Q-Deck Launcher Setup X.X.X.exe`
- Portable version: `release/Q-Deck Launcher X.X.X.exe`

### All Platforms

```bash
npm run electron:build
```

Builds for your current platform.

## What's Different in Production?

### ✅ Enabled in Production
- Code minification (esbuild)
- CSS minification
- Code splitting (vendor chunks)
- Optimized bundle size
- NSIS installer with shortcuts

### ❌ Disabled in Production
- Developer tools (F12, Inspect Element)
- Console logs (console.log, console.debug)
- Debugger statements
- Source maps
- Test files

## Verification Checklist

After building, verify:

1. **Dev tools disabled**
   - Install the application
   - Press F12 → Nothing should happen
   - Right-click → No "Inspect Element" option

2. **Application works**
   - F11 shows/hides overlay
   - Buttons execute actions
   - Drag & drop works
   - Settings persist

3. **Performance**
   - Startup time < 1000ms
   - Memory usage < 120MB idle
   - Smooth animations

## Testing Production Build

Run automated tests:

```bash
npm test productionBuild.test.js
```

All 17 tests should pass.

## File Locations

- **Build output**: `release/` directory
- **Installer**: `release/Q-Deck Launcher Setup X.X.X.exe`
- **Portable**: `release/Q-Deck Launcher X.X.X.exe`
- **Config (installed)**: `%APPDATA%\q-deck-launcher\config.yaml`
- **Config (portable)**: Same directory as executable

## Troubleshooting

### Dev tools still appear
- Verify `NODE_ENV=production` in build script
- Clean build: `npm run clean && npm run electron:build`

### Build fails
- Check dependencies: `npm install`
- Verify TypeScript: `npm run check`
- Check Vite build: `npm run build`

### Application won't start
- Check Windows Event Viewer for errors
- Try portable version for easier debugging
- Verify all dependencies in `package.json`

## Next Steps

See `docs/PRODUCTION_BUILD.md` for detailed documentation.
