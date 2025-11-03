import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionButton from './ActionButton';
import ContextMenu from './ContextMenu';
import { QDeckConfig, tauriAPI, ActionButton as ActionButtonType } from '../lib/tauri';
import './Grid.css';

interface GridProps {
  config?: QDeckConfig;
}

export const Grid: React.FC<GridProps> = ({ config }) => {
  const [currentProfile] = useState(0);
  const [currentPage] = useState(0);
  const [dpiScale, setDpiScale] = useState(1);
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<QDeckConfig | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    x: number;
    y: number;
    button: ActionButtonType | null;
  }>({
    isVisible: false,
    x: 0,
    y: 0,
    button: null,
  });

  const [screenInfo, setScreenInfo] = useState({
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    pixelRatio: window.devicePixelRatio
  });

  // Simplified screen info detection
  const updateScreenInfo = useCallback(() => {
    const newScreenInfo = {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      pixelRatio: window.devicePixelRatio,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type || 'landscape-primary',
      dpiCategory: getDPICategory(window.devicePixelRatio),
      physicalWidth: Math.round(window.screen.width / window.devicePixelRatio),
      physicalHeight: Math.round(window.screen.height / window.devicePixelRatio),
    };
    
    setScreenInfo(newScreenInfo);
    
    // Simple DPI scaling - let CSS handle most of the responsive behavior
    setDpiScale(Math.min(window.devicePixelRatio, 2.0));
    
    console.log('Screen info updated:', newScreenInfo);
  }, []);

  // Helper function to categorize DPI
  const getDPICategory = (pixelRatio: number): string => {
    if (pixelRatio <= 1.25) return 'standard';
    if (pixelRatio <= 1.75) return 'high';
    if (pixelRatio <= 2.5) return 'very-high';
    return 'ultra-high';
  };

  useEffect(() => {
    updateScreenInfo();
    
    // Listen for screen changes (monitor changes, DPI changes)
    const handleResize = () => updateScreenInfo();
    const handleOrientationChange = () => setTimeout(updateScreenInfo, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Listen for DPI changes
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handleDPIChange = () => updateScreenInfo();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDPIChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleDPIChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDPIChange);
      } else {
        mediaQuery.removeListener(handleDPIChange);
      }
    };
  }, [updateScreenInfo]);

  // Configuration functions
  const openConfig = () => {
    console.log('openConfig called, current config:', config);
    if (config) {
      const configCopy = JSON.parse(JSON.stringify(config));
      console.log('Setting tempConfig to:', configCopy);
      setTempConfig(configCopy);
      setShowConfig(true);
      console.log('showConfig set to true');
    } else {
      console.error('Cannot open config: config is null');
    }
  };

  const closeConfig = () => {
    console.log('closeConfig called');
    setShowConfig(false);
    setTempConfig(null);
  };



  const saveConfig = async () => {
    console.log('saveConfig called, tempConfig:', tempConfig);
    if (!tempConfig) {
      console.error('saveConfig: tempConfig is null');
      return;
    }
    
    try {
      console.log('Saving configuration...');
      await tauriAPI.saveConfig(tempConfig);
      console.log('Configuration saved successfully');
      setShowConfig(false);
      setTempConfig(null);
      // Reload the page to reflect changes
      console.log('Reloading page...');
      window.location.reload();
    } catch (err) {
      console.error('Failed to save config:', err);
      alert(`Failed to save configuration: ${err}`);
    }
  };

  const updateGridSize = async (rows: number, cols: number) => {
    console.log('updateGridSize called:', rows, cols, 'tempConfig:', tempConfig);
    if (!tempConfig) {
      console.error('updateGridSize: tempConfig is null');
      return;
    }
    
    // Deep clone to ensure React detects the change
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    if (newConfig.profiles[currentProfile]?.pages[currentPage]) {
      newConfig.profiles[currentProfile].pages[currentPage].rows = rows;
      newConfig.profiles[currentProfile].pages[currentPage].cols = cols;
      // Keep existing buttons but filter out those outside new grid bounds
      const existingButtons = newConfig.profiles[currentProfile].pages[currentPage].buttons || [];
      newConfig.profiles[currentProfile].pages[currentPage].buttons = existingButtons.filter(
        (button: any) => button.position.row <= rows && button.position.col <= cols
      );
      console.log('Grid size updated to:', rows, 'x', cols);
      console.log('New config:', newConfig);
      
      // Update tempConfig for UI
      setTempConfig(newConfig);
      
      // Auto-save the configuration
      try {
        await tauriAPI.saveConfig(newConfig);
        console.log('Grid size configuration saved successfully');
        // Reload to reflect changes
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        console.error('Failed to save grid size config:', err);
      }
    } else {
      console.error('updateGridSize: Invalid profile or page');
    }
  };

  const updateThemeColor = async (color: string) => {
    console.log('updateThemeColor called:', color, 'tempConfig:', tempConfig);
    if (!tempConfig) {
      console.error('updateThemeColor: tempConfig is null');
      return;
    }
    
    // Deep clone to ensure React detects the change
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    newConfig.ui.window.theme = color;
    console.log('Theme updated to:', color);
    console.log('New config:', newConfig);
    
    // Update tempConfig for UI
    setTempConfig(newConfig);
    
    // Auto-save the configuration
    try {
      await tauriAPI.saveConfig(newConfig);
      console.log('Theme configuration saved successfully');
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error('Failed to save theme config:', err);
    }
  };

  if (!config || !config.profiles || config.profiles.length === 0) {
    return (
      <div className="grid-container">
        <div className="grid-placeholder">
          <h3>No profiles configured</h3>
          <p>Configure profiles in the main window to see buttons here.</p>
        </div>
      </div>
    );
  }

  const profile = config.profiles[currentProfile];
  const page = profile.pages[currentPage];

  if (!page) {
    return (
      <div className="grid-container">
        <div className="grid-placeholder">
          <h3>No pages configured</h3>
          <p>Configure pages for this profile to see buttons here.</p>
        </div>
      </div>
    );
  }



  // Simplified and reliable cell size calculation
  const calculateOptimalCellSize = useCallback(() => {
    if (!config) return 96;
    
    const profile = config.profiles[currentProfile];
    const currentPageData = profile?.pages[currentPage];
    
    if (!currentPageData) return config.ui.window.cell_size_px;
    
    const { rows, cols } = currentPageData;
    const baseGapSize = config.ui.window.gap_px;
    
    // Use viewport dimensions instead of screen dimensions for more reliable calculation
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Reserve space for padding and potential scrollbars
    const availableWidth = viewportWidth * 0.9; // 90% of viewport width
    const availableHeight = viewportHeight * 0.85; // 85% of viewport height
    
    // Calculate maximum cell size that fits
    const maxCellWidth = (availableWidth - (cols - 1) * baseGapSize) / cols;
    const maxCellHeight = (availableHeight - (rows - 1) * baseGapSize) / rows;
    
    // Use the smaller dimension to ensure the grid fits
    const calculatedSize = Math.min(maxCellWidth, maxCellHeight);
    
    // Apply reasonable bounds
    const minSize = 64;
    const maxSize = 128;
    
    return Math.max(minSize, Math.min(maxSize, Math.floor(calculatedSize)));
  }, [config, currentProfile, currentPage]);

  const calculateOptimalGapSize = useCallback(() => {
    if (!config) return 8;
    
    // Keep gap size simple and proportional to cell size
    const cellSize = calculateOptimalCellSize();
    const baseGap = config.ui.window.gap_px;
    
    // Scale gap proportionally to cell size
    const scaledGap = (cellSize / 96) * baseGap;
    
    return Math.max(4, Math.min(16, Math.round(scaledGap)));
  }, [config, calculateOptimalCellSize]);

  const optimalCellSize = calculateOptimalCellSize();
  const optimalGapSize = calculateOptimalGapSize();

  // Handle system actions
  const handleSystemAction = useCallback((action: string) => {
    console.log('handleSystemAction called with:', action);
    
    switch (action) {
      case 'config':
        console.log('Opening config modal directly');
        openConfig();
        break;
      case 'back':
      case 'exit_config':
        // Hide overlay
        tauriAPI.hideOverlay().catch(console.error);
        break;
      case 'hide_overlay':
        tauriAPI.hideOverlay().catch(console.error);
        break;
      case 'toggle_overlay':
        tauriAPI.toggleOverlay().catch(console.error);
        break;
      default:
        console.warn('Unknown system action:', action);
    }
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((event: React.MouseEvent, button: ActionButtonType) => {
    console.log('Context menu requested for button:', button.label);
    setContextMenu({
      isVisible: true,
      x: event.clientX,
      y: event.clientY,
      button: button,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isVisible: false,
      x: 0,
      y: 0,
      button: null,
    });
  }, []);

  const handleEditButton = useCallback(() => {
    console.log('Edit button:', contextMenu.button?.label);
    // TODO: Implement button editing
    alert('ボタン編集機能は今後実装予定です');
  }, [contextMenu.button]);

  const handleDeleteButton = useCallback(() => {
    console.log('Delete button:', contextMenu.button?.label);
    // TODO: Implement button deletion
    alert('ボタン削除機能は今後実装予定です');
  }, [contextMenu.button]);

  // Simplified grid style
  const gridStyle = {
    '--grid-rows': page.rows,
    '--grid-cols': page.cols,
    '--cell-size': `${optimalCellSize}px`,
    '--gap-size': `${optimalGapSize}px`,
    '--dpi-scale': dpiScale,
  } as React.CSSProperties;



  // Create a grid array with buttons positioned correctly
  const gridCells = Array.from({ length: page.rows * page.cols }, (_, index) => {
    const row = Math.floor(index / page.cols) + 1;
    const col = (index % page.cols) + 1;
    
    const button = page.buttons.find(
      btn => btn.position.row === row && btn.position.col === col
    );



    return {
      index,
      row,
      col,
      button,
    };
  });

  return (
    <>
      {/* Grid */}
      <motion.div 
        className="grid"
        style={gridStyle}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: {
            staggerChildren: 0.02,
            delayChildren: 0.1,
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {gridCells.map(({ index, row, col, button }) => (
          <motion.div
            key={index}
            className={`grid-cell ${button ? 'has-button' : 'empty'}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { duration: 0.15 }
            }}
            data-row={row}
            data-col={col}
          >
            {button ? (
              <ActionButton 
                button={button}
                dpiScale={dpiScale}
                screenInfo={screenInfo}
                onSystemAction={button.action?.action_type === 'system' ? handleSystemAction : undefined}
                onContextMenu={handleContextMenu}
              />
            ) : (
              <div className="empty-cell"></div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && tempConfig && config && (
          <motion.div
            className="config-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              console.log('Overlay clicked');
              closeConfig();
            }}
          >
            <motion.div
              className="config-modal"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="config-header">
                <h3>Grid Settings</h3>
                <button 
                  className="close-button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Close button clicked');
                    closeConfig();
                  }}
                >
                  ×
                </button>
              </div>

              <div className="config-content">
                {/* Grid Size Selection */}
                <div className="config-section">
                  <h4>Grid Size</h4>
                  <div className="grid-size-options">
                    {[
                      { rows: 2, cols: 4, label: '2×4' },
                      { rows: 3, cols: 4, label: '3×4' },
                      { rows: 3, cols: 6, label: '3×6' },
                      { rows: 4, cols: 6, label: '4×6' },
                      { rows: 4, cols: 8, label: '4×8' },
                      { rows: 5, cols: 8, label: '5×8' },
                    ].map(({ rows, cols, label }) => (
                      <button
                        key={label}
                        className={`size-option ${
                          tempConfig?.profiles?.[currentProfile]?.pages?.[currentPage]?.rows === rows &&
                          tempConfig?.profiles?.[currentProfile]?.pages?.[currentPage]?.cols === cols
                            ? 'active' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Grid size button clicked:', rows, cols);
                          updateGridSize(rows, cols);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Color Selection */}
                <div className="config-section">
                  <h4>Theme</h4>
                  <div className="theme-options">
                    {[
                      { value: 'dark', label: 'Dark', color: '#1e1e1e' },
                      { value: 'blue', label: 'Blue', color: '#1e3a8a' },
                      { value: 'green', label: 'Green', color: '#166534' },
                      { value: 'purple', label: 'Purple', color: '#7c3aed' },
                      { value: 'red', label: 'Red', color: '#dc2626' },
                      { value: 'orange', label: 'Orange', color: '#ea580c' },
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        className={`theme-option ${tempConfig?.ui?.window?.theme === value ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Theme button clicked:', value);
                          updateThemeColor(value);
                        }}
                        title={label}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="config-footer">
                <button className="cancel-button" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked');
                  closeConfig();
                }}>
                  Cancel
                </button>
                <button className="save-button" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Save button clicked');
                  saveConfig();
                }}>
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <ContextMenu
        isVisible={contextMenu.isVisible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
        onEdit={handleEditButton}
        onDelete={handleDeleteButton}
        onSettings={openConfig}
        buttonLabel={contextMenu.button?.label}
      />
    </>
  );
};

export default Grid;