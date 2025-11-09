import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Grid from '../components/Grid';
import { useProfile } from '../contexts/ProfileContext';
import { tauriAPI, QDeckConfig } from '../lib/tauri';
import './Overlay.css';

function Overlay() {
  const [config, setConfig] = useState<QDeckConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    currentProfile,
    currentPage,
    navigationContext,
    nextPage,
    previousPage,
    loading: profileLoading,
    error: profileError
  } = useProfile();

  useEffect(() => {
    loadConfig();
  }, []);

  // Separate effect for keyboard handlers to ensure proper cleanup
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Don't handle Escape if a modal is open
      if (event.key === 'Escape' && !isModalOpen) {
        event.preventDefault();
        event.stopPropagation();
        await handleHideOverlay();
      } else if (event.key === 'ArrowLeft' && navigationContext?.has_previous_page && !isModalOpen) {
        event.preventDefault();
        await previousPage();
      } else if (event.key === 'ArrowRight' && navigationContext?.has_next_page && !isModalOpen) {
        event.preventDefault();
        await nextPage();
      } else if (event.key === 'PageUp' && navigationContext?.has_previous_page && !isModalOpen) {
        event.preventDefault();
        await previousPage();
      } else if (event.key === 'PageDown' && navigationContext?.has_next_page && !isModalOpen) {
        event.preventDefault();
        await nextPage();
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
      console.error('Failed to load config in overlay:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideOverlay = async () => {
    try {
      await tauriAPI.hideOverlay();
    } catch (err) {
      console.error('Failed to hide overlay:', err);
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