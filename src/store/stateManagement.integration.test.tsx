import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfileStore } from './profileStore';
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
  },
}));

describe('State Management Integration Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useProfileStore());
    act(() => {
      result.current.reset();
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Store Performance', () => {
    it('should not cause unnecessary re-renders when using selectors', async () => {
      const mockProfiles = [
        { index: 0, name: 'Profile 1', hotkey: null },
        { index: 1, name: 'Profile 2', hotkey: null },
      ];
      const mockCurrentProfile = { index: 0, name: 'Profile 1', hotkey: null };
      const mockPages = [{ index: 0, name: 'Page 1' }];
      const mockCurrentPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 1, has_previous_page: false, has_next_page: false };
      
      vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
      vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      // Track render counts
      let profileRenderCount = 0;
      let pageRenderCount = 0;
      
      const { result: profileResult } = renderHook(() => {
        profileRenderCount++;
        return useProfileStore((state) => state.currentProfile);
      });
      
      const { result: pageResult } = renderHook(() => {
        pageRenderCount++;
        return useProfileStore((state) => state.currentPage);
      });
      
      // Load initial data
      const { result: storeResult } = renderHook(() => useProfileStore());
      await act(async () => {
        await storeResult.current.loadInitialData();
      });
      
      await waitFor(() => {
        expect(storeResult.current.loading).toBe(false);
      });
      
      // Both hooks should have rendered initially
      expect(profileRenderCount).toBeGreaterThan(0);
      expect(pageRenderCount).toBeGreaterThan(0);
      
      const initialProfileRenderCount = profileRenderCount;
      const initialPageRenderCount = pageRenderCount;
      
      // Update only the page - profile hook should not re-render
      const newPage = { index: 1, name: 'Page 2' };
      act(() => {
        storeResult.current.setCurrentPage(newPage);
      });
      
      // Page hook should re-render, but profile hook should not
      expect(pageRenderCount).toBeGreaterThan(initialPageRenderCount);
      expect(profileRenderCount).toBe(initialProfileRenderCount);
    });

    it('should handle concurrent state updates correctly', async () => {
      const mockProfile1 = { index: 0, name: 'Profile 1', hotkey: null };
      const mockProfile2 = { index: 1, name: 'Profile 2', hotkey: null };
      const mockPage1 = { index: 0, name: 'Page 1' };
      const mockPage2 = { index: 1, name: 'Page 2' };
      const mockNavContext = { page_index: 0, total_pages: 2, has_previous_page: false, has_next_page: true };
      
      vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(mockProfile2);
      vi.mocked(tauriAPI.switchToPage).mockResolvedValue(mockPage2);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockPage2);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([mockPage1, mockPage2]);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      // Set initial state
      act(() => {
        result.current.setCurrentProfile(mockProfile1);
        result.current.setCurrentPage(mockPage1);
      });
      
      // Perform concurrent updates
      await act(async () => {
        await Promise.all([
          result.current.switchToProfile(1),
          result.current.switchToPage(1),
        ]);
      });
      
      // Both updates should complete successfully
      expect(result.current.currentProfile).toEqual(mockProfile2);
      expect(result.current.currentPage).toEqual(mockPage2);
    });
  });

  describe('Memory Management', () => {
    it('should properly clean up state on reset', () => {
      const { result } = renderHook(() => useProfileStore());
      
      // Set complex state
      act(() => {
        result.current.setProfiles([
          { index: 0, name: 'Profile 1', hotkey: null },
          { index: 1, name: 'Profile 2', hotkey: null },
        ]);
        result.current.setCurrentProfile({ index: 0, name: 'Profile 1', hotkey: null });
        result.current.setCurrentPages([
          { index: 0, name: 'Page 1' },
          { index: 1, name: 'Page 2' },
        ]);
        result.current.setCurrentPage({ index: 0, name: 'Page 1' });
        result.current.setNavigationContext({
          page_index: 0,
          total_pages: 2,
          has_previous_page: false,
          has_next_page: true,
        });
        result.current.setLoading(true);
        result.current.setError('Test error');
      });
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      // All state should be cleared
      expect(result.current.profiles).toEqual([]);
      expect(result.current.currentProfile).toBeNull();
      expect(result.current.currentPages).toEqual([]);
      expect(result.current.currentPage).toBeNull();
      expect(result.current.navigationContext).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully without breaking state', async () => {
      const mockProfiles = [{ index: 0, name: 'Profile 1', hotkey: null }];
      
      vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
      vi.mocked(tauriAPI.getCurrentProfile).mockRejectedValue(new Error('Network error'));
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([]);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(null);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(null);
      
      const { result } = renderHook(() => useProfileStore());
      
      await act(async () => {
        await result.current.loadInitialData();
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Error should be set
      expect(result.current.error).toBeTruthy();
      
      // But other operations should still work
      act(() => {
        result.current.setProfiles(mockProfiles);
      });
      
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    it('should clear error on successful operation after failure', async () => {
      const mockProfile = { index: 0, name: 'Profile 1', hotkey: null };
      const mockPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 1, has_previous_page: false, has_next_page: false };
      
      // First call fails
      vi.mocked(tauriAPI.switchToProfile).mockRejectedValueOnce(new Error('Failed'));
      
      const { result } = renderHook(() => useProfileStore());
      
      // First attempt fails
      await act(async () => {
        await result.current.switchToProfile(0);
      });
      
      expect(result.current.error).toBeTruthy();
      
      // Second call succeeds
      vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(mockProfile);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([mockPage]);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      await act(async () => {
        await result.current.switchToProfile(0);
      });
      
      // Error should be cleared
      expect(result.current.error).toBeNull();
      expect(result.current.currentProfile).toEqual(mockProfile);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state across profile and page changes', async () => {
      const mockProfile = { index: 1, name: 'Profile 2', hotkey: null };
      const mockPages = [
        { index: 0, name: 'Page 1' },
        { index: 1, name: 'Page 2' },
      ];
      const mockCurrentPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 2, has_previous_page: false, has_next_page: true };
      
      vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(mockProfile);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      await act(async () => {
        await result.current.switchToProfile(1);
      });
      
      // All related state should be updated
      expect(result.current.currentProfile).toEqual(mockProfile);
      expect(result.current.currentPages).toEqual(mockPages);
      expect(result.current.currentPage).toEqual(mockCurrentPage);
      expect(result.current.navigationContext).toEqual(mockNavContext);
    });
  });
});
