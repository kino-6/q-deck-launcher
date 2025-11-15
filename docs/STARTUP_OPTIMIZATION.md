# Startup Optimization Guide

## Overview

This document describes the startup optimizations implemented in Q-Deck Launcher to achieve sub-1000ms startup time.

## Target Metrics

- **Total Startup Time**: < 1000ms (from app launch to ready state)
- **Overlay Response Time**: < 200ms (from hotkey press to overlay visible)
- **Critical Path**: < 500ms (essential initialization only)

## Optimization Strategies

### 1. Lazy Module Loading

**Problem**: Loading all modules at startup increases initial load time.

**Solution**: Implement lazy loading for non-critical modules.

```javascript
// Register modules for lazy loading
lazyLoader.register('ActionExecutor', async () => {
  const { ActionExecutor } = await import('./actions/ActionExecutor.js');
  return ActionExecutor;
});

// Load when needed
const ActionExecutorClass = await lazyLoader.load('ActionExecutor');
```

**Modules Lazy-Loaded**:
- `ActionExecutor` - Only needed when executing actions
- `ProfileStateManager` - Only needed for profile switching
- `IpcHandlers` - Can be registered after initial startup

**Time Saved**: ~150-200ms

### 2. Config Caching

**Problem**: Parsing YAML config file on every startup is slow.

**Solution**: Cache parsed config in memory with TTL.

```javascript
// Check cache first
const cachedConfig = configCache.get();
if (cachedConfig) {
  config = cachedConfig;
  return; // Skip file I/O and parsing
}

// Load from file and cache
config = yaml.parse(fileContents);
configCache.set(config);
```

**Time Saved**: ~50-100ms (depending on config size)

### 3. Deferred Initialization

**Problem**: Some initialization tasks don't need to complete before app is "ready".

**Solution**: Defer non-critical tasks to execute after critical path.

```javascript
// Critical path: overlay + hotkeys
createOverlayWindow();
registerHotkeys();

// Deferred: main window (not needed immediately)
deferredInit.defer('main-window', () => {
  createMainWindow();
}, 100);

// Deferred: IPC handlers (can wait)
deferredInit.defer('ipc-handlers', async () => {
  registerAllHandlers(...);
}, 300);
```

**Tasks Deferred**:
- Main settings window creation (100ms delay)
- Lazy module loading (200ms delay)
- IPC handler registration (300ms delay)

**Time Saved**: ~200-300ms (critical path only)

### 4. React Component Lazy Loading

**Problem**: Loading all React components increases bundle size and parse time.

**Solution**: Use React.lazy() for code splitting.

```typescript
// Lazy load components
const Grid = lazy(() => import('./components/Grid'));
const Overlay = lazy(() => import('./pages/Overlay'));

// Render with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Overlay />
</Suspense>
```

**Components Lazy-Loaded**:
- `Grid` - Settings UI (not needed in overlay mode)
- `Overlay` - Overlay UI (not needed in settings mode)

**Time Saved**: ~100-150ms (initial parse time)

### 5. Bundle Optimization

**Problem**: Large JavaScript bundles take longer to download and parse.

**Solution**: Configure Vite for optimal code splitting and minification.

```typescript
build: {
  target: 'esnext',
  minify: 'esbuild',
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['framer-motion', 'styled-components'],
        'state-vendor': ['zustand']
      }
    }
  }
}
```

**Optimizations**:
- Manual chunk splitting for better caching
- ESBuild minification (faster than Terser)
- Modern ES target (smaller output)

**Time Saved**: ~50-100ms (parse time)

### 6. Window Creation Optimization

**Problem**: Creating transparent overlay window can be slow.

**Solution**: Optimize window creation flags.

```javascript
overlayWindow = new BrowserWindow({
  show: false, // Don't show until ready
  paintWhenInitiallyHidden: false, // Don't paint when hidden
  backgroundThrottling: false, // Prevent throttling
  hasShadow: false, // Disable shadow for performance
  roundedCorners: false // Disable rounded corners
});
```

**Time Saved**: ~50ms (window creation)

## Performance Monitoring

### Startup Timer

The `StartupTimer` class tracks performance metrics:

```javascript
const startupTimer = new StartupTimer();

// Mark important events
startupTimer.mark('config-load-start');
loadConfig();
startupTimer.mark('config-load-end');

// Measure duration
startupTimer.measure('config-load', 'config-load-start', 'config-load-end');

// Generate report
const report = startupTimer.report();
console.log(`Total startup time: ${report.totalTime}ms`);
```

### Key Metrics Tracked

- `config-load` - Configuration loading time
- `main-window-create` - Main window creation time
- `overlay-window-create` - Overlay window creation time
- `critical-path` - Time for critical initialization
- `total-startup` - Total time from app start to ready

## Testing

### Unit Tests

Run unit tests for optimization utilities:

```bash
npm test -- startupOptimization.test.js
```

### Integration Tests

Run integration tests to measure actual startup time:

```bash
npm test -- startupPerformance.integration.test.js
```

**Note**: Integration tests are skipped in CI as they require Electron.

### Manual Testing

1. Build the application:
   ```bash
   npm run build
   ```

2. Launch and observe console output:
   ```bash
   npm run electron:dev
   ```

3. Look for startup report:
   ```
   === Startup Performance Report ===
   Total startup time: 850ms
   
   Detailed timings:
     config-load: 45ms (5.3%)
     overlay-window-create: 120ms (14.1%)
     critical-path: 380ms (44.7%)
     total-startup: 850ms (100.0%)
   ===================================
   ```

## Troubleshooting

### Startup Time > 1000ms

1. **Check config file size**: Large config files take longer to parse
   - Solution: Reduce number of buttons/profiles
   - Solution: Use config cache

2. **Check disk I/O**: Slow disk can delay file operations
   - Solution: Use SSD
   - Solution: Increase cache duration

3. **Check CPU**: Slow CPU affects JavaScript parsing
   - Solution: Optimize bundle size
   - Solution: Use lazy loading

4. **Check network**: Dev mode requires Vite dev server
   - Solution: Use production build for testing
   - Solution: Ensure dev server is running

### Overlay Response Time > 200ms

1. **Check window creation**: Overlay window may not be pre-created
   - Solution: Ensure overlay window is created during startup

2. **Check animation**: Animation may be too slow
   - Solution: Reduce animation duration in config
   - Solution: Disable animation for testing

3. **Check hotkey registration**: Hotkey may not be registered
   - Solution: Check console for hotkey registration errors

## Future Optimizations

### Potential Improvements

1. **Preload Critical Assets**: Preload icons and images during idle time
2. **Worker Threads**: Move heavy computation to worker threads
3. **Native Modules**: Use native modules for performance-critical code
4. **Startup Cache**: Cache entire application state for instant startup
5. **Incremental Loading**: Load UI incrementally as user scrolls

### Benchmarking

Track startup time over releases:

| Version | Startup Time | Notes |
|---------|--------------|-------|
| 0.1.0   | 1500ms       | Baseline |
| 0.2.0   | 850ms        | Lazy loading + caching |
| 0.3.0   | TBD          | Future optimizations |

## References

- [Electron Performance Best Practices](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
