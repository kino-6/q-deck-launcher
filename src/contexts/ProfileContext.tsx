import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { tauriAPI, ProfileInfo, PageInfo, NavigationContext } from '../lib/platform-api';

/**
 * @deprecated This context is deprecated. Use the Zustand store from '../store/profileStore' instead.
 * This context will be removed in a future version.
 * 
 * Migration guide:
 * - Replace `useProfile()` with `useProfileStore()` from '../store/profileStore'
 * - Use selectors for optimized re-renders: `useProfileStore(selectCurrentProfile)`
 * - Remove `<ProfileProvider>` wrapper from your component tree
 */
interface ProfileContextType {
  profiles: ProfileInfo[];
  currentProfile: ProfileInfo | null;
  currentPages: PageInfo[];
  currentPage: PageInfo | null;
  navigationContext: NavigationContext | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  switchToProfile: (profileIndex: number) => Promise<void>;
  switchToProfileByName: (profileName: string) => Promise<void>;
  switchToPage: (pageIndex: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshCurrentProfile: () => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  refreshNavigationContext: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

/**
 * @deprecated Use `useProfileStore()` from '../store/profileStore' instead
 */
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  // Log deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'useProfile() is deprecated. Please migrate to useProfileStore() from "../store/profileStore".\n' +
      'See ProfileContext.tsx for migration guide.'
    );
  }
  
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileInfo | null>(null);
  const [currentPages, setCurrentPages] = useState<PageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState<PageInfo | null>(null);
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profilesData, currentProfileData, currentPagesData, currentPageData, navContext] = await Promise.all([
        tauriAPI.getProfiles(),
        tauriAPI.getCurrentProfile(),
        tauriAPI.getCurrentProfilePages(),
        tauriAPI.getCurrentPage(),
        tauriAPI.getNavigationContext(),
      ]);

      setProfiles(profilesData as ProfileInfo[]);
      setCurrentProfile(currentProfileData as ProfileInfo);
      setCurrentPages(currentPagesData as PageInfo[]);
      setCurrentPage(currentPageData as PageInfo);
      setNavigationContext(navContext as NavigationContext);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh functions
  const refreshProfiles = async () => {
    try {
      const profilesData = await tauriAPI.getProfiles();
      setProfiles(profilesData as ProfileInfo[]);
    } catch (err) {
      console.error('Failed to refresh profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh profiles');
    }
  };

  const refreshCurrentProfile = async () => {
    try {
      const currentProfileData = await tauriAPI.getCurrentProfile();
      setCurrentProfile(currentProfileData as ProfileInfo);
    } catch (err) {
      console.error('Failed to refresh current profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh current profile');
    }
  };

  const refreshCurrentPage = async () => {
    try {
      const [currentPageData, currentPagesData] = await Promise.all([
        tauriAPI.getCurrentPage(),
        tauriAPI.getCurrentProfilePages(),
      ]);
      setCurrentPage(currentPageData as PageInfo);
      setCurrentPages(currentPagesData as PageInfo[]);
    } catch (err) {
      console.error('Failed to refresh current page:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh current page');
    }
  };

  const refreshNavigationContext = async () => {
    try {
      const navContext = await tauriAPI.getNavigationContext();
      setNavigationContext(navContext as NavigationContext);
    } catch (err) {
      console.error('Failed to refresh navigation context:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh navigation context');
    }
  };

  // Action functions
  const switchToProfile = async (profileIndex: number) => {
    try {
      setError(null);
      const profileInfo = await tauriAPI.switchToProfile(profileIndex);
      setCurrentProfile(profileInfo as ProfileInfo);
      
      // Refresh related data
      await Promise.all([
        refreshCurrentPage(),
        refreshNavigationContext(),
      ]);
    } catch (err) {
      console.error('Failed to switch profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch profile');
    }
  };

  const switchToProfileByName = async (profileName: string) => {
    try {
      setError(null);
      const profileInfo = await tauriAPI.switchToProfileByName(profileName);
      setCurrentProfile(profileInfo as ProfileInfo);
      
      // Refresh related data
      await Promise.all([
        refreshCurrentPage(),
        refreshNavigationContext(),
      ]);
    } catch (err) {
      console.error('Failed to switch profile by name:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch profile by name');
    }
  };

  const switchToPage = async (pageIndex: number) => {
    try {
      setError(null);
      const pageInfo = await tauriAPI.switchToPage(pageIndex);
      setCurrentPage(pageInfo as PageInfo);
      
      // Refresh navigation context
      await refreshNavigationContext();
    } catch (err) {
      console.error('Failed to switch page:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch page');
    }
  };

  const nextPage = async () => {
    try {
      setError(null);
      const pageInfo = await tauriAPI.nextPage();
      setCurrentPage(pageInfo as PageInfo);
      
      // Refresh navigation context
      await refreshNavigationContext();
    } catch (err) {
      console.error('Failed to go to next page:', err);
      setError(err instanceof Error ? err.message : 'Failed to go to next page');
    }
  };

  const previousPage = async () => {
    try {
      setError(null);
      const pageInfo = await tauriAPI.previousPage();
      setCurrentPage(pageInfo as PageInfo);
      
      // Refresh navigation context
      await refreshNavigationContext();
    } catch (err) {
      console.error('Failed to go to previous page:', err);
      setError(err instanceof Error ? err.message : 'Failed to go to previous page');
    }
  };

  // Set up event listeners
  useEffect(() => {
    const setupEventListeners = () => {
      try {
        // Listen for profile changes from hotkeys
        tauriAPI.onProfileChanged((profileInfo: ProfileInfo) => {
          console.log('Profile changed event received:', profileInfo);
          setCurrentProfile(profileInfo);
          
          // Refresh related data
          refreshCurrentPage();
          refreshNavigationContext();
        });
      } catch (err) {
        console.error('Failed to set up event listeners:', err);
      }
    };

    setupEventListeners();

    // Note: Electron IPC listeners don't return cleanup functions
    // They are automatically cleaned up when the window is closed
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const contextValue: ProfileContextType = {
    profiles,
    currentProfile,
    currentPages,
    currentPage,
    navigationContext,
    loading,
    error,
    switchToProfile,
    switchToProfileByName,
    switchToPage,
    nextPage,
    previousPage,
    refreshProfiles,
    refreshCurrentProfile,
    refreshCurrentPage,
    refreshNavigationContext,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;