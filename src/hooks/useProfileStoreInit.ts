import { useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { tauriAPI, ProfileInfo } from '../lib/platform-api';
import { logger } from '../utils/logger';

/**
 * Hook to initialize the profile store and set up event listeners
 * Should be called once at the app root level
 */
export const useProfileStoreInit = () => {
  const loadInitialData = useProfileStore((state) => state.loadInitialData);
  const setCurrentProfile = useProfileStore((state) => state.setCurrentProfile);
  const refreshCurrentPage = useProfileStore((state) => state.refreshCurrentPage);
  const refreshNavigationContext = useProfileStore((state) => state.refreshNavigationContext);

  useEffect(() => {
    // Load initial data
    loadInitialData();

    // Set up event listeners for profile changes
    try {
      tauriAPI.onProfileChanged((profileInfo: ProfileInfo) => {
        logger.log('Profile changed event received:', profileInfo);
        setCurrentProfile(profileInfo);
        
        // Refresh related data
        refreshCurrentPage();
        refreshNavigationContext();
      });
    } catch (err) {
      logger.error('Failed to set up profile change listener:', err);
    }
  }, [loadInitialData, setCurrentProfile, refreshCurrentPage, refreshNavigationContext]);
};

export default useProfileStoreInit;
