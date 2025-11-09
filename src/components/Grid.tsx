import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionButton from './ActionButton';
import ContextMenu from './ContextMenu';
import ThemeSelector from './ThemeSelector';
import GridDragDrop from './GridDragDrop';
import { QDeckConfig, tauriAPI, ActionButton as ActionButtonType, ProfileInfo, PageInfo, ButtonStyle, UndoOperation } from '../lib/tauri';
import './Grid.css';

interface GridProps {
  config?: QDeckConfig;
  currentProfile?: ProfileInfo;
  currentPage?: PageInfo;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const Grid: React.FC<GridProps> = ({ config, currentProfile, currentPage, onModalStateChange }) => {
  console.log('🔧 Grid component initialized with:', { config, currentProfile, currentPage });
  
  const currentProfileIndex = currentProfile?.index ?? 0;
  const currentPageIndex = currentPage?.index ?? 0;
  const [dpiScale, setDpiScale] = useState(1);
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<QDeckConfig | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    x: number;
    y: number;
    button: ActionButtonType | null;
    gridPosition: { row: number; col: number } | null;
    menuType: 'button' | 'empty-cell' | 'grid-background';
  }>({
    isVisible: false,
    x: 0,
    y: 0,
    button: null,
    gridPosition: null,
    menuType: 'grid-background',
  });

  const [themeSelector, setThemeSelector] = useState<{
    isVisible: boolean;
    button: ActionButtonType | null;
  }>({
    isVisible: false,
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

  // Test click handler to verify component is interactive
  const handleTestClick = useCallback(() => {
    console.log('🎯 Grid clicked - component is interactive!');
  }, []);

  useEffect(() => {
    updateScreenInfo();
    
    const handleResize = () => updateScreenInfo();
    const handleOrientationChange = () => setTimeout(updateScreenInfo, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handleDPIChange = () => updateScreenInfo();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDPIChange);
    } else {
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
      onModalStateChange?.(true);
      console.log('showConfig set to true');
    } else {
      console.error('Cannot open config: config is null');
    }
  };

  const closeConfig = () => {
    console.log('closeConfig called');
    setShowConfig(false);
    setTempConfig(null);
    onModalStateChange?.(false);
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
    
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].rows = rows;
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].cols = cols;
      const existingButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons || [];
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons = existingButtons.filter(
        (button: any) => button.position.row <= rows && button.position.col <= cols
      );
      console.log('Grid size updated to:', rows, 'x', cols);
      console.log('New config:', newConfig);
      
      setTempConfig(newConfig);
      
      try {
        await tauriAPI.saveConfig(newConfig);
        console.log('Grid size configuration saved successfully');
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
    
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    newConfig.ui.window.theme = color;
    console.log('Theme updated to:', color);
    console.log('New config:', newConfig);
    
    setTempConfig(newConfig);
    
    try {
      await tauriAPI.saveConfig(newConfig);
      console.log('Theme configuration saved successfully');
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

  const profile = config.profiles[currentProfileIndex];
  const page = profile.pages[currentPageIndex];

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
    
    const profile = config.profiles[currentProfileIndex];
    const currentPageData = profile?.pages[currentPageIndex];
    
    if (!currentPageData) return config.ui.window.cell_size_px;
    
    const { rows, cols } = currentPageData;
    const baseGapSize = config.ui.window.gap_px;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const availableWidth = viewportWidth * 0.9;
    const availableHeight = viewportHeight * 0.85;
    
    const maxCellWidth = (availableWidth - (cols - 1) * baseGapSize) / cols;
    const maxCellHeight = (availableHeight - (rows - 1) * baseGapSize) / rows;
    
    const calculatedSize = Math.min(maxCellWidth, maxCellHeight);
    
    const minSize = 64;
    const maxSize = 128;
    
    return Math.max(minSize, Math.min(maxSize, Math.floor(calculatedSize)));
  }, [config, currentProfileIndex, currentPageIndex]);

  const calculateOptimalGapSize = useCallback(() => {
    if (!config) return 8;
    
    const cellSize = calculateOptimalCellSize();
    const baseGap = config.ui.window.gap_px;
    
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

  // Handle context menu for buttons
  const handleContextMenu = useCallback((event: React.MouseEvent, button: ActionButtonType) => {
    console.log('Context menu requested for button:', button.label);
    setContextMenu({
      isVisible: true,
      x: event.clientX,
      y: event.clientY,
      button: button,
      gridPosition: null,
      menuType: 'button',
    });
  }, []);

  // Handle context menu for empty cells
  const handleEmptyCellContextMenu = useCallback((event: React.MouseEvent, row: number, col: number) => {
    console.log('Context menu requested for empty cell:', row, col);
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      isVisible: true,
      x: event.clientX,
      y: event.clientY,
      button: null,
      gridPosition: { row, col },
      menuType: 'empty-cell',
    });
  }, []);

  // Handle context menu for grid background
  const handleGridBackgroundContextMenu = useCallback((event: React.MouseEvent) => {
    console.log('Context menu requested for grid background');
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      isVisible: true,
      x: event.clientX,
      y: event.clientY,
      button: null,
      gridPosition: null,
      menuType: 'grid-background',
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isVisible: false,
      x: 0,
      y: 0,
      button: null,
      gridPosition: null,
      menuType: 'grid-background',
    });
  }, []);

  const handleEditButton = useCallback(() => {
    console.log('Edit button:', contextMenu.button?.label);
    console.log('ボタン編集機能は今後実装予定です');
  }, [contextMenu.button]);

  // Handle removing button
  const handleRemoveButton = useCallback(async (button: ActionButtonType) => {
    console.log('Removing button:', button.label);
    
    const activeConfig = tempConfig || config;
    if (!activeConfig) {
      console.error('No config available for removing button');
      return;
    }
    
    try {
      const newConfig = JSON.parse(JSON.stringify(activeConfig));
      
      if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
        const buttons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
        const buttonIndex = buttons.findIndex((btn: ActionButtonType) => 
          btn.position.row === button.position.row &&
          btn.position.col === button.position.col &&
          btn.label === button.label
        );
        
        if (buttonIndex !== -1) {
          buttons.splice(buttonIndex, 1);
          
          if (tempConfig) {
            setTempConfig(newConfig);
          }
          
          if (typeof tauriAPI !== 'undefined' && typeof tauriAPI.saveConfig === 'function') {
            await tauriAPI.saveConfig(newConfig);
            console.log('Button removed and saved successfully');
            setTimeout(() => window.location.reload(), 500);
          } else {
            console.log('Button removed (not saved - Tauri API unavailable)');
          }
        }
      }
    } catch (err) {
      console.error('Failed to remove button:', err);
    }
  }, [tempConfig, config, currentProfileIndex, currentPageIndex]);

  const handleDeleteButton = useCallback(() => {
    if (contextMenu.button) {
      handleRemoveButton(contextMenu.button);
    }
  }, [contextMenu.button, handleRemoveButton]);

  const handleThemeButton = useCallback(() => {
    console.log('Theme button:', contextMenu.button?.label);
    if (contextMenu.button) {
      setThemeSelector({
        isVisible: true,
        button: contextMenu.button,
      });
    }
  }, [contextMenu.button]);

  const handleThemeSelect = useCallback(async (style: ButtonStyle) => {
    if (!themeSelector.button || !tempConfig) return;
    
    console.log('Applying theme to button:', themeSelector.button.label, style);
    
    try {
      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      
      for (const profile of newConfig.profiles) {
        for (const page of profile.pages) {
          const buttonIndex = page.buttons.findIndex((btn: ActionButtonType) => 
            btn.position.row === themeSelector.button!.position.row &&
            btn.position.col === themeSelector.button!.position.col &&
            btn.label === themeSelector.button!.label
          );
          
          if (buttonIndex !== -1) {
            page.buttons[buttonIndex].style = style;
            console.log('Updated button style:', page.buttons[buttonIndex]);
            
            setTempConfig(newConfig);
            
            await tauriAPI.saveConfig(newConfig);
            console.log('Theme configuration saved successfully');
            
            setTimeout(() => window.location.reload(), 500);
            return;
          }
        }
      }
      
      console.error('Button not found for theme update');
    } catch (err) {
      console.error('Failed to apply theme:', err);
      alert(`テーマの適用に失敗しました: ${err}`);
    }
  }, [themeSelector.button, tempConfig]);

  const closeThemeSelector = useCallback(() => {
    setThemeSelector({
      isVisible: false,
      button: null,
    });
  }, []);

  // Handle undo operation
  const handleUndo = useCallback(async () => {
    try {
      const lastOperation = await tauriAPI.getLastUndoOperation();
      
      if (!lastOperation) {
        alert('No operations to undo');
        return;
      }

      if (!tempConfig) {
        console.error('No tempConfig available for undo');
        return;
      }

      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      const currentPageButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
      
      if (lastOperation.operation_type === 'AddButtons') {
        for (const position of lastOperation.affected_positions) {
          const buttonIndex = currentPageButtons.findIndex((btn: ActionButtonType) => 
            btn.position.row === position.row && btn.position.col === position.col
          );
          
          if (buttonIndex !== -1) {
            currentPageButtons.splice(buttonIndex, 1);
          }
        }
      }
      
      setTempConfig(newConfig);
      await tauriAPI.saveConfig(newConfig);
      
      await tauriAPI.undoLastOperation();
      
      console.log('Undo operation completed');
      alert('Last operation undone');
      
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      console.error('Failed to undo operation:', error);
      alert(`Failed to undo operation: ${error}`);
    }
  }, [tempConfig, currentProfileIndex, currentPageIndex]);

  // Handle adding new button
  const handleAddButton = useCallback(async (row: number, col: number) => {
    console.log('Adding new button at:', row, col);
    
    if (!tempConfig) {
      console.error('No tempConfig available');
      return;
    }
    
    try {
      const newButton: ActionButtonType = {
        position: { row, col },
        action_type: 'LaunchApp',
        label: 'New Button',
        icon: '🚀',
        config: {
          path: 'notepad.exe'
        },
        style: undefined,
        action: undefined,
      };
      
      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      
      if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
        newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons.push(newButton);
        
        setTempConfig(newConfig);
        
        await tauriAPI.saveConfig(newConfig);
        console.log('New button added and saved successfully');
        
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      console.error('Failed to add new button:', err);
      alert(`ボタンの追加に失敗しました: ${err}`);
    }
  }, [tempConfig, currentProfileIndex, currentPageIndex]);

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
    <GridDragDrop
      config={config}
      tempConfig={tempConfig}
      setTempConfig={setTempConfig}
      currentProfileIndex={currentProfileIndex}
      currentPageIndex={currentPageIndex}
    >
      {({ dragState, onDragEnter, onDragLeave, onDragOver, onDrop }) => (
        <>
          {/* Grid */}
          <motion.div 
            className={`grid ${dragState.isDragging ? 'drag-active' : ''} ${dragState.isProcessing ? 'processing' : ''}`}
            style={gridStyle}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: {
                staggerChildren: 0.02,
                delayChildren: 0.1,
              }
            }}
            onContextMenu={handleGridBackgroundContextMenu}
            onClick={handleTestClick}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {gridCells.map(({ index, row, col, button }) => {
              const isDragOver = dragState.dragOverPosition?.row === row && dragState.dragOverPosition?.col === col;
              const isDropTarget = isDragOver;
              
              return (
                <motion.div
                  key={index}
                  className={`grid-cell ${button ? 'has-button' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDropTarget ? 'drop-target' : ''}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isDragOver ? 1.05 : 1, 
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
                  <div 
                    className={`empty-cell ${isDropTarget ? 'drop-zone' : ''}`}
                    onContextMenu={(e) => handleEmptyCellContextMenu(e, row, col)}
                  >
                    {isDropTarget && (
                      <div className="drop-indicator">
                        <span>{button ? '🔄' : '📁'}</span>
                        <span>{button ? 'Replace button' : 'Drop files here'}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
              );
            })}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      e.stopPropagation();
                      closeConfig();
                    }
                  }}
                  tabIndex={-1}
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
                              tempConfig?.profiles?.[currentProfileIndex]?.pages?.[currentPageIndex]?.rows === rows &&
                              tempConfig?.profiles?.[currentProfileIndex]?.pages?.[currentPageIndex]?.cols === cols
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
                    <button className="undo-button" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Undo button clicked');
                      handleUndo();
                    }}>
                      Undo Last
                    </button>
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
            onEdit={contextMenu.menuType === 'button' ? handleEditButton : undefined}
            onDelete={contextMenu.menuType === 'button' ? handleDeleteButton : undefined}
            onTheme={contextMenu.menuType === 'button' ? handleThemeButton : undefined}
            onAddButton={contextMenu.menuType === 'empty-cell' && contextMenu.gridPosition ? 
              () => handleAddButton(contextMenu.gridPosition!.row, contextMenu.gridPosition!.col) : undefined}
            onSettings={openConfig}
            buttonLabel={contextMenu.button?.label}
            menuType={contextMenu.menuType}
            gridPosition={contextMenu.gridPosition}
          />

          {/* Theme Selector */}
          <ThemeSelector
            isVisible={themeSelector.isVisible}
            currentStyle={themeSelector.button?.style}
            onThemeSelect={handleThemeSelect}
            onClose={closeThemeSelector}
          />
        </>
      )}
    </GridDragDrop>
  );
};

export default Grid;