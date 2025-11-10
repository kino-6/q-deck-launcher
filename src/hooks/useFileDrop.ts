import { useCallback, useEffect } from 'react';
import { QDeckConfig, tauriAPI } from '../lib/platform-api';
import { useDragDrop } from './useDragDrop';
import { isElectron } from '../lib/electron-adapter';
import { logger } from '../utils/logger';

interface UseFileDropProps {
  config?: QDeckConfig;
  tempConfig?: QDeckConfig | null;
  setTempConfig: (config: QDeckConfig | null) => void;
  currentProfileIndex: number;
  currentPageIndex: number;
  dragOverPosition: { row: number; col: number } | null;
  lastMousePosition: { x: number; y: number } | null;
  calculateDropPosition: (x: number, y: number) => { row: number; col: number } | null;
}

/**
 * Hook for handling file drop operations
 * Processes dropped files and creates buttons in the grid
 */
export const useFileDrop = ({
  config,
  tempConfig,
  setTempConfig,
  currentProfileIndex,
  currentPageIndex,
  dragOverPosition,
  lastMousePosition,
  calculateDropPosition,
}: UseFileDropProps) => {
  const { setProcessing, setDragging, resetDragState } = useDragDrop();

  /**
   * Common file drop handler for both Electron and Tauri
   * Processes file paths and creates buttons in the grid
   */
  const handleFileDrop = useCallback(async (filePaths: string[]) => {
    logger.log('File drop handler called with', filePaths.length, 'files');
    
    // Use config if tempConfig is not available
    const activeConfig = tempConfig || config;
    if (!activeConfig) {
      logger.error('No config available for adding buttons');
      resetDragState();
      return;
    }

    // Calculate drop position from last mouse position
    let dropPosition = dragOverPosition;
    
    // If no drag over position, try to calculate from last mouse position
    if (!dropPosition && lastMousePosition) {
      dropPosition = calculateDropPosition(
        lastMousePosition.x,
        lastMousePosition.y
      );
    }

    // Validate drop position
    if (!dropPosition) {
      logger.warn('No valid drop position - files dropped outside grid');
      alert('Please drop files inside the grid cells');
      resetDragState();
      return;
    }

    // Validate drop position is within grid bounds
    const currentPage = activeConfig.profiles[currentProfileIndex]?.pages[currentPageIndex];
    if (!currentPage) {
      logger.error('No current page available');
      resetDragState();
      return;
    }

    if (dropPosition.row < 1 || dropPosition.row > currentPage.rows ||
        dropPosition.col < 1 || dropPosition.col > currentPage.cols) {
      logger.warn('Drop position out of grid bounds:', dropPosition);
      alert(`Drop position (${dropPosition.row}, ${dropPosition.col}) is outside grid bounds (${currentPage.rows}x${currentPage.cols})`);
      resetDragState();
      return;
    }

    logger.log('Processing dropped files at position:', dropPosition);

    setProcessing(true);
    setDragging(false);

    try {
      
      // Generate buttons for all dropped files
      const newButtons = [];
      let currentRow = dropPosition.row;
      let currentCol = dropPosition.col;
      
      for (const filePath of filePaths) {
        // Extract filename from path (handle both Windows and Unix paths)
        const fileName = filePath.includes('\\') 
          ? (filePath.split('\\').pop() || 'Unknown')
          : (filePath.split('/').pop() || 'Unknown');
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

        logger.log('Creating button for file:', fileName);

        // Determine action type based on file extension
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        
        // Create button label (filename without extension)
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');

        // Extract icon from executable if it's an .exe file
        let iconPath: string | undefined = undefined;
        if (isExecutable) {
          try {
            const iconInfo = await tauriAPI.extractExecutableIcon(filePath);
            
            if (iconInfo && iconInfo.path) {
              iconPath = iconInfo.path;
              logger.log('Icon extracted successfully');
            }
          } catch (error) {
            logger.error('Failed to extract icon:', error);
          }
        }

        // Create button with proper structure
        const newButton = {
          position: { row: currentRow, col: currentCol },
          action_type: actionType,
          label: buttonLabel,
          icon: iconPath,
          config: isExecutable 
            ? { path: filePath }
            : { target: filePath },
          style: undefined,
          action: undefined,
        };

        newButtons.push(newButton);

        // Move to next position
        currentCol++;
        if (currentCol > currentPage.cols) {
          currentCol = 1;
          currentRow++;
          
          if (currentRow > currentPage.rows) {
            logger.warn('Reached end of grid, stopping button generation');
            break;
          }
        }
      }

      if (newButtons.length === 0) {
        logger.warn('No buttons were generated');
        alert('No buttons could be created from the dropped files');
        return;
      }

      // Add buttons to configuration
      const newConfig = JSON.parse(JSON.stringify(activeConfig));
      const currentPageButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
      
      // Remove existing buttons at the same positions
      for (const newButton of newButtons) {
        const existingButtonIndex = currentPageButtons.findIndex((btn: any) => 
          btn.position.row === newButton.position.row && 
          btn.position.col === newButton.position.col
        );
        
        if (existingButtonIndex !== -1) {
          logger.log(`Replacing existing button at (${newButton.position.row}, ${newButton.position.col})`);
          currentPageButtons.splice(existingButtonIndex, 1);
        }
      }
      
      // Add all new buttons
      currentPageButtons.push(...newButtons);
      
      // Save configuration
      await tauriAPI.saveConfig(newConfig);
      logger.log(`Successfully added ${newButtons.length} button(s)`);
      
      // Update tempConfig if it exists
      if (tempConfig) {
        setTempConfig(newConfig);
      }
      
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      logger.error('Failed to process dropped files:', error);
      alert(`Failed to add button: ${error}`);
    } finally {
      setProcessing(false);
      resetDragState();
    }
  }, [
    tempConfig,
    config,
    currentProfileIndex,
    currentPageIndex,
    dragOverPosition,
    lastMousePosition,
    calculateDropPosition,
    setProcessing,
    setDragging,
    resetDragState,
    setTempConfig,
  ]);

  /**
   * Handle HTML drop event
   * Extracts file paths from the drop event
   */
  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    logger.log('HTML drop event');
    
    // For Electron, extract file paths using the preload script API
    if (isElectron()) {
      const files = Array.from(event.dataTransfer.files);
      logger.log('Files in drop event:', files.length);
      
      if (files.length > 0 && window.electronAPI && window.electronAPI.getFilePathsFromFiles) {
        // Use the preload script API to get file paths
        const filePaths = window.electronAPI.getFilePathsFromFiles(files);
        
        if (filePaths && filePaths.length > 0) {
          logger.log('Extracted file paths via preload API');
          handleFileDrop(filePaths);
        } else {
          logger.error('No file paths could be extracted via preload API');
        }
      } else {
        logger.error('getFilePathsFromFiles API not available or no files');
      }
    } else {
      // For Tauri, the drop is handled by Tauri event listeners
      logger.log('Tauri will handle the drop');
    }
  }, [handleFileDrop]);

  /**
   * Setup file drop listeners for both Electron and Tauri
   */
  useEffect(() => {
    logger.log('Setting up file drop listeners');
    
    // Setup Electron file drop listener (from main process)
    if (isElectron()) {
      if (window.electronAPI && window.electronAPI.onFileDrop) {
        window.electronAPI.onFileDrop((filePaths: string[]) => {
          logger.log('Received file paths from Electron main process');
          handleFileDrop(filePaths);
        });
      } else {
        logger.warn('electronAPI.onFileDrop not available');
      }
      
      return;
    }
    
    // Setup Tauri file drop listeners
    let unlistenFileDrop: (() => void) | null = null;
    let unlistenFileDropHover: (() => void) | null = null;
    let unlistenFileDropCancelled: (() => void) | null = null;
    
    const setupFileDropListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const currentWindow = getCurrentWindow();
        
        unlistenFileDropHover = await currentWindow.listen('tauri://file-drop-hover', (event) => {
          const filePaths = event.payload as string[];
          logger.log('Files hovering:', filePaths.length);
          setDragging(true);
        });
        
        unlistenFileDrop = await currentWindow.listen('tauri://file-drop', (event) => {
          const filePaths = event.payload as string[];
          logger.log('Files dropped:', filePaths.length);
          handleFileDrop(filePaths);
        });
        
        unlistenFileDropCancelled = await currentWindow.listen('tauri://file-drop-cancelled', () => {
          logger.log('File drop cancelled');
          resetDragState();
        });
        
        logger.log('Tauri file drop listeners set up successfully');
      } catch (error) {
        logger.error('Failed to set up Tauri file drop listeners:', error);
      }
    };
    
    setupFileDropListener();
    
    return () => {
      if (unlistenFileDrop) unlistenFileDrop();
      if (unlistenFileDropHover) unlistenFileDropHover();
      if (unlistenFileDropCancelled) unlistenFileDropCancelled();
    };
  }, [handleFileDrop, setDragging, resetDragState]);

  return {
    handleDrop,
  };
};
