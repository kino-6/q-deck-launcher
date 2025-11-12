import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tauriAPI, ProfileInfo, PageInfo, NavigationContext } from '../lib/platform-api';
import { logger } from '../utils/logger';

interface ProfileState {
  // State
  profiles: ProfileInfo[];
  currentProfile: ProfileInfo | null;
  currentPages: PageInfo[];
  currentPage: PageInfo | null;
  navigationContext: NavigationContext | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProfiles: (profiles: ProfileInfo[]) => void;
  setCurrentProfile: (profile: ProfileInfo | null) => void;
  setCurrentPages: (pages: PageInfo[]) => void;
  setCurrentPage: (page: PageInfo | null) => void;
  setNavigationContext: (context: NavigationContext | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  loadInitialData: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshCurrentProfile: () => Promise<void>;
  refreshCurrentPage: () => Promise<void>;
  refreshNavigationContext: () => Promise<void>;
  switchToProfile: (profileIndex: number) => Promise<ProfileInfo | null>;
  switchToProfileByName: (profileName: string) => Promise<ProfileInfo | null>;
  switchToPage: (pageIndex: number) => Promise<PageInfo | null>;
  nextPage: () => Promise<PageInfo | null>;
  previousPage: () => Promise<PageInfo | null>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  profiles: [],
  currentProfile: null,
  currentPages: [],
  currentPage: null,
  navigationContext: null,
  loading: false,
  error: null,
};

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Synchronous setters
      setProfiles: (profiles) => set({ profiles }, false, 'setProfiles'),
      setCurrentProfile: (currentProfile) => set({ currentProfile }, false, 'setCurrentProfile'),
      setCurrentPages: (currentPages) => set({ currentPages }, false, 'setCurrentPages'),
      setCurrentPage: (currentPage) => set({ currentPage }, false, 'setCurrentPage'),
      setNavigationContext: (navigationContext) => set({ navigationContext }, false, 'setNavigationContext'),
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
      
      // Load initial data
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null }, false, 'loadInitialData/start');
          
          const [profilesData, currentProfileData, currentPagesData, currentPageData, navContext] = await Promise.all([
            tauriAPI.getProfiles() as Promise<ProfileInfo[]>,
            tauriAPI.getCurrentProfile() as Promise<ProfileInfo | null>,
            tauriAPI.getCurrentProfilePages() as Promise<PageInfo[]>,
            tauriAPI.getCurrentPage() as Promise<PageInfo | null>,
            tauriAPI.getNavigationContext() as Promise<NavigationContext | null>,
          ]);
          
          set({
            profiles: profilesData,
            currentProfile: currentProfileData,
            currentPages: currentPagesData,
            currentPage: currentPageData,
            navigationContext: navContext,
            loading: false,
          }, false, 'loadInitialData/success');
          
          logger.log('Profile store: Initial data loaded');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
          logger.error('Profile store: Failed to load initial data:', err);
          set({ error: errorMessage, loading: false }, false, 'loadInitialData/error');
        }
      },
      
      // Refresh functions
      refreshProfiles: async () => {
        try {
          const profilesData = await tauriAPI.getProfiles() as ProfileInfo[];
          set({ profiles: profilesData }, false, 'refreshProfiles');
          logger.log('Profile store: Profiles refreshed');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profiles';
          logger.error('Profile store: Failed to refresh profiles:', err);
          set({ error: errorMessage }, false, 'refreshProfiles/error');
        }
      },
      
      refreshCurrentProfile: async () => {
        try {
          const currentProfileData = await tauriAPI.getCurrentProfile() as ProfileInfo | null;
          set({ currentProfile: currentProfileData }, false, 'refreshCurrentProfile');
          logger.log('Profile store: Current profile refreshed');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh current profile';
          logger.error('Profile store: Failed to refresh current profile:', err);
          set({ error: errorMessage }, false, 'refreshCurrentProfile/error');
        }
      },
      
      refreshCurrentPage: async () => {
        try {
          const [currentPageData, currentPagesData] = await Promise.all([
            tauriAPI.getCurrentPage() as Promise<PageInfo | null>,
            tauriAPI.getCurrentProfilePages() as Promise<PageInfo[]>,
          ]);
          
          set({
            currentPage: currentPageData,
            currentPages: currentPagesData,
          }, false, 'refreshCurrentPage');
          
          logger.log('Profile store: Current page refreshed');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh current page';
          logger.error('Profile store: Failed to refresh current page:', err);
          set({ error: errorMessage }, false, 'refreshCurrentPage/error');
        }
      },
      
      refreshNavigationContext: async () => {
        try {
          const navContext = await tauriAPI.getNavigationContext() as NavigationContext | null;
          set({ navigationContext: navContext }, false, 'refreshNavigationContext');
          logger.log('Profile store: Navigation context refreshed');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh navigation context';
          logger.error('Profile store: Failed to refresh navigation context:', err);
          set({ error: errorMessage }, false, 'refreshNavigationContext/error');
        }
      },
      
      // Profile switching
      switchToProfile: async (profileIndex: number): Promise<ProfileInfo | null> => {
        try {
          set({ error: null }, false, 'switchToProfile/start');
          logger.log('Profile store: Switching to profile:', profileIndex);
          
          const profileInfo = await tauriAPI.switchToProfile(profileIndex) as ProfileInfo | null;
          
          if (profileInfo) {
            set({ currentProfile: profileInfo }, false, 'switchToProfile/success');
            
            // Refresh related data
            await Promise.all([
              get().refreshCurrentPage(),
              get().refreshNavigationContext(),
            ]);
            
            logger.log('Profile store: Switched to profile:', profileInfo.name);
          }
          
          return profileInfo;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to switch profile';
          logger.error('Profile store: Failed to switch profile:', err);
          set({ error: errorMessage }, false, 'switchToProfile/error');
          return null;
        }
      },
      
      switchToProfileByName: async (profileName: string): Promise<ProfileInfo | null> => {
        try {
          set({ error: null }, false, 'switchToProfileByName/start');
          logger.log('Profile store: Switching to profile by name:', profileName);
          
          const profileInfo = await tauriAPI.switchToProfileByName(profileName) as ProfileInfo | null;
          
          if (profileInfo) {
            set({ currentProfile: profileInfo }, false, 'switchToProfileByName/success');
            
            // Refresh related data
            await Promise.all([
              get().refreshCurrentPage(),
              get().refreshNavigationContext(),
            ]);
            
            logger.log('Profile store: Switched to profile:', profileInfo.name);
          }
          
          return profileInfo;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to switch profile by name';
          logger.error('Profile store: Failed to switch profile by name:', err);
          set({ error: errorMessage }, false, 'switchToProfileByName/error');
          return null;
        }
      },
      
      // Page navigation
      switchToPage: async (pageIndex: number): Promise<PageInfo | null> => {
        try {
          set({ error: null }, false, 'switchToPage/start');
          logger.log('Profile store: Switching to page:', pageIndex);
          
          const pageInfo = await tauriAPI.switchToPage(pageIndex) as PageInfo | null;
          
          if (pageInfo) {
            set({ currentPage: pageInfo }, false, 'switchToPage/success');
            
            // Refresh navigation context
            await get().refreshNavigationContext();
            
            logger.log('Profile store: Switched to page:', pageInfo.name);
          }
          
          return pageInfo;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to switch page';
          logger.error('Profile store: Failed to switch page:', err);
          set({ error: errorMessage }, false, 'switchToPage/error');
          return null;
        }
      },
      
      nextPage: async (): Promise<PageInfo | null> => {
        try {
          set({ error: null }, false, 'nextPage/start');
          logger.log('Profile store: Navigating to next page');
          
          const pageInfo = await tauriAPI.nextPage() as PageInfo | null;
          
          if (pageInfo) {
            set({ currentPage: pageInfo }, false, 'nextPage/success');
            
            // Refresh navigation context
            await get().refreshNavigationContext();
            
            logger.log('Profile store: Navigated to next page:', pageInfo.name);
          } else {
            logger.log('Profile store: Already at last page');
          }
          
          return pageInfo;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to go to next page';
          logger.error('Profile store: Failed to go to next page:', err);
          set({ error: errorMessage }, false, 'nextPage/error');
          return null;
        }
      },
      
      previousPage: async (): Promise<PageInfo | null> => {
        try {
          set({ error: null }, false, 'previousPage/start');
          logger.log('Profile store: Navigating to previous page');
          
          const pageInfo = await tauriAPI.previousPage() as PageInfo | null;
          
          if (pageInfo) {
            set({ currentPage: pageInfo }, false, 'previousPage/success');
            
            // Refresh navigation context
            await get().refreshNavigationContext();
            
            logger.log('Profile store: Navigated to previous page:', pageInfo.name);
          } else {
            logger.log('Profile store: Already at first page');
          }
          
          return pageInfo;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to go to previous page';
          logger.error('Profile store: Failed to go to previous page:', err);
          set({ error: errorMessage }, false, 'previousPage/error');
          return null;
        }
      },
      
      // Reset store to initial state
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'ProfileStore' }
  )
);

// Selectors for optimized re-renders
export const selectProfiles = (state: ProfileState) => state.profiles;
export const selectCurrentProfile = (state: ProfileState) => state.currentProfile;
export const selectCurrentPages = (state: ProfileState) => state.currentPages;
export const selectCurrentPage = (state: ProfileState) => state.currentPage;
export const selectNavigationContext = (state: ProfileState) => state.navigationContext;
export const selectLoading = (state: ProfileState) => state.loading;
export const selectError = (state: ProfileState) => state.error;

// Composite selectors
export const selectProfileData = (state: ProfileState) => ({
  profiles: state.profiles,
  currentProfile: state.currentProfile,
  loading: state.loading,
  error: state.error,
});

export const selectPageData = (state: ProfileState) => ({
  currentPages: state.currentPages,
  currentPage: state.currentPage,
  navigationContext: state.navigationContext,
});

export default useProfileStore;
