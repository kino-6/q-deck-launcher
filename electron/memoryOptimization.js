/**
 * Memory Optimization Module
 * 
 * Implements memory optimization strategies to keep idle memory usage < 120MB:
 * 1. Icon cache cleanup (remove old/unused icons)
 * 2. Periodic garbage collection hints
 * 3. Memory leak detection
 * 4. Resource cleanup utilities
 */

import fs from 'fs';
import path from 'path';

/**
 * Icon Cache Manager
 * Manages icon cache to prevent unbounded growth
 */
export class IconCacheManager {
  constructor(iconCachePath, maxCacheSize = 50 * 1024 * 1024) { // 50MB default
    this.iconCachePath = iconCachePath;
    this.maxCacheSize = maxCacheSize;
    this.accessLog = new Map(); // Track icon access times
  }

  /**
   * Record icon access for LRU tracking
   */
  recordAccess(iconFileName) {
    this.accessLog.set(iconFileName, Date.now());
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize() {
    if (!fs.existsSync(this.iconCachePath)) {
      return 0;
    }

    let totalSize = 0;
    const files = fs.readdirSync(this.iconCachePath);
    
    for (const file of files) {
      const filePath = path.join(this.iconCachePath, file);
      try {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      } catch (err) {
        console.warn('Failed to stat icon file:', filePath, err);
      }
    }

    return totalSize;
  }

  /**
   * Clean up old/unused icons using LRU strategy
   */
  cleanup() {
    if (!fs.existsSync(this.iconCachePath)) {
      return { removed: 0, freedBytes: 0 };
    }

    const currentSize = this.getCacheSize();
    
    // Only cleanup if cache exceeds max size
    if (currentSize <= this.maxCacheSize) {
      return { removed: 0, freedBytes: 0 };
    }

    console.log(`Icon cache size (${(currentSize / 1024 / 1024).toFixed(2)}MB) exceeds limit (${(this.maxCacheSize / 1024 / 1024).toFixed(2)}MB), cleaning up...`);

    const files = fs.readdirSync(this.iconCachePath);
    const fileStats = [];

    // Collect file info with access times
    for (const file of files) {
      const filePath = path.join(this.iconCachePath, file);
      try {
        const stats = fs.statSync(filePath);
        const accessTime = this.accessLog.get(file) || stats.mtimeMs;
        
        fileStats.push({
          name: file,
          path: filePath,
          size: stats.size,
          accessTime,
        });
      } catch (err) {
        console.warn('Failed to stat icon file:', filePath, err);
      }
    }

    // Sort by access time (oldest first)
    fileStats.sort((a, b) => a.accessTime - b.accessTime);

    // Remove oldest files until we're under the limit
    let removedCount = 0;
    let freedBytes = 0;
    let remainingSize = currentSize;

    for (const file of fileStats) {
      if (remainingSize <= this.maxCacheSize * 0.8) { // Target 80% of max
        break;
      }

      try {
        fs.unlinkSync(file.path);
        remainingSize -= file.size;
        freedBytes += file.size;
        removedCount++;
        this.accessLog.delete(file.name);
      } catch (err) {
        console.warn('Failed to delete icon file:', file.path, err);
      }
    }

    console.log(`Icon cache cleanup complete: removed ${removedCount} files, freed ${(freedBytes / 1024 / 1024).toFixed(2)}MB`);

    return { removed: removedCount, freedBytes };
  }

  /**
   * Clear entire cache
   */
  clearAll() {
    if (!fs.existsSync(this.iconCachePath)) {
      return { removed: 0, freedBytes: 0 };
    }

    const files = fs.readdirSync(this.iconCachePath);
    let removedCount = 0;
    let freedBytes = 0;

    for (const file of files) {
      const filePath = path.join(this.iconCachePath, file);
      try {
        const stats = fs.statSync(filePath);
        fs.unlinkSync(filePath);
        freedBytes += stats.size;
        removedCount++;
      } catch (err) {
        console.warn('Failed to delete icon file:', filePath, err);
      }
    }

    this.accessLog.clear();

    console.log(`Icon cache cleared: removed ${removedCount} files, freed ${(freedBytes / 1024 / 1024).toFixed(2)}MB`);

    return { removed: removedCount, freedBytes };
  }
}

/**
 * Memory Monitor
 * Tracks memory usage and detects potential leaks
 */
export class MemoryMonitor {
  constructor(checkInterval = 60000) { // Check every 60 seconds
    this.checkInterval = checkInterval;
    this.measurements = [];
    this.maxMeasurements = 100; // Keep last 100 measurements
    this.timer = null;
    this.leakThreshold = 1.5; // 50% growth indicates potential leak
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      arrayBuffers: usage.arrayBuffers || 0,
    };
  }

  /**
   * Start monitoring
   */
  start() {
    if (this.timer) {
      return; // Already running
    }

    console.log('Memory monitoring started');

    // Take initial measurement
    this.measurements.push(this.getMemoryUsage());

    this.timer = setInterval(() => {
      const usage = this.getMemoryUsage();
      this.measurements.push(usage);

      // Keep only recent measurements
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }

      // Check for potential leaks
      this.checkForLeaks();

      // Log memory usage in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Memory: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB heap, ${(usage.rss / 1024 / 1024).toFixed(2)}MB RSS`);
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('Memory monitoring stopped');
    }
  }

  /**
   * Check for memory leaks
   */
  checkForLeaks() {
    if (this.measurements.length < 10) {
      return null; // Not enough data
    }

    // Compare recent average to older average
    const recentCount = 5;
    const olderCount = 5;
    
    const recent = this.measurements.slice(-recentCount);
    const older = this.measurements.slice(-(recentCount + olderCount), -recentCount);

    const recentAvg = recent.reduce((sum, m) => sum + m.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.heapUsed, 0) / older.length;

    const growthRatio = recentAvg / olderAvg;

    if (growthRatio > this.leakThreshold) {
      console.warn(`⚠️ Potential memory leak detected: ${((growthRatio - 1) * 100).toFixed(1)}% growth`);
      console.warn(`   Older average: ${(olderAvg / 1024 / 1024).toFixed(2)}MB`);
      console.warn(`   Recent average: ${(recentAvg / 1024 / 1024).toFixed(2)}MB`);
      
      return {
        detected: true,
        growthRatio,
        olderAvg,
        recentAvg,
      };
    }

    return null;
  }

  /**
   * Get memory statistics
   */
  getStats() {
    if (this.measurements.length === 0) {
      return null;
    }

    const latest = this.measurements[this.measurements.length - 1];
    const heapValues = this.measurements.map(m => m.heapUsed);
    const rssValues = this.measurements.map(m => m.rss);

    return {
      current: {
        heapUsed: latest.heapUsed,
        heapTotal: latest.heapTotal,
        rss: latest.rss,
        external: latest.external,
      },
      average: {
        heapUsed: heapValues.reduce((a, b) => a + b, 0) / heapValues.length,
        rss: rssValues.reduce((a, b) => a + b, 0) / rssValues.length,
      },
      peak: {
        heapUsed: Math.max(...heapValues),
        rss: Math.max(...rssValues),
      },
      measurements: this.measurements.length,
    };
  }
}

/**
 * Garbage Collection Helper
 * Provides hints to V8 garbage collector
 */
export class GCHelper {
  constructor() {
    this.lastGC = Date.now();
    this.gcInterval = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Request garbage collection if available
   */
  requestGC() {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed;
      global.gc();
      const after = process.memoryUsage().heapUsed;
      const freed = before - after;
      
      console.log(`GC completed: freed ${(freed / 1024 / 1024).toFixed(2)}MB`);
      this.lastGC = Date.now();
      
      return { freed, before, after };
    } else {
      console.warn('GC not available. Run with --expose-gc flag to enable manual GC.');
      return null;
    }
  }

  /**
   * Request GC if enough time has passed
   */
  requestGCIfNeeded() {
    const timeSinceLastGC = Date.now() - this.lastGC;
    
    if (timeSinceLastGC >= this.gcInterval) {
      return this.requestGC();
    }
    
    return null;
  }
}

/**
 * Memory Optimizer
 * Main class that coordinates all memory optimization strategies
 */
export class MemoryOptimizer {
  constructor(iconCachePath) {
    this.iconCacheManager = new IconCacheManager(iconCachePath);
    this.memoryMonitor = new MemoryMonitor();
    this.gcHelper = new GCHelper();
    this.optimizationTimer = null;
  }

  /**
   * Start memory optimization
   */
  start() {
    console.log('Memory optimization started');

    // Start memory monitoring
    this.memoryMonitor.start();

    // Run periodic optimization
    this.optimizationTimer = setInterval(() => {
      this.optimize();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  /**
   * Stop memory optimization
   */
  stop() {
    console.log('Memory optimization stopped');

    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
    }

    this.memoryMonitor.stop();
  }

  /**
   * Run optimization cycle
   */
  optimize() {
    console.log('Running memory optimization cycle...');

    // 1. Clean up icon cache
    const cacheResult = this.iconCacheManager.cleanup();
    
    // 2. Request GC if needed
    const gcResult = this.gcHelper.requestGCIfNeeded();

    // 3. Check for leaks
    const leakCheck = this.memoryMonitor.checkForLeaks();

    return {
      iconCache: cacheResult,
      gc: gcResult,
      leak: leakCheck,
    };
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      memory: this.memoryMonitor.getStats(),
      iconCache: {
        size: this.iconCacheManager.getCacheSize(),
        maxSize: this.iconCacheManager.maxCacheSize,
      },
    };
  }

  /**
   * Record icon access
   */
  recordIconAccess(iconFileName) {
    this.iconCacheManager.recordAccess(iconFileName);
  }
}
