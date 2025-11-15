/**
 * Performance monitoring utility for Q-Deck
 * Tracks render times, component updates, and identifies bottlenecks
 */

import { useEffect } from 'react';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'action' | 'api' | 'custom';
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  averages: Record<string, number>;
  slowest: PerformanceMetric[];
  totalTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private enabled: boolean = false;

  constructor() {
    // Enable in development mode
    this.enabled = import.meta.env.DEV || false;
  }

  /**
   * Start measuring a performance metric
   */
  start(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and record the metric
   */
  end(name: string, type: PerformanceMetric['type'] = 'custom'): number {
    if (!this.enabled) return 0;

    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      name,
      duration,
      timestamp: endTime,
      type,
    });

    this.marks.delete(name);
    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetric['type'] = 'custom'
  ): Promise<T> {
    if (!this.enabled) return fn();

    this.start(name);
    try {
      const result = await fn();
      this.end(name, type);
      return result;
    } catch (error) {
      this.end(name, type);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics filtered by type
   */
  getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * Get metrics filtered by name pattern
   */
  getMetricsByName(pattern: string | RegExp): PerformanceMetric[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.metrics.filter(m => regex.test(m.name));
  }

  /**
   * Generate a performance report
   */
  generateReport(): PerformanceReport {
    const metricsByName = new Map<string, number[]>();

    // Group metrics by name
    for (const metric of this.metrics) {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric.duration);
    }

    // Calculate averages
    const averages: Record<string, number> = {};
    for (const [name, durations] of metricsByName.entries()) {
      const sum = durations.reduce((a, b) => a + b, 0);
      averages[name] = sum / durations.length;
    }

    // Find slowest operations
    const slowest = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Calculate total time
    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      metrics: this.metrics,
      averages,
      slowest,
      totalTime,
    };
  }

  /**
   * Print a formatted performance report to console
   */
  printReport(): void {
    if (!this.enabled) {
      console.log('Performance monitoring is disabled');
      return;
    }

    const report = this.generateReport();

    console.group('📊 Performance Report');
    console.log(`Total metrics recorded: ${report.metrics.length}`);
    console.log(`Total time: ${report.totalTime.toFixed(2)}ms`);

    console.group('⏱️ Average Times');
    Object.entries(report.averages)
      .sort(([, a], [, b]) => b - a)
      .forEach(([name, avg]) => {
        const color = avg > 100 ? '🔴' : avg > 50 ? '🟡' : '🟢';
        console.log(`${color} ${name}: ${avg.toFixed(2)}ms`);
      });
    console.groupEnd();

    console.group('🐌 Slowest Operations');
    report.slowest.forEach((metric, i) => {
      console.log(
        `${i + 1}. ${metric.name} (${metric.type}): ${metric.duration.toFixed(2)}ms`
      );
    });
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  if (!performanceMonitor.isEnabled()) return;

  const renderStart = performance.now();

  useEffect(() => {
    const renderEnd = performance.now();
    const duration = renderEnd - renderStart;

    performanceMonitor.getMetrics().push({
      name: `${componentName} render`,
      duration,
      timestamp: renderEnd,
      type: 'render',
    });

    // Warn about slow renders
    if (duration > 16.67) {
      // 60fps threshold
      console.warn(
        `⚠️ Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Decorator for measuring method execution time
 */
export function measurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const name = `${target.constructor.name}.${propertyKey}`;
    return performanceMonitor.measure(name, () => originalMethod.apply(this, args));
  };

  return descriptor;
}
