/**
 * Startup Optimization Module
 * Provides utilities for measuring and optimizing application startup time
 */

class StartupTimer {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
    this.startTime = Date.now();
    this.mark('app-start');
  }

  mark(name) {
    const timestamp = Date.now();
    this.marks.set(name, timestamp);
    return timestamp;
  }

  measure(name, startMark, endMark = null) {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : Date.now();
    
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return null;
    }

    const duration = endTime - startTime;
    this.measures.set(name, duration);
    return duration;
  }

  getMeasure(name) {
    return this.measures.get(name);
  }

  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  report() {
    const totalTime = this.getElapsedTime();
    console.log('\n=== Startup Performance Report ===');
    console.log(`Total startup time: ${totalTime}ms`);
    console.log('\nDetailed timings:');
    
    for (const [name, duration] of this.measures.entries()) {
      const percentage = ((duration / totalTime) * 100).toFixed(1);
      console.log(`  ${name}: ${duration}ms (${percentage}%)`);
    }
    
    console.log('===================================\n');
    
    return {
      totalTime,
      measures: Object.fromEntries(this.measures),
      marks: Object.fromEntries(this.marks)
    };
  }
}

/**
 * Lazy loader for non-critical modules
 */
class LazyModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loading = new Map();
  }

  /**
   * Register a module for lazy loading
   * @param {string} name - Module name
   * @param {Function} loader - Function that returns a promise resolving to the module
   */
  register(name, loader) {
    this.modules.set(name, loader);
  }

  /**
   * Load a module lazily
   * @param {string} name - Module name
   * @returns {Promise} Promise resolving to the loaded module
   */
  async load(name) {
    // Return cached module if already loaded
    if (this.modules.has(name) && typeof this.modules.get(name) !== 'function') {
      return this.modules.get(name);
    }

    // Return existing loading promise if already loading
    if (this.loading.has(name)) {
      return this.loading.get(name);
    }

    // Start loading
    const loader = this.modules.get(name);
    if (!loader) {
      throw new Error(`Module "${name}" not registered`);
    }

    const loadingPromise = loader().then(module => {
      this.modules.set(name, module);
      this.loading.delete(name);
      return module;
    });

    this.loading.set(name, loadingPromise);
    return loadingPromise;
  }

  /**
   * Check if a module is loaded
   * @param {string} name - Module name
   * @returns {boolean}
   */
  isLoaded(name) {
    const module = this.modules.get(name);
    return module && typeof module !== 'function';
  }
}

/**
 * Config cache for faster subsequent loads
 */
class ConfigCache {
  constructor() {
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 5000; // 5 seconds
  }

  set(config) {
    this.cache = config;
    this.cacheTime = Date.now();
  }

  get() {
    if (!this.cache || !this.cacheTime) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - this.cacheTime > this.cacheDuration) {
      this.cache = null;
      this.cacheTime = null;
      return null;
    }

    return this.cache;
  }

  clear() {
    this.cache = null;
    this.cacheTime = null;
  }

  isValid() {
    return this.cache !== null && this.cacheTime !== null &&
           (Date.now() - this.cacheTime <= this.cacheDuration);
  }
}

/**
 * Deferred initialization manager
 * Allows deferring non-critical initialization tasks
 */
class DeferredInitializer {
  constructor() {
    this.tasks = [];
    this.initialized = false;
  }

  /**
   * Add a task to be executed after initial startup
   * @param {string} name - Task name
   * @param {Function} task - Task function
   * @param {number} delay - Delay in ms before executing (default: 0)
   */
  defer(name, task, delay = 0) {
    this.tasks.push({ name, task, delay });
  }

  /**
   * Execute all deferred tasks
   */
  async executeAll() {
    if (this.initialized) {
      console.warn('Deferred tasks already executed');
      return;
    }

    this.initialized = true;
    console.log(`Executing ${this.tasks.length} deferred tasks...`);

    for (const { name, task, delay } of this.tasks) {
      if (delay > 0) {
        setTimeout(async () => {
          try {
            console.log(`Executing deferred task: ${name}`);
            await task();
          } catch (err) {
            console.error(`Deferred task "${name}" failed:`, err);
          }
        }, delay);
      } else {
        try {
          console.log(`Executing deferred task: ${name}`);
          await task();
        } catch (err) {
          console.error(`Deferred task "${name}" failed:`, err);
        }
      }
    }
  }
}

export {
  StartupTimer,
  LazyModuleLoader,
  ConfigCache,
  DeferredInitializer
};
