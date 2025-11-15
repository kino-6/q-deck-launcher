import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Overlay from '../pages/Overlay';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getConfig: vi.fn(),
    hideOverlay: vi.fn(),
    onProfileChanged: vi.fn(() => () => {}),
  },
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
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
      navigationContext: {
        page_index: 0,
        total_pages: 1,
        has_previous_page: false,
        has_next_page: false,
      },
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

describe('Auto-hide on Focus Loss', () => {
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

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should hide overlay when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Overlay />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Test Profile')).toBeTruthy();
    });

    // Click outside the overlay (on the container background)
    const container = document.querySelector('.overlay-container');
    expect(container).toBeTruthy();
    
    if (container) {
      await user.click(container as HTMLElement);
    }

    // Wait for the delay (150ms) and verify hideOverlay was called
    await waitFor(
      () => {
        expect(tauriAPI.hideOverlay).toHaveBeenCalled();
      },
      { timeout: 300 }
    );
  });

  it('should not hide overlay when clicking on grid', async () => {
    const user = userEvent.setup();
    render(<Overlay />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Test Profile')).toBeTruthy();
    });

    // Click on the grid
    const grid = document.querySelector('.grid');
    expect(grid).toBeTruthy();
    
    if (grid) {
      await user.click(grid as HTMLElement);
    }

    // Wait a bit and verify hideOverlay was NOT called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();
  });

  it('should not hide overlay during drag & drop', async () => {
    const user = userEvent.setup();
    render(<Overlay />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Test Profile')).toBeTruthy();
    });

    // Simulate drag start
    const dragEvent = new Event('dragenter', { bubbles: true });
    window.dispatchEvent(dragEvent);

    // Click outside during drag
    const container = document.querySelector('.overlay-container');
    if (container) {
      await user.click(container as HTMLElement);
    }

    // Wait and verify hideOverlay was NOT called
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();
  });

  it('should add delay before hiding to prevent accidental closes', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<Overlay />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText('Test Profile')).toBeTruthy();
    });

    // Click outside
    const container = document.querySelector('.overlay-container');
    if (container) {
      await user.click(container as HTMLElement);
    }

    // Verify hideOverlay was NOT called immediately
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();

    // Advance timers by 100ms (less than delay)
    vi.advanceTimersByTime(100);
    expect(tauriAPI.hideOverlay).not.toHaveBeenCalled();

    // Advance timers by another 100ms (total 200ms, more than 150ms delay)
    vi.advanceTimersByTime(100);
    
    // Now hideOverlay should have been called
    await waitFor(() => {
      expect(tauriAPI.hideOverlay).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });
});
