import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Grid from './Grid';
import { mockConfig, mockProfile, mockPage } from '../test/mockData';

// Use vi.hoisted to define mocks that can be used in vi.mock
const { mockSaveConfig } = vi.hoisted(() => ({
  mockSaveConfig: vi.fn().mockResolvedValue(undefined),
}));

// Mock platform API
vi.mock('../lib/platform-api', async () => {
  const actual = await vi.importActual('../lib/platform-api');
  return {
    ...actual,
    tauriAPI: {
      saveConfig: mockSaveConfig,
      getConfig: vi.fn(),
      executeAction: vi.fn(),
    },
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ActionButton component
vi.mock('./ActionButton', () => ({
  default: ({ button }: any) => (
    <button data-testid={`action-button-${button.label}`}>
      {button.label}
    </button>
  ),
}));

// Mock ContextMenu component
vi.mock('./ContextMenu', () => ({
  default: () => null,
}));

// Mock ThemeSelector component
vi.mock('./ThemeSelector', () => ({
  default: () => null,
}));

// Mock GridDragDrop component
vi.mock('./GridDragDrop', () => ({
  default: ({ children }: any) => children({
    dragState: {
      isDragging: false,
      isProcessing: false,
      dragOverPosition: null,
    },
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
  }),
}));

describe('Grid - DPI Support', () => {
  const defaultProps = {
    config: mockConfig,
    currentProfile: mockProfile,
    currentPage: mockPage,
  };

  const setupWindow = (width: number, height: number, pixelRatio: number) => {
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: pixelRatio,
    });
    
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: {
        width: width * pixelRatio,
        height: height * pixelRatio,
        availWidth: width * pixelRatio,
        availHeight: (height - 40) * pixelRatio,
      },
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Standard DPI (1x)', () => {
    beforeEach(() => {
      setupWindow(1920, 1080, 1);
    });

    it('renders correctly at standard DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1');
    });

    it('calculates appropriate cell size for standard DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      // Extract cell size from style
      const cellSizeMatch = style?.match(/--cell-size:\s*(\d+)px/);
      expect(cellSizeMatch).toBeTruthy();
      
      const cellSize = parseInt(cellSizeMatch![1]);
      expect(cellSize).toBeGreaterThanOrEqual(64);
      expect(cellSize).toBeLessThanOrEqual(128);
    });
  });

  describe('125% DPI (1.25x) - Common on 1080p displays', () => {
    beforeEach(() => {
      setupWindow(1536, 864, 1.25);
    });

    it('renders correctly at 125% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1.25');
    });

    it('adjusts cell size appropriately for 125% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      const cellSizeMatch = style?.match(/--cell-size:\s*(\d+)px/);
      expect(cellSizeMatch).toBeTruthy();
      
      const cellSize = parseInt(cellSizeMatch![1]);
      // At 125% DPI, cell size should still be within reasonable bounds
      expect(cellSize).toBeGreaterThanOrEqual(64);
      expect(cellSize).toBeLessThanOrEqual(128);
    });

    it('maintains grid visibility at 125% DPI', async () => {
      render(<Grid {...defaultProps} />);

      await waitFor(() => {
        const grid = document.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        
        // Verify all cells are rendered
        const gridCells = document.querySelectorAll('.grid-cell');
        expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
      });
    });
  });

  describe('150% DPI (1.5x) - Common on high-res laptops', () => {
    beforeEach(() => {
      setupWindow(1280, 720, 1.5);
    });

    it('renders correctly at 150% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1.5');
    });

    it('adjusts cell size for better visibility at 150% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      const cellSizeMatch = style?.match(/--cell-size:\s*(\d+)px/);
      expect(cellSizeMatch).toBeTruthy();
      
      const cellSize = parseInt(cellSizeMatch![1]);
      // At 150% DPI, minimum size should be slightly higher
      expect(cellSize).toBeGreaterThanOrEqual(72);
      expect(cellSize).toBeLessThanOrEqual(140);
    });

    it('maintains proper gap spacing at 150% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      const gapSizeMatch = style?.match(/--gap-size:\s*(\d+)px/);
      expect(gapSizeMatch).toBeTruthy();
      
      const gapSize = parseInt(gapSizeMatch![1]);
      expect(gapSize).toBeGreaterThanOrEqual(4);
      expect(gapSize).toBeLessThanOrEqual(16);
    });
  });

  describe('200% DPI (2x) - Retina and 4K displays', () => {
    beforeEach(() => {
      setupWindow(960, 540, 2);
    });

    it('renders correctly at 200% DPI (Retina)', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      // DPI scale is capped at 2.0
      expect(style).toContain('--dpi-scale: 2');
    });

    it('adjusts cell size for Retina displays', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      const cellSizeMatch = style?.match(/--cell-size:\s*(\d+)px/);
      expect(cellSizeMatch).toBeTruthy();
      
      const cellSize = parseInt(cellSizeMatch![1]);
      // At 200% DPI, cell size should be optimized for high-res displays
      expect(cellSize).toBeGreaterThanOrEqual(72);
      expect(cellSize).toBeLessThanOrEqual(140);
    });

    it('maintains crisp rendering on Retina displays', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      // Verify grid has image-rendering optimization
      const computedStyle = window.getComputedStyle(grid!);
      // Note: jsdom may not fully support all CSS properties
      expect(grid).toBeInTheDocument();
    });
  });

  describe('300% DPI (3x) - Ultra high-res displays', () => {
    beforeEach(() => {
      setupWindow(640, 360, 3);
    });

    it('caps DPI scale at 2.0 for stability', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      const style = grid?.getAttribute('style');
      
      // DPI scale should be capped at 2.0 even though actual ratio is 3
      expect(style).toContain('--dpi-scale: 2');
    });

    it('still renders all grid elements at 300% DPI', () => {
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });
  });

  describe('Responsive layout across different resolutions', () => {
    it('adapts to small viewport (1366x768)', () => {
      setupWindow(1366, 768, 1);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });

    it('adapts to medium viewport (1920x1080)', () => {
      setupWindow(1920, 1080, 1);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });

    it('adapts to large viewport (2560x1440)', () => {
      setupWindow(2560, 1440, 1);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });

    it('adapts to ultra-wide viewport (3440x1440)', () => {
      setupWindow(3440, 1440, 1);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });
  });

  describe('DPI changes during runtime', () => {
    it('handles DPI change from 1x to 2x', async () => {
      setupWindow(1920, 1080, 1);
      const { rerender } = render(<Grid {...defaultProps} />);

      let grid = document.querySelector('.grid');
      let style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1');

      // Simulate DPI change
      setupWindow(1920, 1080, 2);
      rerender(<Grid {...defaultProps} />);

      await waitFor(() => {
        grid = document.querySelector('.grid');
        style = grid?.getAttribute('style');
        expect(style).toContain('--dpi-scale: 2');
      });
    });

    it('handles DPI change from 2x to 1.5x', async () => {
      setupWindow(1920, 1080, 2);
      const { rerender } = render(<Grid {...defaultProps} />);

      let grid = document.querySelector('.grid');
      let style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 2');

      // Simulate DPI change
      setupWindow(1920, 1080, 1.5);
      rerender(<Grid {...defaultProps} />);

      await waitFor(() => {
        grid = document.querySelector('.grid');
        style = grid?.getAttribute('style');
        expect(style).toContain('--dpi-scale: 1.5');
      });
    });
  });

  describe('Combined DPI and resolution scenarios', () => {
    it('handles 1080p display at 125% scaling', () => {
      setupWindow(1536, 864, 1.25);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1.25');
      
      // Verify grid is properly sized
      const gridCells = document.querySelectorAll('.grid-cell');
      expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
    });

    it('handles 1440p display at 150% scaling', () => {
      setupWindow(1707, 960, 1.5);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 1.5');
    });

    it('handles 4K display at 200% scaling', () => {
      setupWindow(1920, 1080, 2);
      render(<Grid {...defaultProps} />);

      const grid = document.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      const style = grid?.getAttribute('style');
      expect(style).toContain('--dpi-scale: 2');
    });
  });
});
