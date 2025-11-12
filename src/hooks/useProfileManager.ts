import { useState, useEffect, useCallback } from 'react';
import { tauriAPI, ProfileInfo, PageInfo, NavigationContext } from '../lib/platform-api';
import { logger } from '../utils/logger';

interface UseProfileManagerOptions {
  autoLoad?: boolean;
  onProfileChange?: (profile: ProfileInfo) => void;
  onPageChange?: (page: PageInfo) => void;
  onError?: (error: Error) => void;
}

interface UseProfileManagerReturn {
  // State
  profiles: ProfileInfo[];
  currentProfile: ProfileInfo | null;
  currentPages: PageInfo[];
  currentPage: PageInfo | null;
  navigationContext: NavigationContext | null;
  loading: boolean;
  error: string | null;
  
  // Profile actions
  switchToProfile: (profileIndex: number) => Promise<ProfileInfo | null>;
  switchToProfileByName: (profileName: string) => Promise<ProfileInfo | null>;
  
  // Page actions
  switchToPage: (pageIndex: number) => Promise<PageInfo | null>;
  nextPage: () => Promise<PageInfo | null>;
  previousPage: () => Promise<PageInfo | null>;
  
  // Refresh actions
  refreshProfiles: () => Promise<void>;
  refreshCurrentProfile: () => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  refreshNavigationContext: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

/**
 * Custom hook for profile management
 * Handles profile and page state, switching, and navigation
 */
export const useProfileManager = (options: UseProfileManagerOptions = {}): UseProfileManagerReturn => {
  const {
    autoLoad = true,
    onProfileChange,
    onPageChange,
    onError,
  } = options;

  // State
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileInfo | null>(null);
  const [currentPages, setCurrentPages] = useState<PageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState<PageInfo | null>(null);
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const fullMessage = `${context}: ${errorMessage}`;
    
    logger.error(fullMessage, err);
    setError(fullMessage);
    
    if (onError && err instanceof Error) {
      onError(err);
    }
  }, [onError]);

  // Refresh functions
  const refreshProfiles = useCallback(async () => {
    try {
      const profilesData = await tauriAPI.getProfiles() as ProfileInfo[];
      setProfiles(profilesData);
      logger.log('Profiles refreshed:', profilesData.length);
    } catch (err) {
      handleError(err, 'Failed to refresh profiles');
    }
  }, [handleError]);

  const refreshCurrentProfile = useCallback(async () => {
    try {
      const currentProfileData = await tauriAPI.getCurrentProfile() as ProfileInfo | null;
      setCurrentProfile(currentProfileData);
      logger.log('Current profile refreshed:', currentProfileData?.name);
      
      if (currentProfileData && onProfileChange) {
        onProfileChange(currentProfileData);
      }
    } catch (err) {
      handleError(err, 'Failed to refresh current profile');
    }
  }, [handleError, onProfileChange]);

  const refreshCurrentPage = useCallback(async () => {
    try {
      const [currentPageData, currentPagesData] = await Promise.all([
        tauriAPI.getCurrentPage() as Promise<PageInfo | null>,
        tauriAPI.getCurrentProfilePages() as Promise<PageInfo[]>,
      ]);
      
      setCurrentPage(currentPageData);
      setCurrentPages(currentPagesData);
      logger.log('Current page refreshed:', currentPageData?.name);
      
      if (currentPageData && onPageChange) {
        onPageChange(currentPageData);
      }
    } catch (err) {
      handleError(err, 'Failed to refresh current page');
    }
  }, [handleError, onPageChange]);

  const refreshNavigationContext = useCallback(async () => {
    try {
      const navContext = await tauriAPI.getNavigationContext() as NavigationContext | null;
      setNavigationContext(navContext);
      logger.log('Navigation context refreshed:', navContext);
    } catch (err) {
      handleError(err, 'Failed to refresh navigation context');
    }
  }, [handleError]);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profilesData, currentProfileData, currentPagesData, currentPageData, navContext] = await Promise.all([
        tauriAPI.getProfiles() as Promise<ProfileInfo[]>,
        tauriAPI.getCurrentProfile() as Promise<ProfileInfo | null>,
        tauriAPI.getCurrentProfilePages() as Promise<PageInfo[]>,
        tauriAPI.getCurrentPage() as Promise<PageInfo | null>,
        tauriAPI.getNavigationContext() as Promise<NavigationContext | null>,
      ]);

      setProfiles(profilesData);
      setCurrentProfile(currentProfileData);
      setCurrentPages(currentPagesData);
      setCurrentPage(currentPageData);
      setNavigationContext(navContext);
      
      logger.log('All profile data refreshed');
    } catch (err) {
      handleError(err, 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Profile actions
  const switchToProfile = useCallback(async (profileIndex: number): Promise<ProfileInfo | null> => {
    try {
      setError(null);
      logger.log('Switching to profile:', profileIndex);
      
      const profileInfo = await tauriAPI.switchToProfile(profileIndex) as ProfileInfo | null;
      
      if (profileInfo) {
        setCurrentProfile(profileInfo);
        
        // Refresh related data
        await Promise.all([
          refreshCurrentPage(),
          refreshNavigationContext(),
        ]);
        
        if (onProfileChange) {
          onProfileChange(profileInfo);
        }
        
        logger.log('Switched to profile:', profileInfo.name);
      }
      
      return profileInfo;
    } catch (err) {
      handleError(err, 'Failed to switch profile');
      return null;
    }
  }, [handleError, onProfileChange, refreshCurrentPage, refreshNavigationContext]);

  const switchToProfileByName = useCallback(async (profileName: string): Promise<ProfileInfo | null> => {
    try {
      setError(null);
      logger.log('Switching to profile by name:', profileName);
      
      const profileInfo = await tauriAPI.switchToProfileByName(profileName) as ProfileInfo | null;
      
      if (profileInfo) {
        setCurrentProfile(profileInfo);
        
        // Refresh related data
        await Promise.all([
          refreshCurrentPage(),
          refreshNavigationContext(),
        ]);
        
        if (onProfileChange) {
          onProfileChange(profileInfo);
        }
        
        logger.log('Switched to profile:', profileInfo.name);
      }
      
      return profileInfo;
    } catch (err) {
      handleError(err, 'Failed to switch profile by name');
      return null;
    }
  }, [handleError, onProfileChange, refreshCurrentPage, refreshNavigationContext]);

  // Page actions
  const switchToPage = useCallback(async (pageIndex: number): Promise<PageInfo | null> => {
    try {
      setError(null);
      logger.log('Switching to page:', pageIndex);
      
      const pageInfo = await tauriAPI.switchToPage(pageIndex) as PageInfo | null;
      
      if (pageInfo) {
        setCurrentPage(pageInfo);
        
        // Refresh navigation context
        await refreshNavigationContext();
        
        if (onPageChange) {
          onPageChange(pageInfo);
        }
        
        logger.log('Switched to page:', pageInfo.name);
      }
      
      return pageInfo;
    } catch (err) {
      handleError(err, 'Failed to switch page');
      return null;
    }
  }, [handleError, onPageChange, refreshNavigationContext]);

  const nextPage = useCallback(async (): Promise<PageInfo | null> => {
    try {
      setError(null);
      logger.log('Navigating to next page');
      
      const pageInfo = await tauriAPI.nextPage() as PageInfo | null;
      
      if (pageInfo) {
        setCurrentPage(pageInfo);
        
        // Refresh navigation context
        await refreshNavigationContext();
        
        if (onPageChange) {
          onPageChange(pageInfo);
        }
        
        logger.log('Navigated to next page:', pageInfo.name);
      } else {
        logger.log('Already at last page');
      }
      
      return pageInfo;
    } catch (err) {
      handleError(err, 'Failed to go to next page');
      return null;
    }
  }, [handleError, onPageChange, refreshNavigationContext]);

  const previousPage = useCallback(async (): Promise<PageInfo | null> => {
    try {
      setError(null);
      logger.log('Navigating to previous page');
      
      const pageInfo = await tauriAPI.previousPage() as PageInfo | null;
      
      if (pageInfo) {
        setCurrentPage(pageInfo);
        
        // Refresh navigation context
        await refreshNavigationContext();
        
        if (onPageChange) {
          onPageChange(pageInfo);
        }
        
        logger.log('Navigated to previous page:', pageInfo.name);
      } else {
        logger.log('Already at first page');
      }
      
      return pageInfo;
    } catch (err) {
      handleError(err, 'Failed to go to previous page');
      return null;
    }
  }, [handleError, onPageChange, refreshNavigationContext]);

  // Set up event listeners for profile changes
  useEffect(() => {
    try {
      // Listen for profile changes from hotkeys
      tauriAPI.onProfileChanged((profileInfo: ProfileInfo) => {
        logger.log('Profile changed event received:', profileInfo);
        setCurrentProfile(profileInfo);
        
        // Refresh related data
        refreshCurrentPage();
        refreshNavigationContext();
        
        if (onProfileChange) {
          onProfileChange(profileInfo);
        }
      });
    } catch (err) {
      logger.error('Failed to set up profile change listener:', err);
    }
  }, [onProfileChange, refreshCurrentPage, refreshNavigationContext]);

  // Load initial data on mount
  useEffect(() => {
    if (autoLoad) {
      refreshAll();
    }
  }, [autoLoad, refreshAll]);

  return {
    // State
    profiles,
    currentProfile,
    currentPages,
    currentPage,
    navigationContext,
    loading,
    error,
    
    // Profile actions
    switchToProfile,
    switchToProfileByName,
    
    // Page actions
    switchToPage,
    nextPage,
    previousPage,
    
    // Refresh actions
    refreshProfiles,
    refreshCurrentProfile,
    refreshCurrentPage,
    refreshNavigationContext,
    refreshAll,
  };
};

export default useProfileManager;
