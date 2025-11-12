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
  },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('profileStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useProfileStore());
    act(() => {
      result.current.reset();
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useProfileStore());
      
      expect(result.current.profiles).toEqual([]);
      expect(result.current.currentProfile).toBeNull();
      expect(result.current.currentPages).toEqual([]);
      expect(result.current.currentPage).toBeNull();
      expect(result.current.navigationContext).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Synchronous Setters', () => {
    it('should set profiles', () => {
      const { result } = renderHook(() => useProfileStore());
      const mockProfiles = [
        { index: 0, name: 'Profile 1', hotkey: null },
        { index: 1, name: 'Profile 2', hotkey: null },
      ];
      
      act(() => {
        result.current.setProfiles(mockProfiles);
      });
      
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    it('should set current profile', () => {
      const { result } = renderHook(() => useProfileStore());
      const mockProfile = { index: 0, name: 'Profile 1', hotkey: null };
      
      act(() => {
        result.current.setCurrentProfile(mockProfile);
      });
      
      expect(result.current.currentProfile).toEqual(mockProfile);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useProfileStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useProfileStore());
      const errorMessage = 'Test error';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadInitialData', () => {
    it('should load all initial data successfully', async () => {
      const mockProfiles = [{ index: 0, name: 'Profile 1', hotkey: null }];
      const mockCurrentProfile = { index: 0, name: 'Profile 1', hotkey: null };
      const mockPages = [{ index: 0, name: 'Page 1' }];
      const mockCurrentPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 1, has_previous_page: false, has_next_page: false };
      
      vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
      vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      await act(async () => {
        await result.current.loadInitialData();
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.profiles).toEqual(mockProfiles);
      expect(result.current.currentProfile).toEqual(mockCurrentProfile);
      expect(result.current.currentPages).toEqual(mockPages);
      expect(result.current.currentPage).toEqual(mockCurrentPage);
      expect(result.current.navigationContext).toEqual(mockNavContext);
      expect(result.current.error).toBeNull();
    });

    it('should handle errors during initial data load', async () => {
      const errorMessage = 'Failed to load data';
      vi.mocked(tauriAPI.getProfiles).mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useProfileStore());
      
      await act(async () => {
        await result.current.loadInitialData();
      });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Profile Switching', () => {
    it('should switch to profile by index', async () => {
      const mockProfile = { index: 1, name: 'Profile 2', hotkey: null };
      const mockPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 1, has_previous_page: false, has_next_page: false };
      
      vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(mockProfile);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([mockPage]);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      let returnedProfile;
      await act(async () => {
        returnedProfile = await result.current.switchToProfile(1);
      });
      
      expect(returnedProfile).toEqual(mockProfile);
      expect(result.current.currentProfile).toEqual(mockProfile);
      expect(tauriAPI.switchToProfile).toHaveBeenCalledWith(1);
    });

    it('should switch to profile by name', async () => {
      const mockProfile = { index: 1, name: 'Profile 2', hotkey: null };
      const mockPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 1, has_previous_page: false, has_next_page: false };
      
      vi.mocked(tauriAPI.switchToProfileByName).mockResolvedValue(mockProfile);
      vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([mockPage]);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      let returnedProfile;
      await act(async () => {
        returnedProfile = await result.current.switchToProfileByName('Profile 2');
      });
      
      expect(returnedProfile).toEqual(mockProfile);
      expect(result.current.currentProfile).toEqual(mockProfile);
      expect(tauriAPI.switchToProfileByName).toHaveBeenCalledWith('Profile 2');
    });
  });

  describe('Page Navigation', () => {
    it('should navigate to next page', async () => {
      const mockPage = { index: 1, name: 'Page 2' };
      const mockNavContext = { page_index: 1, total_pages: 3, has_previous_page: true, has_next_page: true };
      
      vi.mocked(tauriAPI.nextPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      let returnedPage;
      await act(async () => {
        returnedPage = await result.current.nextPage();
      });
      
      expect(returnedPage).toEqual(mockPage);
      expect(result.current.currentPage).toEqual(mockPage);
      expect(tauriAPI.nextPage).toHaveBeenCalled();
    });

    it('should navigate to previous page', async () => {
      const mockPage = { index: 0, name: 'Page 1' };
      const mockNavContext = { page_index: 0, total_pages: 3, has_previous_page: false, has_next_page: true };
      
      vi.mocked(tauriAPI.previousPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      let returnedPage;
      await act(async () => {
        returnedPage = await result.current.previousPage();
      });
      
      expect(returnedPage).toEqual(mockPage);
      expect(result.current.currentPage).toEqual(mockPage);
      expect(tauriAPI.previousPage).toHaveBeenCalled();
    });

    it('should switch to specific page', async () => {
      const mockPage = { index: 2, name: 'Page 3' };
      const mockNavContext = { page_index: 2, total_pages: 3, has_previous_page: true, has_next_page: false };
      
      vi.mocked(tauriAPI.switchToPage).mockResolvedValue(mockPage);
      vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);
      
      const { result } = renderHook(() => useProfileStore());
      
      let returnedPage;
      await act(async () => {
        returnedPage = await result.current.switchToPage(2);
      });
      
      expect(returnedPage).toEqual(mockPage);
      expect(result.current.currentPage).toEqual(mockPage);
      expect(tauriAPI.switchToPage).toHaveBeenCalledWith(2);
    });
  });

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useProfileStore());
      
      // Set some state
      act(() => {
        result.current.setProfiles([{ index: 0, name: 'Profile 1', hotkey: null }]);
        result.current.setLoading(true);
        result.current.setError('Some error');
      });
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.profiles).toEqual([]);
      expect(result.current.currentProfile).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
