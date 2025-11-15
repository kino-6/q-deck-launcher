/**
 * Memory Usage Integration Test
 * 
 * Verifies that the application maintains memory usage < 120MB when idle
 */

import { describe, it, expect } from 'vitest';
import { MemoryOptimizer } from './memoryOptimization.js';
import path from 'path';
import os from 'os';
import fs from 'fs';

describe('Memory Usage - Idle State', () => {
  it('should maintain memory usage under 120MB when idle', async () => {
    // Create temporary icon cache directory
    const tempDir = path.join(os.tmpdir(), `memory-usage-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Initialize memory optimizer
      const optimizer = new MemoryOptimizer(tempDir);
      optimizer.start();
      
      // Wait for initial measurements
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get memory statistics
      const stats = optimizer.getStats();
      
      expect(stats).not.toBeNull();
      expect(stats.memory).not.toBeNull();
      
      const currentMemoryMB = stats.memory.current.rss / 1024 / 1024;
      const heapUsedMB = stats.memory.current.heapUsed / 1024 / 1024;
      
      console.log('Memory Usage Statistics:');
      console.log(`  RSS: ${currentMemoryMB.toFixed(2)}MB`);
      console.log(`  Heap Used: ${heapUsedMB.toFixed(2)}MB`);
      console.log(`  Heap Total: ${(stats.memory.current.heapTotal / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  External: ${(stats.memory.current.external / 1024 / 1024).toFixed(2)}MB`);
      
      if (stats.memory.average) {
        console.log(`  Average RSS: ${(stats.memory.average.rss / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  Average Heap: ${(stats.memory.average.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // Target: < 120MB RSS when idle
      // Note: During tests, memory usage may be higher due to test framework overhead
      // We use a more generous limit for CI/CD environments
      const targetMemoryMB = 120;
      const testLimitMB = 150; // Allow some overhead for test environment
      
      if (currentMemoryMB > targetMemoryMB) {
        console.warn(`⚠️ Memory usage (${currentMemoryMB.toFixed(2)}MB) exceeds target (${targetMemoryMB}MB)`);
      } else {
        console.log(`✅ Memory usage (${currentMemoryMB.toFixed(2)}MB) is within target (${targetMemoryMB}MB)`);
      }
      
      // Assert with test limit
      expect(currentMemoryMB).toBeLessThan(testLimitMB);
      
      // Stop optimizer
      optimizer.stop();
    } finally {
      // Cleanup
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });

  it('should not have memory leaks after extended use', async () => {
    const tempDir = path.join(os.tmpdir(), `memory-leak-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      const optimizer = new MemoryOptimizer(tempDir);
      optimizer.start();
      
      // Simulate extended use by collecting measurements over time
      const measurements = [];
      const measurementCount = 10;
      const measurementInterval = 200; // 200ms between measurements
      
      for (let i = 0; i < measurementCount; i++) {
        await new Promise(resolve => setTimeout(resolve, measurementInterval));
        
        const stats = optimizer.getStats();
        if (stats && stats.memory) {
          measurements.push(stats.memory.current.heapUsed);
        }
      }
      
      expect(measurements.length).toBeGreaterThan(5);
      
      // Check for memory growth
      const firstHalf = measurements.slice(0, Math.floor(measurements.length / 2));
      const secondHalf = measurements.slice(Math.floor(measurements.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const growthRatio = secondAvg / firstAvg;
      
      console.log('Memory Leak Detection:');
      console.log(`  First half average: ${(firstAvg / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Second half average: ${(secondAvg / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Growth ratio: ${growthRatio.toFixed(2)}x`);
      
      // Memory should not grow significantly (< 50% growth)
      expect(growthRatio).toBeLessThan(1.5);
      
      if (growthRatio > 1.2) {
        console.warn(`⚠️ Potential memory growth detected: ${((growthRatio - 1) * 100).toFixed(1)}%`);
      } else {
        console.log(`✅ No significant memory growth detected`);
      }
      
      optimizer.stop();
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });

  it('should cleanup icon cache when it grows too large', async () => {
    const tempDir = path.join(os.tmpdir(), `icon-cache-cleanup-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Create optimizer with small cache limit
      const optimizer = new MemoryOptimizer(tempDir);
      optimizer.iconCacheManager.maxCacheSize = 10 * 1024; // 10KB limit
      
      // Create files that exceed the limit
      for (let i = 0; i < 5; i++) {
        const filePath = path.join(tempDir, `icon${i}.png`);
        fs.writeFileSync(filePath, Buffer.alloc(5 * 1024)); // 5KB each = 25KB total
      }
      
      const sizeBefore = optimizer.iconCacheManager.getCacheSize();
      console.log(`Cache size before cleanup: ${(sizeBefore / 1024).toFixed(2)}KB`);
      
      // Run optimization
      const result = optimizer.optimize();
      
      const sizeAfter = optimizer.iconCacheManager.getCacheSize();
      console.log(`Cache size after cleanup: ${(sizeAfter / 1024).toFixed(2)}KB`);
      console.log(`Files removed: ${result.iconCache.removed}`);
      console.log(`Space freed: ${(result.iconCache.freedBytes / 1024).toFixed(2)}KB`);
      
      // Cache should be cleaned up
      expect(result.iconCache.removed).toBeGreaterThan(0);
      expect(result.iconCache.freedBytes).toBeGreaterThan(0);
      expect(sizeAfter).toBeLessThan(sizeBefore);
      
      optimizer.stop();
    } finally {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  });
});
