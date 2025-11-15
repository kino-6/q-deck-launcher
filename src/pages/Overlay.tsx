import { useEffect, useState, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  
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

  // Listen for drag state changes to prevent auto-hide during drag & drop
  useEffect(() => {
    const handleDragStart = () => {
      logger.log('Drag started - disabling auto-hide');
      setIsDragging(true);
    };

    const handleDragEnd = () => {
      logger.log('Drag ended - enabling auto-hide');
      setIsDragging(false);
    };

    window.addEventListener('dragenter', handleDragStart);
    window.addEventListener('dragleave', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);

    return () => {
      window.removeEventListener('dragenter', handleDragStart);
      window.removeEventListener('dragleave', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await tauriAPI.getConfig();
      setConfig(loadedConfig as QDeckConfig);
    } catch (err) {
      logger.error('Failed to load config in overlay:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideOverlay = useCallback(async () => {
    try {
      console.log('🎯 handleHideOverlay: Calling tauriAPI.hideOverlay()');
      // Use platform-specific API to hide overlay
      await tauriAPI.hideOverlay();
      console.log('🎯 handleHideOverlay: Successfully hidden');
    } catch (err) {
      console.error('🎯 handleHideOverlay: Error hiding overlay:', err);
      logger.error('Failed to hide overlay:', err);
    }
  }, []); // No dependencies - this function is stable

  // Listen for Open action execution to auto-close overlay
  useEffect(() => {
    console.log('🎯 Overlay: Setting up open-action-executed event listener');
    
    const handleOpenActionExecuted = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🎯 Overlay: Received open-action-executed event!', customEvent.detail);
      logger.log('Open action executed, detected in Overlay:', customEvent.detail);
      
      // Check if auto-close is enabled in config (default: true)
      const autoCloseEnabled = config?.ui?.window?.auto_close_on_open !== false;
      console.log('🎯 Overlay: Auto-close enabled?', autoCloseEnabled);
      
      if (autoCloseEnabled) {
        console.log('🎯 Overlay: Scheduling overlay hide in 100ms...');
        // Auto-close overlay after Open action
        // Add a small delay to ensure the action completes
        setTimeout(async () => {
          console.log('🎯 Overlay: Hiding overlay now...');
          await handleHideOverlay();
        }, 100);
      } else {
        console.log('Auto-close disabled in config - overlay will remain open');
      }
    };

    window.addEventListener('open-action-executed', handleOpenActionExecuted);
    console.log('🎯 Overlay: Event listener registered');
    
    return () => {
      console.log('🎯 Overlay: Removing event listener');
      window.removeEventListener('open-action-executed', handleOpenActionExecuted);
    };
  }, [config, handleHideOverlay]); // Add handleHideOverlay to dependency array

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

  // Handle click outside overlay to auto-hide
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout | null = null;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't auto-hide if modal is open
      if (isModalOpen) {
        logger.log('Modal is open - ignoring click outside');
        return;
      }

      // Don't auto-hide during drag & drop
      if (isDragging) {
        logger.log('Drag in progress - ignoring click outside');
        return;
      }

      // Find all elements with pointer-events: auto (actual content areas)
      const contentElements = document.querySelectorAll('.navigation-header, .grid, .error-message');
      const target = event.target as Node;
      
      // Check if click is on any content element
      let clickedOnContent = false;
      contentElements.forEach((element) => {
        if (element.contains(target)) {
          clickedOnContent = true;
        }
      });

      // If click is not on content, it's outside the overlay
      if (!clickedOnContent) {
        logger.log('Click detected outside overlay content - scheduling auto-hide');
        
        // Add delay before hiding (150ms) to prevent accidental closes
        hideTimeout = setTimeout(async () => {
          logger.log('Auto-hiding overlay after delay');
          await handleHideOverlay();
        }, 150);
      }
    };

    // Use mousedown instead of click for better responsiveness
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isModalOpen, isDragging, handleHideOverlay]);

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
        <div>
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
        </div>
      )}
    </div>
  );
}

export default Overlay;