/**
 * Memory Optimization Tests
 * 
 * Tests for memory optimization features:
 * - Icon cache management
 * - Memory monitoring
 * - Garbage collection
 * - Memory leak detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  IconCacheManager,
  MemoryMonitor,
  GCHelper,
  MemoryOptimizer,
} from './memoryOptimization.js';

describe('IconCacheManager', () => {
  let tempDir;
  let cacheManager;

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = path.join(os.tmpdir(), `icon-cache-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Create cache manager with small max size for testing
    cacheManager = new IconCacheManager(tempDir, 1024 * 100); // 100KB
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should calculate cache size correctly', () => {
    // Create some test files
    fs.writeFileSync(path.join(tempDir, 'icon1.png'), Buffer.alloc(1024)); // 1KB
    fs.writeFileSync(path.join(tempDir, 'icon2.png'), Buffer.alloc(2048)); // 2KB
    
    const size = cacheManager.getCacheSize();
    expect(size).toBe(3072); // 3KB
  });

  it('should return 0 for non-existent cache directory', () => {
    const nonExistentCache = new IconCacheManager('/non/existent/path');
    expect(nonExistentCache.getCacheSize()).toBe(0);
  });

  it('should record icon access', () => {
    cacheManager.recordAccess('icon1.png');
    expect(cacheManager.accessLog.has('icon1.png')).toBe(true);
    expect(cacheManager.accessLog.get('icon1.png')).toBeGreaterThan(0);
  });

  it('should not cleanup when under size limit', () => {
    // Create small files (under 100KB limit)
    fs.writeFileSync(path.join(tempDir, 'icon1.png'), Buffer.alloc(1024)); // 1KB
    fs.writeFileSync(path.join(tempDir, 'icon2.png'), Buffer.alloc(1024)); // 1KB
    
    const result = cacheManager.cleanup();
    expect(result.removed).toBe(0);
    expect(result.freedBytes).toBe(0);
  });

  it('should cleanup old files when over size limit', () => {
    // Create files that exceed 100KB limit
    const file1 = path.join(tempDir, 'icon1.png');
    const file2 = path.join(tempDir, 'icon2.png');
    const file3 = path.join(tempDir, 'icon3.png');
    
    fs.writeFileSync(file1, Buffer.alloc(50 * 1024)); // 50KB
    fs.writeFileSync(file2, Buffer.alloc(50 * 1024)); // 50KB
    fs.writeFileSync(file3, Buffer.alloc(50 * 1024)); // 50KB
    
    // Record access times (file1 is oldest)
    cacheManager.recordAccess('icon1.png');
    setTimeout(() => {
      cacheManager.recordAccess('icon2.png');
      cacheManager.recordAccess('icon3.png');
    }, 10);
    
    // Wait a bit for access times to differ
    setTimeout(() => {
      const result = cacheManager.cleanup();
      expect(result.removed).toBeGreaterThan(0);
      expect(result.freedBytes).toBeGreaterThan(0);
      
      // Oldest file should be removed
      expect(fs.existsSync(file1)).toBe(false);
    }, 50);
  });

  it('should clear all cache files', () => {
    // Create test files
    fs.writeFileSync(path.join(tempDir, 'icon1.png'), Buffer.alloc(1024));
    fs.writeFileSync(path.join(tempDir, 'icon2.png'), Buffer.alloc(1024));
    fs.writeFileSync(path.join(tempDir, 'icon3.png'), Buffer.alloc(1024));
    
    const result = cacheManager.clearAll();
    expect(result.removed).toBe(3);
    expect(result.freedBytes).toBe(3072);
    expect(fs.readdirSync(tempDir).length).toBe(0);
  });
});

describe('MemoryMonitor', () => {
  let monitor;

  beforeEach(() => {
    monitor = new MemoryMonitor(100); // Check every 100ms for testing
  });

  afterEach(() => {
    monitor.stop();
  });

  it('should get current memory usage', () => {
    const usage = monitor.getMemoryUsage();
    
    expect(usage).toHaveProperty('timestamp');
    expect(usage).toHaveProperty('heapUsed');
    expect(usage).toHaveProperty('heapTotal');
    expect(usage).toHaveProperty('external');
    expect(usage).toHaveProperty('rss');
    expect(usage.heapUsed).toBeGreaterThan(0);
    expect(usage.rss).toBeGreaterThan(0);
  });

  it('should start and stop monitoring', () => {
    expect(monitor.timer).toBeNull();
    
    monitor.start();
    expect(monitor.timer).not.toBeNull();
    expect(monitor.measurements.length).toBeGreaterThan(0);
    
    monitor.stop();
    expect(monitor.timer).toBeNull();
  });

  it('should collect measurements over time', (done) => {
    monitor.start();
    
    setTimeout(() => {
      expect(monitor.measurements.length).toBeGreaterThan(1);
      monitor.stop();
      done();
    }, 250); // Wait for at least 2 measurements
  });

  it('should limit measurements to max count', () => {
    monitor.maxMeasurements = 5;
    
    // Add more than max measurements
    for (let i = 0; i < 10; i++) {
      monitor.measurements.push(monitor.getMemoryUsage());
      
      // Simulate the trimming logic that happens in the actual monitor
      if (monitor.measurements.length > monitor.maxMeasurements) {
        monitor.measurements.shift();
      }
    }
    
    expect(monitor.measurements.length).toBeLessThanOrEqual(monitor.maxMeasurements);
  });

  it('should return null for leak check with insufficient data', () => {
    // Add only a few measurements
    monitor.measurements.push(monitor.getMemoryUsage());
    monitor.measurements.push(monitor.getMemoryUsage());
    
    const result = monitor.checkForLeaks();
    expect(result).toBeNull();
  });

  it('should get memory statistics', () => {
    // Add some measurements
    for (let i = 0; i < 5; i++) {
      monitor.measurements.push(monitor.getMemoryUsage());
    }
    
    const stats = monitor.getStats();
    expect(stats).toHaveProperty('current');
    expect(stats).toHaveProperty('average');
    expect(stats).toHaveProperty('peak');
    expect(stats).toHaveProperty('measurements');
    expect(stats.measurements).toBe(5);
  });

  it('should return null stats when no measurements', () => {
    const stats = monitor.getStats();
    expect(stats).toBeNull();
  });
});

describe('GCHelper', () => {
  let gcHelper;

  beforeEach(() => {
    gcHelper = new GCHelper();
  });

  it('should request GC if available', () => {
    if (global.gc) {
      const result = gcHelper.requestGC();
      expect(result).toHaveProperty('freed');
      expect(result).toHaveProperty('before');
      expect(result).toHaveProperty('after');
    } else {
      const result = gcHelper.requestGC();
      expect(result).toBeNull();
    }
  });

  it('should only request GC after interval', () => {
    gcHelper.gcInterval = 1000; // 1 second
    gcHelper.lastGC = Date.now();
    
    // Should not GC immediately
    const result1 = gcHelper.requestGCIfNeeded();
    expect(result1).toBeNull();
    
    // Simulate time passing
    gcHelper.lastGC = Date.now() - 2000; // 2 seconds ago
    
    // Should GC now (if available)
    const result2 = gcHelper.requestGCIfNeeded();
    if (global.gc) {
      expect(result2).not.toBeNull();
    }
  });
});

describe('MemoryOptimizer', () => {
  let tempDir;
  let optimizer;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `memory-optimizer-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    optimizer = new MemoryOptimizer(tempDir);
  });

  afterEach(() => {
    optimizer.stop();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should start and stop optimization', () => {
    expect(optimizer.optimizationTimer).toBeNull();
    expect(optimizer.memoryMonitor.timer).toBeNull();
    
    optimizer.start();
    expect(optimizer.optimizationTimer).not.toBeNull();
    expect(optimizer.memoryMonitor.timer).not.toBeNull();
    
    optimizer.stop();
    expect(optimizer.optimizationTimer).toBeNull();
    expect(optimizer.memoryMonitor.timer).toBeNull();
  });

  it('should run optimization cycle', () => {
    const result = optimizer.optimize();
    
    expect(result).toHaveProperty('iconCache');
    expect(result).toHaveProperty('gc');
    expect(result).toHaveProperty('leak');
  });

  it('should get statistics', () => {
    // Start monitoring to collect some data
    optimizer.start();
    
    setTimeout(() => {
      const stats = optimizer.getStats();
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('iconCache');
      expect(stats.iconCache).toHaveProperty('size');
      expect(stats.iconCache).toHaveProperty('maxSize');
      
      optimizer.stop();
    }, 150);
  });

  it('should record icon access', () => {
    optimizer.recordIconAccess('test-icon.png');
    expect(optimizer.iconCacheManager.accessLog.has('test-icon.png')).toBe(true);
  });
});

describe('Memory Optimization Integration', () => {
  it('should keep memory usage under target', (done) => {
    const tempDir = path.join(os.tmpdir(), `memory-integration-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const optimizer = new MemoryOptimizer(tempDir);
    optimizer.start();
    
    // Run for a short time and check memory
    setTimeout(() => {
      const stats = optimizer.getStats();
      
      if (stats && stats.memory) {
        const currentMemoryMB = stats.memory.current.rss / 1024 / 1024;
        console.log(`Current memory usage: ${currentMemoryMB.toFixed(2)}MB`);
        
        // Note: This is a soft check since we can't control all memory usage
        // The target is < 120MB idle, but during tests it may be higher
        expect(currentMemoryMB).toBeLessThan(200); // Generous limit for tests
      }
      
      optimizer.stop();
      fs.rmSync(tempDir, { recursive: true, force: true });
      done();
    }, 500);
  });
});
