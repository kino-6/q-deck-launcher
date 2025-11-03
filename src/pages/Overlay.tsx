import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Grid from '../components/Grid';
import { tauriAPI, QDeckConfig } from '../lib/tauri';
import './Overlay.css';

function Overlay() {
  const [config, setConfig] = useState<QDeckConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    setupKeyboardHandlers();
  }, []);

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

  const setupKeyboardHandlers = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleHideOverlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  const handleHideOverlay = async () => {
    try {
      await tauriAPI.hideOverlay();
    } catch (err) {
      console.error('Failed to hide overlay:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="overlay-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="overlay-container" onContextMenu={(e) => e.preventDefault()}>
      {config && (
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
          <Grid config={config} />
        </motion.div>
      )}
    </div>
  );
}

export default Overlay;