/**
 * Integration tests for Overlay auto-close behavior
 * 
 * Tests that the Overlay component properly responds to open-action-executed events
 * and automatically hides the overlay when an Open action is executed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Overlay from './Overlay';

// Mock dependencies
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getConfig: vi.fn().mockResolvedValue({
      version: '1.0',
      ui: {
        window: { theme: 'dark' },
        summon: { hotkeys: ['F11'] }
      },
      profiles: [{
        name: 'Test Profile',
        pages: [{
          name: 'Test Page',
          rows: 3,
          cols: 3,
          buttons: []
        }]
      }]
    }),
    hideOverlay: vi.fn().mockResolvedValue(undefined),
    getCurrentProfile: vi.fn().mockResolvedValue({
      name: 'Test Profile',
      index: 0
    }),
    getCurrentPage: vi.fn().mockResolvedValue({
      name: 'Test Page',
      index: 0
    }),
    getNavigationContext: vi.fn().mockResolvedValue({
      profile_index: 0,
      page_index: 0,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false
    }),
  },
}));

vi.mock('../hooks/useProfileStoreInit', () => ({
  useProfileStoreInit: vi.fn(),
}));

vi.mock('../store/profileStore', () => ({
  useProfileStore: vi.fn((selector) => {
    const state = {
      currentProfile: { name: 'Test Profile', index: 0 },
      currentPage: { name: 'Test Page', index: 0 },
      navigationContext: {
        profile_index: 0,
        page_index: 0,
        total_pages: 1,
        has_previous_page: false,
        has_next_page: false
      },
      loading: false,
      error: null,
      nextPage: vi.fn(),
      previousPage: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
  selectCurrentProfile: (state: any) => state.currentProfile,
  selectCurrentPage: (state: any) => state.currentPage,
  selectNavigationContext: (state: any) => state.navigationContext,
  selectLoading: (state: any) => state.loading,
  selectError: (state: any) => state.error,
}));

describe('Overlay Auto-Close on Open Action', () => {
  let mockHideOverlay: any;

  beforeEach(async () => {
    const platformApi = await import('../lib/platform-api');
    mockHideOverlay = platformApi.tauriAPI.hideOverlay as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should hide overlay when open-action-executed event is dispatched', async () => {
    render(<Overlay />);

    // Wait for component to load
    await waitFor(() => {
      expect(mockHideOverlay).not.toHaveBeenCalled();
    });

    // Dispatch the open-action-executed event
    const event = new CustomEvent('open-action-executed', {
      detail: {
        actionType: 'Open',
        label: 'Test File'
      }
    });
    window.dispatchEvent(event);

    // Wait for the overlay to hide (with 100ms delay)
    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalledTimes(1);
    }, { timeout: 300 });
  });

  it('should handle multiple open-action-executed events', async () => {
    render(<Overlay />);

    // Dispatch first event
    window.dispatchEvent(new CustomEvent('open-action-executed', {
      detail: { actionType: 'Open', label: 'File 1' }
    }));

    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalledTimes(1);
    }, { timeout: 300 });

    // Dispatch second event
    window.dispatchEvent(new CustomEvent('open-action-executed', {
      detail: { actionType: 'Open', label: 'File 2' }
    }));

    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalledTimes(2);
    }, { timeout: 300 });
  });
});
