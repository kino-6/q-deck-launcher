import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import ContextMenu from './ContextMenu';
import ThemeSelector from './ThemeSelector';
import GridDragDrop from './GridDragDrop';
import ConfigModal from './ConfigModal';
import GridCell from './GridCell';
import { QDeckConfig, ProfileInfo, PageInfo } from '../lib/platform-api';
import { useScreenInfo } from '../hooks/useScreenInfo';
import { useGridLayout } from '../hooks/useGridLayout';
import { useConfigModal } from '../hooks/useConfigModal';
import { useContextMenu } from '../hooks/useContextMenu';
import { useButtonOperations } from '../hooks/useButtonOperations';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { createGridCells } from '../utils/gridCalculations';
import { handleSystemAction as handleSystemActionUtil, handleTestClick } from '../utils/configOperations';
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

  // Use custom hooks
  const { screenInfo, dpiScale } = useScreenInfo();
  
  const { gridStyle } = useGridLayout({
    config,
    currentProfileIndex,
    currentPageIndex,
  });

  const {
    showConfig,
    tempConfig,
    setTempConfig,
    openConfig,
    closeConfig,
    saveConfig,
    updateGridSize,
    updateThemeColor,
  } = useConfigModal({
    config,
    currentProfileIndex,
    currentPageIndex,
    onModalStateChange,
  });

  const {
    contextMenu,
    handleContextMenu,
    handleEmptyCellContextMenu,
    handleGridBackgroundContextMenu,
    closeContextMenu,
  } = useContextMenu();

  const {
    handleEditButton,
    handleRemoveButton,
    handleAddButton,
    handleUndo,
  } = useButtonOperations({
    config,
    tempConfig,
    setTempConfig,
    currentProfileIndex,
    currentPageIndex,
    closeContextMenu,
  });

  const {
    themeSelector,
    handleThemeButton,
    handleThemeSelect,
    closeThemeSelector,
  } = useThemeSelector({
    tempConfig,
    setTempConfig,
  });

  // Handle system actions
  const handleSystemAction = useCallback((action: string) => {
    handleSystemActionUtil(action, openConfig);
  }, [openConfig]);

  const handleDeleteButton = useCallback(() => {
    if (contextMenu.button) {
      handleRemoveButton(contextMenu.button);
    }
  }, [contextMenu.button, handleRemoveButton]);

  const handleThemeButtonClick = useCallback(() => {
    handleThemeButton(contextMenu.button);
  }, [contextMenu.button, handleThemeButton]);

  const handleEditButtonClick = useCallback(() => {
    handleEditButton(contextMenu.button);
  }, [contextMenu.button, handleEditButton]);

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

  // Create a grid array with buttons positioned correctly
  const gridCells = createGridCells(page);

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
                <GridCell
                  key={index}
                  index={index}
                  row={row}
                  col={col}
                  button={button}
                  isDragOver={isDragOver}
                  isDropTarget={isDropTarget}
                  dpiScale={dpiScale}
                  screenInfo={screenInfo}
                  onSystemAction={handleSystemAction}
                  onContextMenu={handleContextMenu}
                  onEmptyCellContextMenu={handleEmptyCellContextMenu}
                />
              );
            })}
          </motion.div>

          {/* Configuration Modal */}
          <ConfigModal
            showConfig={showConfig}
            tempConfig={tempConfig}
            config={config}
            currentProfileIndex={currentProfileIndex}
            currentPageIndex={currentPageIndex}
            onClose={closeConfig}
            onSave={saveConfig}
            onUpdateGridSize={updateGridSize}
            onUpdateThemeColor={updateThemeColor}
            onUndo={handleUndo}
          />

          {/* Context Menu */}
          <ContextMenu
            isVisible={contextMenu.isVisible}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onEdit={contextMenu.menuType === 'button' ? handleEditButtonClick : undefined}
            onDelete={contextMenu.menuType === 'button' ? handleDeleteButton : undefined}
            onTheme={contextMenu.menuType === 'button' ? handleThemeButtonClick : undefined}
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
