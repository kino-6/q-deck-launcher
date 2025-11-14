import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Grid from '../components/Grid';
import { useProfileStore, selectCurrentProfile, selectCurrentPage, selectNavigationContext, selectLoading, selectError } from '../store/profileStore';
import { useProfileStoreInit } from '../hooks/useProfileStoreInit';
import { tauriAPI, QDeckConfig } from '../lib/platform-api';
import { logger } from '../utils/logger';
import './Overlay.css';

function Overlay() {
  const [config, setConfig] = useState<QDeckConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize profile store and event listeners
  useProfileStoreInit();
  
  // Use Zustand store with selectors for optimized re-renders
  const currentProfile = useProfileStore(selectCurrentProfile);
  const currentPage = useProfileStore(selectCurrentPage);
  const navigationContext = useProfileStore(selectNavigationContext);
  const profileLoading = useProfileStore(selectLoading);
  const profileError = useProfileStore(selectError);
  const nextPage = useProfileStore((state) => state.nextPage);
  const previousPage = useProfileStore((state) => state.previousPage);

  useEffect(() => {
    loadConfig();
  }, []);

  // Listen for Open action execution to auto-close overlay
  useEffect(() => {
    const handleOpenActionExecuted = async (event: Event) => {
      const customEvent = event as CustomEvent;
      logger.info('Open action executed, detected in Overlay:', customEvent.detail);
      console.log('Open action executed - will auto-close overlay:', customEvent.detail);
      
      // Check if auto-close is enabled in config (default: true)
      const autoCloseEnabled = config?.ui?.window?.auto_close_on_open !== false;
      
      if (autoCloseEnabled) {
        // Auto-close overlay after Open action
        // Add a small delay to ensure the action completes
        setTimeout(async () => {
          await handleHideOverlay();
        }, 100);
      } else {
        console.log('Auto-close disabled in config - overlay will remain open');
      }
    };

    window.addEventListener('open-action-executed', handleOpenActionExecuted);
    
    return () => {
      window.removeEventListener('open-action-executed', handleOpenActionExecuted);
    };
  }, [config]); // Add config to dependency array

  // Separate effect for keyboard handlers to ensure proper cleanup
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Don't handle any shortcuts if a modal is open
      if (isModalOpen) {
        return;
      }

      // Handle Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        // Use platform-specific API to hide overlay
        await tauriAPI.hideOverlay();
        return;
      }

      // Handle navigation keys
      if (event.key === 'ArrowLeft' && navigationContext?.has_previous_page) {
        event.preventDefault();
        await previousPage();
        return;
      }
      
      if (event.key === 'ArrowRight' && navigationContext?.has_next_page) {
        event.preventDefault();
        await nextPage();
        return;
      }
      
      if (event.key === 'PageUp' && navigationContext?.has_previous_page) {
        event.preventDefault();
        await previousPage();
        return;
      }
      
      if (event.key === 'PageDown' && navigationContext?.has_next_page) {
        event.preventDefault();
        await nextPage();
        return;
      }

      // Handle number key shortcuts (1-9, 0) for first 10 buttons
      // With Shift modifier: Shift+1-9, Shift+0 for buttons 11-20
      // Map: 1->0, 2->1, ..., 9->8, 0->9
      const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      const keyIndex = numberKeys.indexOf(event.key);
      
      if (keyIndex !== -1) {
        event.preventDefault();
        
        // Calculate button index based on Shift modifier
        let buttonIndex = keyIndex;
        if (event.shiftKey) {
          // Shift+1 -> button 10 (index 10), Shift+2 -> button 11 (index 11), etc.
          buttonIndex = keyIndex + 10;
        }
        
        // Dispatch custom event with button index
        window.dispatchEvent(new CustomEvent('button-shortcut-pressed', { 
          detail: { buttonIndex } 
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigationContext, previousPage, nextPage, isModalOpen]); // Add isModalOpen to dependencies

  const loadConfig = async () => {
    try {
      const loadedConfig = await tauriAPI.getConfig();
      setConfig(loadedConfig);
    } catch (err) {
      logger.error('Failed to load config in overlay:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideOverlay = async () => {
    try {
      // Use platform-specific API to hide overlay
      await tauriAPI.hideOverlay();
    } catch (err) {
      logger.error('Failed to hide overlay:', err);
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="overlay-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="overlay-container">
        <div className="error-message">
          <p>Error loading profile: {profileError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay-container" onContextMenu={(e) => e.preventDefault()}>
      {config && currentProfile && currentPage && (
        <motion.div
          initial={{ opacity: 0, y: -150, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8
            }
          }}
        >
          {/* Navigation header */}
          {navigationContext && navigationContext.total_pages > 1 && (
            <div className="navigation-header">
              <div className="profile-info">
                <span className="profile-name">{currentProfile.name}</span>
                <span className="page-info">
                  {currentPage.name} ({navigationContext.page_index + 1}/{navigationContext.total_pages})
                </span>
              </div>
              <div className="page-navigation">
                <button 
                  className="nav-button"
                  onClick={previousPage}
                  disabled={!navigationContext.has_previous_page}
                  title="Previous page (←, Page Up)"
                >
                  ←
                </button>
                <button 
                  className="nav-button"
                  onClick={nextPage}
                  disabled={!navigationContext.has_next_page}
                  title="Next page (→, Page Down)"
                >
                  →
                </button>
              </div>
            </div>
          )}
          
          <Grid 
            config={config} 
            currentProfile={currentProfile}
            currentPage={currentPage}
            onModalStateChange={setIsModalOpen}
          />
        </motion.div>
      )}
    </div>
  );
}

export default Overlay;