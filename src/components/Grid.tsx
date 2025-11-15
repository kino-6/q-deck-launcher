import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ContextMenu from './ContextMenu';
import ThemeSelector from './ThemeSelector';
import GridDragDrop from './GridDragDrop';
import ConfigModal from './ConfigModal';
import ButtonEditModal from './ButtonEditModal';
import GridCell from './GridCell';
import PageIndicator from './PageIndicator';
import { QDeckConfig, ProfileInfo, PageInfo } from '../lib/platform-api';
import { useScreenInfo } from '../hooks/useScreenInfo';
import { useGridLayout } from '../hooks/useGridLayout';
import { useConfigModal } from '../hooks/useConfigModal';
import { useContextMenu } from '../hooks/useContextMenu';
import { useButtonOperations } from '../hooks/useButtonOperations';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { usePageNavigation } from '../hooks/usePageNavigation';
import { useButtonShortcuts } from '../hooks/useButtonShortcuts';
import { useButtonDragDrop } from '../hooks/useButtonDragDrop';
import { useButtonSwap } from '../hooks/useButtonSwap';
import { createGridCells } from '../utils/gridCalculations';
import { handleSystemAction as handleSystemActionUtil, handleTestClick } from '../utils/configOperations';
import { tauriAPI } from '../lib/platform-api';
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
    handleSaveEditedButton,
    handleRemoveButton,
    handleAddButton,
    handleUndo,
    editingButton,
    setEditingButton,
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

  // Enable keyboard navigation for page switching
  usePageNavigation({
    enabled: true,
  });

  // Button drag and drop for swapping positions
  const {
    dragState: buttonDragState,
    handleButtonDragStart,
    handleButtonDragOver,
    handleButtonDragEnd,
  } = useButtonDragDrop();

  // Button swap functionality
  const { swapButtons } = useButtonSwap({
    config,
    currentProfileIndex,
    currentPageIndex,
    onConfigUpdate: (newConfig) => {
      setTempConfig(newConfig);
    },
  });

  // Handle button drop to swap positions
  const handleButtonDrop = useCallback(async (toRow: number, toCol: number) => {
    if (buttonDragState.draggedPosition) {
      const { row: fromRow, col: fromCol } = buttonDragState.draggedPosition;
      await swapButtons(fromRow, fromCol, toRow, toCol);
      handleButtonDragEnd();
    }
  }, [buttonDragState.draggedPosition, swapButtons, handleButtonDragEnd]);

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
  // Memoize grid cells to avoid recalculation on every render
  const gridCells = React.useMemo(() => createGridCells(page), [page]);

  // Get all non-empty buttons in reading order for shortcuts
  const buttonsInReadingOrder = React.useMemo(() => {
    return gridCells
      .filter(cell => cell.button !== null && cell.button !== undefined)
      .map(cell => cell.button!);
  }, [gridCells]);

  // Handle button click via shortcut
  const handleButtonShortcutClick = useCallback(async (button: any) => {
    try {
      console.log('Button shortcut triggered:', button.label);
      
      // Handle system actions
      if (button.action?.action_type === 'system' && button.action.system_action) {
        handleSystemAction(button.action.system_action);
        return;
      }
      
      // Execute the action
      const actionConfig = {
        type: button.action_type,
        label: button.label,
        ...button.config
      };
      const result = await tauriAPI.executeAction(actionConfig);
      
      // Detect Open action execution for auto-close behavior
      if (result && result.success && result.actionType === 'Open') {
        window.dispatchEvent(new CustomEvent('open-action-executed', { 
          detail: { 
            actionType: result.actionType,
            label: button.label 
          } 
        }));
      }
    } catch (err) {
      console.error('Failed to execute action via shortcut:', err);
    }
  }, [handleSystemAction]);

  // Enable button shortcuts (1-9, 0 for first 10 buttons)
  const { getButtonShortcut } = useButtonShortcuts({
    buttons: buttonsInReadingOrder,
    onButtonClick: handleButtonShortcutClick,
    enabled: !showConfig, // Disable shortcuts when config modal is open
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
              const shortcutNumber = button ? getButtonShortcut(button) : null;
              
              // Check if this cell is being dragged
              const isBeingDragged = buttonDragState.isDragging && 
                buttonDragState.draggedPosition?.row === row && 
                buttonDragState.draggedPosition?.col === col;
              
              // Check if this cell is the drop target for button swap
              const isButtonDropTarget = buttonDragState.isDragging &&
                buttonDragState.dropTargetPosition?.row === row &&
                buttonDragState.dropTargetPosition?.col === col;
              
              return (
                <GridCell
                  key={index}
                  index={index}
                  row={row}
                  col={col}
                  button={button}
                  isDragOver={isDragOver || isButtonDropTarget}
                  isDropTarget={isDropTarget || isButtonDropTarget}
                  dpiScale={dpiScale}
                  screenInfo={screenInfo}
                  shortcutNumber={shortcutNumber}
                  onSystemAction={handleSystemAction}
                  onContextMenu={handleContextMenu}
                  onEmptyCellContextMenu={handleEmptyCellContextMenu}
                  onButtonDragStart={handleButtonDragStart}
                  onButtonDragOver={handleButtonDragOver}
                  onButtonDrop={handleButtonDrop}
                  isBeingDragged={isBeingDragged}
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

          {/* Button Edit Modal */}
          {editingButton && (
            <ButtonEditModal
              button={editingButton}
              onClose={() => setEditingButton(null)}
              onSave={handleSaveEditedButton}
            />
          )}

          {/* Page Indicator */}
          <PageIndicator />
        </>
      )}
    </GridDragDrop>
  );
};

export default Grid;
