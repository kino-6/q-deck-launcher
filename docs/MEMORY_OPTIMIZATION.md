# Memory Optimization

## Overview

Q-Deck implements comprehensive memory optimization strategies to maintain idle memory usage below 120MB. This document describes the optimization techniques and how they work.

## Target Metrics

- **Idle Memory Usage**: < 120MB RSS (Resident Set Size)
- **Heap Usage**: < 50MB when idle
- **Icon Cache**: < 50MB maximum size
- **Memory Growth**: < 50% over extended use (no leaks)

## Optimization Strategies

### 1. Icon Cache Management

The icon cache stores extracted icons from executables and files. Without management, this cache can grow unbounded.

**Features:**
- **LRU (Least Recently Used) Cleanup**: Automatically removes old/unused icons
- **Size Limit**: Configurable maximum cache size (default: 50MB)
- **Access Tracking**: Records when icons are accessed for intelligent cleanup
- **Automatic Cleanup**: Runs every 10 minutes during optimization cycle

**Implementation:**
```javascript
// Icon cache is managed by IconCacheManager
const iconCacheManager = new IconCacheManager(iconCachePath, 50 * 1024 * 1024);

// Record access when icon is used
iconCacheManager.recordAccess('icon-filename.png');

// Cleanup runs automatically, but can be triggered manually
const result = iconCacheManager.cleanup();
console.log(`Removed ${result.removed} files, freed ${result.freedBytes} bytes`);
```

### 2. Memory Monitoring

Continuous monitoring tracks memory usage patterns and detects potential leaks.

**Features:**
- **Real-time Tracking**: Monitors heap, RSS, and external memory
- **Leak Detection**: Compares recent vs. older memory usage to detect growth
- **Statistics**: Provides current, average, and peak memory metrics
- **Configurable Interval**: Default check every 60 seconds

**Metrics Tracked:**
- `heapUsed`: JavaScript heap memory in use
- `heapTotal`: Total JavaScript heap allocated
- `rss`: Resident Set Size (total memory)
- `external`: Memory used by C++ objects bound to JavaScript
- `arrayBuffers`: Memory allocated for ArrayBuffers

**Implementation:**
```javascript
const memoryMonitor = new MemoryMonitor(60000); // Check every 60s
memoryMonitor.start();

// Get statistics
const stats = memoryMonitor.getStats();
console.log(`Current heap: ${stats.current.heapUsed / 1024 / 1024}MB`);
console.log(`Average heap: ${stats.average.heapUsed / 1024 / 1024}MB`);
console.log(`Peak heap: ${stats.peak.heapUsed / 1024 / 1024}MB`);

// Check for leaks
const leak = memoryMonitor.checkForLeaks();
if (leak) {
  console.warn(`Memory leak detected: ${leak.growthRatio}x growth`);
}
```

### 3. Garbage Collection Hints

Provides hints to V8's garbage collector to reclaim memory during idle periods.

**Features:**
- **Manual GC Trigger**: Requests garbage collection when available
- **Interval-based**: Only triggers GC every 5 minutes to avoid overhead
- **Measurement**: Reports how much memory was freed

**Note:** Manual GC requires Node.js to be started with `--expose-gc` flag. In production, V8's automatic GC is sufficient.

**Implementation:**
```javascript
const gcHelper = new GCHelper();

// Request GC if enough time has passed
const result = gcHelper.requestGCIfNeeded();
if (result) {
  console.log(`GC freed ${result.freed / 1024 / 1024}MB`);
}
```

### 4. React Component Optimization

React components are optimized to prevent unnecessary re-renders.

**Techniques:**
- **React.memo**: Memoizes components to skip re-renders when props haven't changed
- **useMemo**: Memoizes expensive calculations
- **useCallback**: Memoizes callback functions to prevent recreation

**Optimized Components:**
- `ActionButton`: Memoized with custom comparison
- `GridCell`: Memoized with prop comparison
- `Grid`: Uses memoized calculations for grid layout

### 5. Lazy Loading

Non-critical modules are loaded on-demand to reduce initial memory footprint.

**Lazy-loaded Modules:**
- Action executors (LaunchApp, Open, Terminal)
- Profile state manager
- IPC handlers

**Benefits:**
- Faster startup time
- Lower initial memory usage
- Modules loaded only when needed

## Memory Optimizer

The `MemoryOptimizer` class coordinates all optimization strategies.

**Usage:**
```javascript
import { MemoryOptimizer } from './memoryOptimization.js';

// Initialize with icon cache path
const optimizer = new MemoryOptimizer(iconCachePath);

// Start optimization (runs automatically every 10 minutes)
optimizer.start();

// Get statistics
const stats = optimizer.getStats();
console.log('Memory:', stats.memory);
console.log('Icon Cache:', stats.iconCache);

// Manual optimization
const result = optimizer.optimize();
console.log('Optimization result:', result);

// Stop optimization
optimizer.stop();
```

## IPC API

The renderer process can access memory statistics via IPC:

```javascript
// Get memory statistics
const stats = await window.electronAPI.getMemoryStats();
console.log(`Current memory: ${stats.memory.current.rss / 1024 / 1024}MB`);

// Trigger manual optimization
const result = await window.electronAPI.optimizeMemory();
console.log(`Freed ${result.iconCache.freedBytes} bytes from icon cache`);
```

## Performance Impact

Memory optimization has minimal performance impact:

- **Icon Cache Cleanup**: ~10ms every 10 minutes
- **Memory Monitoring**: ~1ms every 60 seconds
- **GC Hints**: ~50-100ms every 5 minutes (if enabled)
- **Total Overhead**: < 0.1% CPU usage

## Testing

### Unit Tests

Run unit tests for memory optimization:
```bash
npm test electron/memoryOptimization.test.js
```

Tests cover:
- Icon cache management
- Memory monitoring
- GC helper
- Memory optimizer integration

### Integration Tests

Run integration tests to verify memory targets:
```bash
npm test electron/memoryUsage.integration.test.js
```

Tests verify:
- Idle memory usage < 120MB (with test overhead allowance)
- No memory leaks over extended use
- Icon cache cleanup when size limit exceeded

## Monitoring in Production

### Development Mode

In development, memory statistics are logged periodically:
```
Memory: 45.23MB heap, 98.45MB RSS
```

### Production Mode

In production, memory monitoring runs silently. Access statistics via:
```javascript
const stats = await window.electronAPI.getMemoryStats();
```

## Troubleshooting

### High Memory Usage

If memory usage exceeds targets:

1. **Check Icon Cache Size**:
   ```javascript
   const stats = await window.electronAPI.getMemoryStats();
   console.log(`Icon cache: ${stats.iconCache.size / 1024 / 1024}MB`);
   ```

2. **Trigger Manual Cleanup**:
   ```javascript
   await window.electronAPI.optimizeMemory();
   ```

3. **Check for Memory Leaks**:
   - Monitor memory over time
   - Look for steady growth in heap usage
   - Check for event listener leaks
   - Verify components are properly unmounted

### Memory Leaks

If leak detection triggers:

1. **Review Recent Changes**: Check for new event listeners or timers
2. **Check Component Lifecycle**: Ensure cleanup in useEffect
3. **Verify Cache Cleanup**: Ensure old data is being released
4. **Profile with DevTools**: Use Chrome DevTools memory profiler

## Best Practices

### For Developers

1. **Use React.memo**: Memoize components that render frequently
2. **Clean Up Effects**: Always return cleanup functions from useEffect
3. **Avoid Memory Leaks**: Remove event listeners, clear timers
4. **Limit Cache Size**: Don't store unbounded data in memory
5. **Use Weak References**: For caches that can be garbage collected

### For Users

1. **Restart Periodically**: Restart the app if memory usage grows
2. **Clear Icon Cache**: Use settings to clear icon cache if needed
3. **Monitor Performance**: Check Task Manager if app feels slow
4. **Report Issues**: Report persistent high memory usage

## Future Improvements

Potential enhancements:

1. **Adaptive Optimization**: Adjust cleanup frequency based on memory pressure
2. **User Preferences**: Allow users to configure memory limits
3. **Advanced Profiling**: Integrate heap snapshot analysis
4. **Memory Warnings**: Alert users when memory usage is high
5. **Automatic Recovery**: Restart components if memory leak detected

## References

- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)
- [V8 Garbage Collection](https://v8.dev/blog/trash-talk)
- [React Performance Optimization](https://react.dev/reference/react/memo)
- [Electron Memory Usage](https://www.electronjs.org/docs/latest/tutorial/performance)
