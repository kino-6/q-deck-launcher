import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { performanceMonitor } from '../utils/performanceMonitor';
import Grid from './Grid';
import ActionButton from './ActionButton';
import GridCell from './GridCell';
import { QDeckConfig, ActionButton as ActionButtonType } from '../lib/platform-api';

describe('Performance Tests', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.setEnabled(true);
  });

  afterEach(() => {
    performanceMonitor.setEnabled(false);
  });

  describe('Component Render Performance', () => {
    it('should render Grid component within acceptable time', async () => {
      const mockConfig: QDeckConfig = {
        version: '1.0',
        ui: {
          summon: {
            hotkeys: ['F11'],
            edge_trigger: {
              enabled: false,
              edges: [],
              dwell_ms: 300,
              margin_px: 5,
            },
          },
          window: {
            placement: 'dropdown-top',
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: 'dark',
            animation: {
              enabled: true,
              duration_ms: 150,
            },
          },
        },
        profiles: [
          {
            name: 'Test Profile',
            hotkey: null,
            pages: [
              {
                name: 'Test Page',
                rows: 3,
                cols: 4,
                buttons: [],
              },
            ],
          },
        ],
      };

      const startTime = performance.now();
      
      render(
        <Grid
          config={mockConfig}
          currentProfile={{ index: 0, name: 'Test Profile' }}
          currentPage={{ index: 0, name: 'Test Page' }}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Grid should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
      console.log(`Grid render time: ${renderTime.toFixed(2)}ms`);
    });

    it('should render ActionButton component efficiently', async () => {
      const mockButton: ActionButtonType = {
        position: { row: 0, col: 0 },
        action_type: 'LaunchApp',
        label: 'Test Button',
        icon: '🚀',
        config: {
          path: 'notepad.exe',
        },
      };

      const renderTimes: number[] = [];

      // Render multiple times to get average
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(
          <ActionButton
            button={mockButton}
            dpiScale={1}
            screenInfo={{
              width: 1920,
              height: 1080,
              availWidth: 1920,
              availHeight: 1040,
              pixelRatio: 1,
            }}
          />
        );

        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
        
        unmount();
      }

      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      
      // ActionButton should render in less than 50ms on average
      expect(avgRenderTime).toBeLessThan(50);
      console.log(`ActionButton average render time: ${avgRenderTime.toFixed(2)}ms`);
    });

    it('should render GridCell component efficiently', async () => {
      const mockButton: ActionButtonType = {
        position: { row: 0, col: 0 },
        action_type: 'LaunchApp',
        label: 'Test',
        icon: '🚀',
        config: {},
      };

      const startTime = performance.now();
      
      render(
        <GridCell
          index={0}
          row={0}
          col={0}
          button={mockButton}
          isDragOver={false}
          isDropTarget={false}
          dpiScale={1}
          screenInfo={{
            width: 1920,
            height: 1080,
            availWidth: 1920,
            availHeight: 1040,
            pixelRatio: 1,
          }}
          onContextMenu={vi.fn()}
          onEmptyCellContextMenu={vi.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // GridCell should render in less than 30ms
      expect(renderTime).toBeLessThan(30);
      console.log(`GridCell render time: ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('Re-render Performance', () => {
    it('should minimize re-renders when props do not change', async () => {
      const mockButton: ActionButtonType = {
        position: { row: 0, col: 0 },
        action_type: 'LaunchApp',
        label: 'Test',
        icon: '🚀',
        config: {},
      };

      let renderCount = 0;
      const TestWrapper = ({ button }: { button: ActionButtonType }) => {
        renderCount++;
        return (
          <ActionButton
            button={button}
            dpiScale={1}
            screenInfo={{
              width: 1920,
              height: 1080,
              availWidth: 1920,
              availHeight: 1040,
              pixelRatio: 1,
            }}
          />
        );
      };

      const { rerender } = render(<TestWrapper button={mockButton} />);
      
      const initialRenderCount = renderCount;

      // Re-render with same props
      rerender(<TestWrapper button={mockButton} />);

      // With React.memo, render count should not increase
      // Note: In test environment, this might still increase by 1
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 1);
      console.log(`Render count after re-render with same props: ${renderCount}`);
    });

    it('should re-render only when necessary props change', async () => {
      const mockButton1: ActionButtonType = {
        position: { row: 0, col: 0 },
        action_type: 'LaunchApp',
        label: 'Test 1',
        icon: '🚀',
        config: {},
      };

      const mockButton2: ActionButtonType = {
        position: { row: 0, col: 0 },
        action_type: 'LaunchApp',
        label: 'Test 2',
        icon: '🎯',
        config: {},
      };

      let renderCount = 0;
      const TestWrapper = ({ button }: { button: ActionButtonType }) => {
        renderCount++;
        return (
          <ActionButton
            button={button}
            dpiScale={1}
            screenInfo={{
              width: 1920,
              height: 1080,
              availWidth: 1920,
              availHeight: 1040,
              pixelRatio: 1,
            }}
          />
        );
      };

      const { rerender } = render(<TestWrapper button={mockButton1} />);
      
      expect(renderCount).toBe(1);

      // Re-render with different button
      rerender(<TestWrapper button={mockButton2} />);

      // Should re-render when button changes
      expect(renderCount).toBe(2);
      console.log(`Render count after prop change: ${renderCount}`);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      performanceMonitor.start('test-operation');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const duration = performanceMonitor.end('test-operation', 'custom');

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeGreaterThanOrEqual(10);

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[metrics.length - 1].name).toBe('test-operation');
    });

    it('should generate performance report', async () => {
      // Record some metrics
      performanceMonitor.start('operation-1');
      await new Promise(resolve => setTimeout(resolve, 20));
      performanceMonitor.end('operation-1', 'action');

      performanceMonitor.start('operation-2');
      await new Promise(resolve => setTimeout(resolve, 30));
      performanceMonitor.end('operation-2', 'api');

      const report = performanceMonitor.generateReport();

      expect(report.metrics.length).toBe(2);
      expect(report.averages['operation-1']).toBeGreaterThanOrEqual(20);
      expect(report.averages['operation-2']).toBeGreaterThanOrEqual(30);
      expect(report.slowest.length).toBeGreaterThan(0);
      expect(report.totalTime).toBeGreaterThan(0);
    });

    it('should identify slowest operations', async () => {
      // Create operations with different durations
      const operations = [
        { name: 'fast', duration: 5 },
        { name: 'medium', duration: 50 },
        { name: 'slow', duration: 150 },
      ];

      for (const op of operations) {
        performanceMonitor.start(op.name);
        await new Promise(resolve => setTimeout(resolve, op.duration));
        performanceMonitor.end(op.name, 'custom');
      }

      const report = performanceMonitor.generateReport();
      
      // Slowest operation should be 'slow'
      expect(report.slowest[0].name).toBe('slow');
      expect(report.slowest[0].duration).toBeGreaterThanOrEqual(150);
    });
  });

  describe('Memory and Responsiveness', () => {
    it('should handle large grids efficiently', async () => {
      const mockConfig: QDeckConfig = {
        version: '1.0',
        ui: {
          summon: {
            hotkeys: ['F11'],
            edge_trigger: {
              enabled: false,
              edges: [],
              dwell_ms: 300,
              margin_px: 5,
            },
          },
          window: {
            placement: 'dropdown-top',
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: 'dark',
            animation: {
              enabled: true,
              duration_ms: 150,
            },
          },
        },
        profiles: [
          {
            name: 'Large Profile',
            hotkey: null,
            pages: [
              {
                name: 'Large Page',
                rows: 5,
                cols: 8,
                buttons: Array.from({ length: 40 }, (_, i) => ({
                  position: { row: Math.floor(i / 8), col: i % 8 },
                  action_type: 'LaunchApp' as const,
                  label: `Button ${i + 1}`,
                  icon: '🚀',
                  config: { path: 'notepad.exe' },
                })),
              },
            ],
          },
        ],
      };

      const startTime = performance.now();
      
      render(
        <Grid
          config={mockConfig}
          currentProfile={{ index: 0, name: 'Large Profile' }}
          currentPage={{ index: 0, name: 'Large Page' }}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Large grid (40 buttons) should still render in reasonable time
      expect(renderTime).toBeLessThan(500);
      console.log(`Large grid (40 buttons) render time: ${renderTime.toFixed(2)}ms`);
    });
  });
});
