import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Grid } from './Grid';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    getConfig: vi.fn(),
    getCurrentProfile: vi.fn(),
    getCurrentPage: vi.fn(),
    onFileDrop: vi.fn(),
    onProfileChanged: vi.fn(),
    setDragState: vi.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Grid - Page Navigation', () => {
  const mockConfig = {
    version: '1.0',
    ui: {
      window: {
        width_px: 1000,
        height_px: 600,
        cell_size_px: 96,
        gap_px: 8,
      },
    },
    profiles: [
      {
        name: 'Test Profile',
        pages: [
          {
            name: 'Page 1',
            rows: 3,
            cols: 4,
            buttons: [],
          },
          {
            name: 'Page 2',
            rows: 3,
            cols: 4,
            buttons: [],
          },
          {
            name: 'Page 3',
            rows: 3,
            cols: 4,
            buttons: [],
          },
        ],
      },
    ],
  };

  const mockCurrentProfile = {
    index: 0,
    name: 'Test Profile',
    page_count: 3,
    current_page_index: 0,
  };

  const mockCurrentPage = {
    index: 0,
    name: 'Page 1',
    rows: 3,
    cols: 4,
    button_count: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to next page when ArrowRight is pressed', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to previous page when ArrowLeft is pressed', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    mockPreviousPage.mockResolvedValue({ index: 0, name: 'Page 1' });

    const currentPage = { ...mockCurrentPage, index: 1, name: 'Page 2' };

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={currentPage}
      />
    );

    // Simulate ArrowLeft key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to next page when PageDown is pressed', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Simulate PageDown key press
    const event = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to previous page when PageUp is pressed', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    mockPreviousPage.mockResolvedValue({ index: 0, name: 'Page 1' });

    const currentPage = { ...mockCurrentPage, index: 1, name: 'Page 2' };

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={currentPage}
      />
    );

    // Simulate PageUp key press
    const event = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should not navigate when at first page and ArrowLeft is pressed', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    mockPreviousPage.mockResolvedValue(null); // Already at first page

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Simulate ArrowLeft key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    });

    // Should handle null response gracefully
  });

  it('should not navigate when at last page and ArrowRight is pressed', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue(null); // Already at last page

    const currentPage = { ...mockCurrentPage, index: 2, name: 'Page 3' };

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={currentPage}
      />
    );

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });

    // Should handle null response gracefully
  });
});
