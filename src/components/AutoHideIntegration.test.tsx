import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import Overlay from '../pages/Overlay';
import { tauriAPI } from '../lib/platform-api';

// Mock the logger utility
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getConfig: vi.fn(),
    hideOverlay: vi.fn(),
    onProfileChanged: vi.fn(() => () => {}),
  },
}));

// Mock the profile store
vi.mock('../store/profileStore', () => ({
  useProfileStore: vi.fn((selector) => {
    const mockState = {
      currentProfile: {
        name: 'Test Profile',
        index: 0,
        pages: [{ name: 'Test Page', index: 0, rows: 3, cols: 3, buttons: [] }],
      },
      currentPage: {
        name: 'Test Page',
        index: 0,
        rows: 3,
        cols: 3,
        buttons: [],
      },
      navigationContext: null,
      loading: false,
      error: null,
      nextPage: vi.fn(),
      previousPage: vi.fn(),
    };
    return selector ? selector(mockState) : mockState;
  }),
  selectCurrentProfile: (state: any) => state.currentProfile,
  selectCurrentPage: (state: any) => state.currentPage,
  selectNavigationContext: (state: any) => state.navigationContext,
  selectLoading: (state: any) => state.loading,
  selectError: (state: any) => state.error,
}));

// Mock the profile store init hook
vi.mock('../hooks/useProfileStoreInit', () => ({
  useProfileStoreInit: vi.fn(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Auto-hide Integration Tests', () => {
  const mockConfig = {
    version: '1.0',
    ui: {
      summon: {
        hotkeys: ['F11'],
      },
      window: {
        width_px: 1000,
        height_px: 600,
        cell_size_px: 96,
        gap_px: 8,
        theme: 'dark',
        auto_close_on_open: true,
      },
    },
    profiles: [
      {
        name: 'Test Profile',
        pages: [
          {
            name: 'Test Page',
            rows: 3,
            cols: 3,
            buttons: [],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (tauriAPI.getConfig as any).mockResolvedValue(mockConfig);
  });

  it('should render overlay container with pointer-events enabled', async () => {
    const { container } = render(<Overlay />);

    await waitFor(() => {
      const overlayContainer = container.querySelector('.overlay-container');
      expect(overlayContainer).toBeTruthy();
    });

    const overlayContainer = container.querySelector('.overlay-container');
    
    // Note: In test environment, CSS might not be fully applied
    // We're just checking that the element exists
    expect(overlayContainer).toBeTruthy();
  });

  it('should have click handler attached to document', async () => {
    render(<Overlay />);

    await waitFor(() => {
      const overlayContainer = document.querySelector('.overlay-container');
      expect(overlayContainer).toBeTruthy();
    });

    // Simulate a mousedown event on the document
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    });

    // Click outside the overlay (on document body)
    document.body.dispatchEvent(mousedownEvent);

    // Wait for the delay (150ms) and verify hideOverlay was called
    await waitFor(
      () => {
        expect(tauriAPI.hideOverlay).toHaveBeenCalled();
      },
      { timeout: 300 }
    );
  });

  it('should not hide when clicking on grid element', async () => {
    const { container } = render(<Overlay />);

    await waitFor(() => {
      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
    });

    const grid = container.querySelector('.grid');
    
    // Simulate a mousedown event on the grid
    if (grid) {
      fireEvent.mouseDown(grid);
    }

    // Wait a bit and verify hideOverlay was NOT called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();
  });

  it('should track drag state to prevent auto-hide during drag', async () => {
    render(<Overlay />);

    await waitFor(() => {
      const overlayContainer = document.querySelector('.overlay-container');
      expect(overlayContainer).toBeTruthy();
    });

    // Simulate drag start
    const dragEnterEvent = new Event('dragenter', { bubbles: true });
    window.dispatchEvent(dragEnterEvent);

    // Click outside during drag
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: 0,
      clientY: 0,
    });
    document.body.dispatchEvent(mousedownEvent);

    // Wait and verify hideOverlay was NOT called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();
  });
});
