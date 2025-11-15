import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StartupTimer, LazyModuleLoader, ConfigCache, DeferredInitializer } from './startupOptimization.js';

describe('StartupTimer', () => {
  let timer;

  beforeEach(() => {
    timer = new StartupTimer();
  });

  it('should create marks', () => {
    const timestamp = timer.mark('test-mark');
    expect(timestamp).toBeGreaterThan(0);
    expect(timer.marks.has('test-mark')).toBe(true);
  });

  it('should measure duration between marks', () => {
    timer.mark('start');
    // Small delay
    const delay = 10;
    const start = Date.now();
    while (Date.now() - start < delay) {
      // busy wait
    }
    timer.mark('end');
    
    const duration = timer.measure('test-measure', 'start', 'end');
    expect(duration).toBeGreaterThanOrEqual(delay);
  });

  it('should get elapsed time', () => {
    const elapsed = timer.getElapsedTime();
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });

  it('should generate report', () => {
    timer.mark('start');
    timer.mark('end');
    timer.measure('test', 'start', 'end');
    
    const report = timer.report();
    expect(report).toHaveProperty('totalTime');
    expect(report).toHaveProperty('measures');
    expect(report.measures).toHaveProperty('test');
  });
});

describe('LazyModuleLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new LazyModuleLoader();
  });

  it('should register modules', () => {
    const mockLoader = vi.fn(() => Promise.resolve({ test: 'module' }));
    loader.register('test-module', mockLoader);
    
    expect(loader.modules.has('test-module')).toBe(true);
  });

  it('should load modules lazily', async () => {
    const mockModule = { test: 'module' };
    const mockLoader = vi.fn(() => Promise.resolve(mockModule));
    
    loader.register('test-module', mockLoader);
    const loadedModule = await loader.load('test-module');
    
    expect(mockLoader).toHaveBeenCalledTimes(1);
    expect(loadedModule).toEqual(mockModule);
  });

  it('should cache loaded modules', async () => {
    const mockModule = { test: 'module' };
    const mockLoader = vi.fn(() => Promise.resolve(mockModule));
    
    loader.register('test-module', mockLoader);
    
    // Load twice
    await loader.load('test-module');
    await loader.load('test-module');
    
    // Loader should only be called once
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it('should check if module is loaded', async () => {
    const mockModule = { test: 'module' };
    loader.register('test-module', () => Promise.resolve(mockModule));
    
    expect(loader.isLoaded('test-module')).toBe(false);
    
    await loader.load('test-module');
    
    expect(loader.isLoaded('test-module')).toBe(true);
  });

  it('should throw error for unregistered module', async () => {
    await expect(loader.load('non-existent')).rejects.toThrow('Module "non-existent" not registered');
  });
});

describe('ConfigCache', () => {
  let cache;

  beforeEach(() => {
    cache = new ConfigCache();
  });

  it('should store and retrieve config', () => {
    const config = { test: 'config' };
    cache.set(config);
    
    const retrieved = cache.get();
    expect(retrieved).toEqual(config);
  });

  it('should return null for expired cache', () => {
    const config = { test: 'config' };
    cache.set(config);
    
    // Manually expire cache
    cache.cacheTime = Date.now() - 10000; // 10 seconds ago
    
    const retrieved = cache.get();
    expect(retrieved).toBeNull();
  });

  it('should clear cache', () => {
    const config = { test: 'config' };
    cache.set(config);
    
    cache.clear();
    
    expect(cache.get()).toBeNull();
  });

  it('should check cache validity', () => {
    expect(cache.isValid()).toBe(false);
    
    const config = { test: 'config' };
    cache.set(config);
    
    expect(cache.isValid()).toBe(true);
    
    // Manually expire
    cache.cacheTime = Date.now() - 10000;
    
    expect(cache.isValid()).toBe(false);
  });
});

describe('DeferredInitializer', () => {
  let initializer;

  beforeEach(() => {
    initializer = new DeferredInitializer();
  });

  it('should defer tasks', () => {
    const task = vi.fn();
    initializer.defer('test-task', task);
    
    expect(initializer.tasks).toHaveLength(1);
    expect(task).not.toHaveBeenCalled();
  });

  it('should execute deferred tasks', async () => {
    const task = vi.fn();
    initializer.defer('test-task', task);
    
    await initializer.executeAll();
    
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('should execute tasks with delay', async () => {
    const task = vi.fn();
    initializer.defer('test-task', task, 50);
    
    await initializer.executeAll();
    
    // Task should not be called immediately
    expect(task).not.toHaveBeenCalled();
    
    // Wait for delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('should handle task errors gracefully', async () => {
    const errorTask = vi.fn(() => {
      throw new Error('Task error');
    });
    const normalTask = vi.fn();
    
    initializer.defer('error-task', errorTask);
    initializer.defer('normal-task', normalTask);
    
    // Should not throw
    await expect(initializer.executeAll()).resolves.toBeUndefined();
    
    expect(errorTask).toHaveBeenCalled();
    expect(normalTask).toHaveBeenCalled();
  });

  it('should not execute tasks twice', async () => {
    const task = vi.fn();
    initializer.defer('test-task', task);
    
    await initializer.executeAll();
    await initializer.executeAll();
    
    // Task should only be called once
    expect(task).toHaveBeenCalledTimes(1);
  });
});
