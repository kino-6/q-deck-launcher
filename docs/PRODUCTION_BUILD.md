# Production Build Configuration

## Overview

This document describes the production build configuration for Q-Deck Launcher, ensuring that development tools are disabled and the application is optimized for end users.

## Production Build Features

### 1. Dev Tools Disabled

- **Electron Dev Tools**: Automatically disabled in production builds
- **Environment Detection**: Uses `NODE_ENV=production` to detect production mode
- **Override Protection**: `NO_DEVTOOLS` flag is automatically set in production

### 2. Build Optimizations

#### Vite Build Configuration

- **Minification**: esbuild minification for fast builds
- **CSS Minification**: Enabled for smaller bundle size
- **Code Splitting**: Vendor chunks separated for better caching
  - `react-vendor`: React and React DOM
  - `ui-vendor`: Framer Motion and Styled Components
  - `state-vendor`: Zustand
- **Source Maps**: Disabled in production (enabled only in development)
- **Console Removal**: `console.log` and `debugger` statements removed in production
- **Bundle Size**: Optimized with 1000KB chunk size warning threshold

#### Electron Builder Configuration

- **Test Files Excluded**: `*.test.js` and `*.spec.js` files not included in build
- **Production Files Only**: Only necessary runtime files included
- **Installer Options**:
  - NSIS installer with user-configurable installation directory
  - Desktop and Start Menu shortcuts
  - Portable version support

### 3. Logging Configuration

#### Development Mode
- Full console logging enabled
- Dev tools available
- Verbose startup timing information

#### Production Mode
- Console logs suppressed (except warnings and errors)
- Dev tools completely disabled
- Minimal logging for performance

## Building for Production

### Windows

```bash
npm run electron:build:win
```

This will:
1. Set `NODE_ENV=production`
2. Build the Vite frontend with production optimizations
3. Create Windows installer (NSIS) and portable version
4. Output to `release/` directory

### macOS (Optional)

```bash
npm run electron:build:mac
```

Creates DMG and ZIP packages for macOS.

### Linux (Optional)

```bash
npm run electron:build:linux
```

Creates AppImage and deb packages for Linux.

### All Platforms

```bash
npm run electron:build
```

Builds for the current platform.

## Production Build Verification

### Manual Testing

1. **Build the application**:
   ```bash
   npm run electron:build:win
   ```

2. **Install from the generated installer**:
   - Navigate to `release/` directory
   - Run the NSIS installer or portable executable

3. **Verify dev tools are disabled**:
   - Launch the application
   - Press F12 (should not open dev tools)
   - Right-click and verify "Inspect Element" is not available

4. **Verify functionality**:
   - Test hotkey (F11) to show/hide overlay
   - Test button actions (LaunchApp, Open, Terminal)
   - Test drag & drop functionality
   - Test profile and page switching

### Automated Testing

Run the production build test suite:

```bash
npm test
```

Key tests to verify:
- No dev tools in production environment
- Production build completes successfully
- Application starts without errors
- All core functionality works

## Environment Variables

### Development

```bash
NODE_ENV=development
```

- Dev tools enabled
- Full logging
- Source maps enabled
- Hot module replacement

### Production

```bash
NODE_ENV=production
```

- Dev tools disabled
- Minimal logging (warnings and errors only)
- Source maps disabled
- Optimized bundle size
- Console statements removed

### Override (Development Only)

```bash
NO_DEVTOOLS=true
```

Disables dev tools even in development mode (useful for testing production-like behavior).

## File Size Comparison

### Development Build
- Uncompressed: ~50-60 MB
- With dev tools and source maps

### Production Build
- Compressed installer: ~40-50 MB
- Optimized bundle without dev tools
- No source maps
- Minified code

## Performance Targets

### Startup Time
- Target: < 1000ms
- Production builds should meet or exceed this target

### Memory Usage
- Target: < 120MB idle
- Production builds optimized for memory efficiency

### Bundle Size
- Target: < 50MB installed
- Achieved through code splitting and minification

## Troubleshooting

### Dev Tools Still Appearing

1. Verify `NODE_ENV=production` is set during build
2. Check `electron/main.js` for `isProduction` flag
3. Rebuild with clean cache: `npm run clean && npm run electron:build`

### Build Fails

1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript compilation: `npm run check`
3. Verify Vite build: `npm run build`
4. Check electron-builder logs in `release/` directory

### Application Won't Start

1. Check for missing dependencies in `package.json`
2. Verify `dist/` directory contains built files
3. Check Windows Event Viewer for crash logs
4. Run portable version for easier debugging

## Security Considerations

### Code Signing (Future)

For production releases, consider:
- Windows: Authenticode signing certificate
- macOS: Apple Developer ID certificate
- Linux: GPG signature for packages

### Auto-Update (Future)

Production builds can be configured for auto-update:
- GitHub Releases integration
- Electron updater module
- Signature verification

## Maintenance

### Regular Updates

1. Update dependencies: `npm update`
2. Test production build: `npm run electron:build`
3. Verify all functionality works
4. Update version in `package.json`
5. Create release notes

### Version Numbering

Follow semantic versioning:
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

Current version: 0.1.0 (pre-release)

## References

- [Electron Builder Documentation](https://www.electron.build/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
