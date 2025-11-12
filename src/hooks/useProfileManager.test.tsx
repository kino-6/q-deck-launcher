/**
 * useProfileManager Hook Tests
 * 
 * Tests for the profile management custom hook.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProfileManager } from './useProfileManager';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getProfiles: vi.fn(),
    getCurrentProfile: vi.fn(),
    getCurrentProfilePages: vi.fn(),
    getCurrentPage: vi.fn(),
    getNavigationContext: vi.fn(),
    switchToProfile: vi.fn(),
    switchToProfileByName: vi.fn(),
    switchToPage: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    onProfileChanged: vi.fn(),
  },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useProfileManager', () => {
  const mockProfiles = [
    { index: 0, name: 'Default', page_count: 1, hotkey: null },
    { index: 1, name: 'Development', page_count: 2, hotkey: 'Ctrl+1' },
    { index: 2, name: 'Gaming', page_count: 1, hotkey: 'Ctrl+2' },
  ];

  const mockCurrentProfile = {
    index: 0,
    name: 'Default',
    page_count: 1,
    current_page_index: 0,
    hotkey: null,
  };

  const mockCurrentPage = {
    index: 0,
    name: 'Main',
    rows: 4,
    cols: 6,
    button_count: 4,
  };

  const mockPages = [mockCurrentPage];

  const mockNavContext = {
    profile_name: 'Default',
    profile_index: 0,
    page_name: 'Main',
    page_index: 0,
    total_profiles: 3,
    total_pages: 1,
    has_previous_page: false,
    has_next_page: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock responses
    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
    vi.mocked(tauriAPI.onProfileChanged).mockReturnValue(undefined);
  });

  it('should load initial data on mount', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify data is loaded
    expect(result.current.profiles).toEqual(mockProfiles);
    expect(result.current.currentProfile).toEqual(mockCurrentProfile);
    expect(result.current.currentPage).toEqual(mockCurrentPage);
    expect(result.current.currentPages).toEqual(mockPages);
    expect(result.current.navigationContext).toEqual(mockNavContext);
    expect(result.current.error).toBeNull();
  });

  it('should not auto-load when autoLoad is false', async () => {
    const { result } = renderHook(() => useProfileManager({ autoLoad: false }));

    // Should not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.profiles).toEqual([]);
    expect(result.current.currentProfile).toBeNull();
  });

  it('should switch to profile by index', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock profile switch
    const newProfile = {
      index: 1,
      name: 'Development',
      page_count: 2,
      current_page_index: 0,
      hotkey: 'Ctrl+1',
    };
    const newPage = { index: 0, name: 'Code', rows: 4, cols: 6, button_count: 5 };
    const newPages = [newPage, { index: 1, name: 'Tools', rows: 4, cols: 6, button_count: 3 }];
    const newNavContext = {
      ...mockNavContext,
      profile_name: 'Development',
      profile_index: 1,
      page_name: 'Code',
      total_pages: 2,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(newProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(newPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(newPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(newNavContext);

    // Switch profile
    let switchResult;
    await act(async () => {
      switchResult = await result.current.switchToProfile(1);
    });

    // Verify switch was called
    expect(tauriAPI.switchToProfile).toHaveBeenCalledWith(1);
    expect(switchResult).toEqual(newProfile);

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.currentProfile).toEqual(newProfile);
    });
  });

  it('should switch to profile by name', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock profile switch
    const newProfile = {
      index: 1,
      name: 'Development',
      page_count: 2,
      current_page_index: 0,
      hotkey: 'Ctrl+1',
    };

    vi.mocked(tauriAPI.switchToProfileByName).mockResolvedValue(newProfile);

    // Switch profile
    let switchResult;
    await act(async () => {
      switchResult = await result.current.switchToProfileByName('Development');
    });

    // Verify switch was called
    expect(tauriAPI.switchToProfileByName).toHaveBeenCalledWith('Development');
    expect(switchResult).toEqual(newProfile);
  });

  it('should navigate to next page', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock page navigation
    const newPage = { index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 };
    vi.mocked(tauriAPI.nextPage).mockResolvedValue(newPage);

    // Navigate to next page
    let navResult;
    await act(async () => {
      navResult = await result.current.nextPage();
    });

    // Verify navigation was called
    expect(tauriAPI.nextPage).toHaveBeenCalled();
    expect(navResult).toEqual(newPage);

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.currentPage).toEqual(newPage);
    });
  });

  it('should navigate to previous page', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock page navigation
    const newPage = { index: 0, name: 'Page 1', rows: 4, cols: 6, button_count: 4 };
    vi.mocked(tauriAPI.previousPage).mockResolvedValue(newPage);

    // Navigate to previous page
    let navResult;
    await act(async () => {
      navResult = await result.current.previousPage();
    });

    // Verify navigation was called
    expect(tauriAPI.previousPage).toHaveBeenCalled();
    expect(navResult).toEqual(newPage);
  });

  it('should switch to specific page', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock page switch
    const newPage = { index: 2, name: 'Page 3', rows: 4, cols: 6, button_count: 2 };
    vi.mocked(tauriAPI.switchToPage).mockResolvedValue(newPage);

    // Switch to page
    let switchResult;
    await act(async () => {
      switchResult = await result.current.switchToPage(2);
    });

    // Verify switch was called
    expect(tauriAPI.switchToPage).toHaveBeenCalledWith(2);
    expect(switchResult).toEqual(newPage);

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.currentPage).toEqual(newPage);
    });
  });

  it('should call onProfileChange callback', async () => {
    const onProfileChange = vi.fn();
    const { result } = renderHook(() => useProfileManager({ onProfileChange }));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock profile switch
    const newProfile = {
      index: 1,
      name: 'Development',
      page_count: 2,
      current_page_index: 0,
      hotkey: 'Ctrl+1',
    };
    vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(newProfile);

    // Clear previous calls
    onProfileChange.mockClear();

    // Switch profile
    await act(async () => {
      await result.current.switchToProfile(1);
    });

    // Verify callback was called with new profile
    await waitFor(() => {
      expect(onProfileChange).toHaveBeenCalledWith(newProfile);
    });
  });

  it('should call onPageChange callback', async () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(() => useProfileManager({ onPageChange }));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock page navigation
    const newPage = { index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 };
    vi.mocked(tauriAPI.nextPage).mockResolvedValue(newPage);

    // Clear previous calls
    onPageChange.mockClear();

    // Navigate to next page
    await act(async () => {
      await result.current.nextPage();
    });

    // Verify callback was called with new page
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(newPage);
    });
  });

  it('should handle errors gracefully', async () => {
    const onError = vi.fn();
    
    // Mock API to throw error
    vi.mocked(tauriAPI.getProfiles).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProfileManager({ onError }));

    // Wait for error
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toContain('Network error');
    expect(onError).toHaveBeenCalled();
  });

  it('should refresh all data', async () => {
    const { result } = renderHook(() => useProfileManager({ autoLoad: false }));

    // Initially no data
    expect(result.current.profiles).toEqual([]);

    // Refresh all
    await act(async () => {
      await result.current.refreshAll();
    });

    // Verify data is loaded
    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.currentProfile).toEqual(mockCurrentProfile);
    });
  });

  it('should refresh individual data sources', async () => {
    const { result } = renderHook(() => useProfileManager());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock calls
    vi.clearAllMocks();

    // Refresh profiles
    await act(async () => {
      await result.current.refreshProfiles();
    });
    expect(tauriAPI.getProfiles).toHaveBeenCalled();

    // Refresh current profile
    await act(async () => {
      await result.current.refreshCurrentProfile();
    });
    expect(tauriAPI.getCurrentProfile).toHaveBeenCalled();

    // Refresh current page
    await act(async () => {
      await result.current.refreshCurrentPage();
    });
    expect(tauriAPI.getCurrentPage).toHaveBeenCalled();
    expect(tauriAPI.getCurrentProfilePages).toHaveBeenCalled();

    // Refresh navigation context
    await act(async () => {
      await result.current.refreshNavigationContext();
    });
    expect(tauriAPI.getNavigationContext).toHaveBeenCalled();
  });
});
