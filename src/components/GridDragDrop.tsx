import React, { useCallback, useEffect, useRef } from 'react';
import { QDeckConfig, tauriAPI } from '../lib/platform-api';
import { useDragDrop } from '../hooks/useDragDrop';
import { isElectron } from '../lib/electron-adapter';

interface GridDragDropProps {
  config?: QDeckConfig;
  tempConfig?: QDeckConfig | null;
  setTempConfig: (config: QDeckConfig | null) => void;
  currentProfileIndex: number;
  currentPageIndex: number;
  children: (props: {
    dragState: any;
    onDragEnter: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  }) => React.ReactNode;
}

export const GridDragDrop: React.FC<GridDragDropProps> = ({
  config,
  tempConfig,
  setTempConfig,
  currentProfileIndex,
  currentPageIndex,
  children,
}) => {
  const { dragState, setDragging, setDragOverPosition, setProcessing, resetDragState } = useDragDrop();
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate drop position from mouse coordinates
  const calculateDropPosition = useCallback((mouseX: number, mouseY: number): { row: number; col: number } | null => {
    console.log('🎯 Calculating drop position for coordinates:', { mouseX, mouseY });
    
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) {
      console.warn('⚠️ Grid element not found');
      return null;
    }

    // Check if mouse is within grid bounds
    const gridRect = gridElement.getBoundingClientRect();
    console.log('📐 Grid bounds:', {
      left: gridRect.left,
      right: gridRect.right,
      top: gridRect.top,
      bottom: gridRect.bottom,
      width: gridRect.width,
      height: gridRect.height,
    });

    // Check if drop is outside grid
    if (
      mouseX < gridRect.left ||
      mouseX > gridRect.right ||
      mouseY < gridRect.top ||
      mouseY > gridRect.bottom
    ) {
      console.warn('⚠️ Drop position is outside grid bounds');
      return null;
    }

    // Find the cell at the drop position
    const gridCells = gridElement.querySelectorAll('.grid-cell');
    console.log(`🔍 Checking ${gridCells.length} grid cells`);
    
    for (const cell of Array.from(gridCells)) {
      const rect = cell.getBoundingClientRect();
      if (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      ) {
        const row = parseInt((cell as HTMLElement).dataset.row || '0');
        const col = parseInt((cell as HTMLElement).dataset.col || '0');
        console.log('✅ Drop position found:', { row, col });
        console.log('📍 Cell bounds:', {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        });
        return { row, col };
      }
    }
    
    console.warn('⚠️ No cell found at drop position (between cells or in gap)');
    return null;
  }, []);

  // Common file drop handler for both Electron and Tauri
  const handleFileDrop = useCallback(async (filePaths: string[]) => {
    console.log('🎯 File drop handler called');
    console.log('📁 File paths received:', filePaths);
    
    // Use config if tempConfig is not available
    const activeConfig = tempConfig || config;
    if (!activeConfig) {
      console.error('❌ No config available for adding buttons');
      resetDragState();
      return;
    }

    // Calculate drop position from last mouse position
    let dropPosition = dragState.dragOverPosition;
    
    // If no drag over position, try to calculate from last mouse position
    if (!dropPosition && lastMousePositionRef.current) {
      console.log('📍 No drag over position, calculating from last mouse position');
      dropPosition = calculateDropPosition(
        lastMousePositionRef.current.x,
        lastMousePositionRef.current.y
      );
      console.log('📍 Calculated drop position from mouse:', dropPosition);
    }

    // Validate drop position
    if (!dropPosition) {
      console.warn('⚠️ No valid drop position - files dropped outside grid');
      alert('Please drop files inside the grid cells');
      resetDragState();
      return;
    }

    // Validate drop position is within grid bounds
    const currentPage = activeConfig.profiles[currentProfileIndex]?.pages[currentPageIndex];
    if (!currentPage) {
      console.error('❌ No current page available');
      resetDragState();
      return;
    }

    if (dropPosition.row < 1 || dropPosition.row > currentPage.rows ||
        dropPosition.col < 1 || dropPosition.col > currentPage.cols) {
      console.warn('⚠️ Drop position out of grid bounds:', dropPosition);
      alert(`Drop position (${dropPosition.row}, ${dropPosition.col}) is outside grid bounds (${currentPage.rows}x${currentPage.cols})`);
      resetDragState();
      return;
    }

    console.log('✅ Valid drop position:', dropPosition);

    setProcessing(true);
    setDragging(false);

    try {
      console.log('📂 Processing dropped files at position:', dropPosition);
      console.log('📂 Full file paths:', filePaths);
      
      // Generate buttons for all dropped files
      const newButtons = [];
      let currentRow = dropPosition.row;
      let currentCol = dropPosition.col;
      
      for (const filePath of filePaths) {
        // Extract filename from path (handle both Windows and Unix paths)
        // Check for backslash first (Windows), then forward slash (Unix)
        const fileName = filePath.includes('\\') 
          ? (filePath.split('\\').pop() || 'Unknown')
          : (filePath.split('/').pop() || 'Unknown');
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

        console.log('📝 Creating button for file:', fileName);
        console.log('📝 File extension:', fileExtension);
        console.log('📝 Full path:', filePath);
        console.log('📍 Button position:', { row: currentRow, col: currentCol });

        // Determine action type based on file extension
        // .exe files → LaunchApp action
        // Other files → Open action
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        
        // Create button label (filename without extension)
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');

        // Extract icon from executable if it's an .exe file
        let iconPath: string | undefined = undefined;
        if (isExecutable) {
          try {
            console.log('🎨 Extracting icon from executable:', filePath);
            const iconInfo = await tauriAPI.extractExecutableIcon(filePath);
            
            if (iconInfo && iconInfo.path) {
              iconPath = iconInfo.path;
              console.log('✅ Icon extracted successfully:', iconPath);
            } else {
              console.log('⚠️ No icon extracted, will use default');
            }
          } catch (error) {
            console.error('❌ Failed to extract icon:', error);
            console.log('⚠️ Will use default icon');
          }
        }

        // Create button with proper structure matching ActionButton interface
        const newButton = {
          position: { row: currentRow, col: currentCol },
          action_type: actionType,
          label: buttonLabel,
          icon: iconPath, // Use extracted icon path or undefined for default
          config: isExecutable 
            ? { path: filePath } // LaunchApp config
            : { target: filePath }, // Open config
          style: undefined,
          action: undefined,
        };

        newButtons.push(newButton);
        console.log('✅ Button created:', newButton);

        // Move to next position (increment column, wrap to next row if needed)
        currentCol++;
        if (currentCol > currentPage.cols) {
          currentCol = 1;
          currentRow++;
          
          // Stop if we've exceeded the grid bounds
          if (currentRow > currentPage.rows) {
            console.warn('⚠️ Reached end of grid, stopping button generation');
            break;
          }
        }
      }

      if (newButtons.length === 0) {
        console.warn('⚠️ No buttons were generated');
        alert('No buttons could be created from the dropped files');
        return;
      }

      // Add buttons to configuration
      const newConfig = JSON.parse(JSON.stringify(activeConfig));
      const currentPageButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
      
      // Check for conflicts and remove existing buttons at the same positions
      for (const newButton of newButtons) {
        const existingButtonIndex = currentPageButtons.findIndex((btn: any) => 
          btn.position.row === newButton.position.row && 
          btn.position.col === newButton.position.col
        );
        
        if (existingButtonIndex !== -1) {
          console.log(`🔄 Replacing existing button at (${newButton.position.row}, ${newButton.position.col})`);
          currentPageButtons.splice(existingButtonIndex, 1);
        }
      }
      
      // Add all new buttons
      currentPageButtons.push(...newButtons);
      
      // Save configuration
      console.log('💾 Saving configuration...');
      await tauriAPI.saveConfig(newConfig);
      console.log('✅ Configuration saved successfully');
      
      // Update tempConfig if it exists
      if (tempConfig) {
        setTempConfig(newConfig);
      }
      
      console.log(`✅ Successfully added ${newButtons.length} button(s)`);
      
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      console.error('❌ Failed to process dropped files:', error);
      alert(`Failed to add button: ${error}`);
    } finally {
      setProcessing(false);
      resetDragState();
    }
  }, [tempConfig, config, currentProfileIndex, currentPageIndex, dragState.dragOverPosition, calculateDropPosition, setProcessing, setDragging, resetDragState, setTempConfig]);

  // Electron-specific file drop handler
  const handleElectronFileDrop = useCallback(async (filePaths: string[]) => {
    console.log('🔧 Electron file drop handler');
    await handleFileDrop(filePaths);
  }, [handleFileDrop]);

  // Tauri-specific file drop handler
  const handleTauriFileDrop = useCallback(async (filePaths: string[]) => {
    console.log('🔧 Tauri file drop handler');
    await handleFileDrop(filePaths);
  }, [handleFileDrop]);

  // HTML Drag and drop handlers (for visual feedback only)
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    console.log('🎯 HTML dragEnter event fired');
    event.preventDefault();
    event.stopPropagation();
    
    console.log('📋 DataTransfer types:', event.dataTransfer.types);
    const hasFiles = event.dataTransfer.types.includes('Files');
    
    if (hasFiles) {
      console.log('📥 Files detected in drag enter');
      setDragging(true);
    } else {
      console.log('⚠️ No files detected in drag enter');
    }
  }, [setDragging]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragging(false);
      setDragOverPosition(null);
      lastMousePositionRef.current = null;
    }
  }, [setDragging, setDragOverPosition]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const hasFiles = event.dataTransfer.types.includes('Files');
    
    if (hasFiles) {
      event.dataTransfer.dropEffect = 'copy';
      
      // Store mouse position for Tauri event and position calculation
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      lastMousePositionRef.current = {
        x: mouseX,
        y: mouseY,
      };
      
      // Calculate drop position using the enhanced function
      const dropPosition = calculateDropPosition(mouseX, mouseY);
      
      if (dropPosition) {
        // Update drag over position
        setDragOverPosition(dropPosition);
      } else {
        // Mouse is outside grid or in gap between cells
        setDragOverPosition(null);
      }
    }
  }, [calculateDropPosition, setDragOverPosition]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('📥 HTML drop event');
    
    // For Electron, handle the drop directly
    if (isElectron()) {
      console.log('🔧 Electron drop handler');
      
      const files = Array.from(event.dataTransfer.files);
      if (files.length === 0) {
        console.warn('⚠️ No files in drop event');
        resetDragState();
        return;
      }
      
      // Get full file paths from the dropped files
      // In Electron, the File object has a 'path' property that contains the full file path
      const filePaths = files.map(file => {
        const electronFile = file as File & { path?: string };
        const fullPath = electronFile.path;
        
        if (!fullPath) {
          console.warn('⚠️ File path not available for:', file.name);
          return file.name;
        }
        
        console.log('✅ Full file path extracted:', fullPath);
        return fullPath;
      });
      
      console.log('📁 All dropped file paths:', filePaths);
      
      // Verify all paths are full paths (contain : or start with /)
      const allFullPaths = filePaths.every(path => 
        path.includes(':') || path.startsWith('/')
      );
      
      if (!allFullPaths) {
        console.warn('⚠️ Some paths may not be full paths:', filePaths);
      } else {
        console.log('✅ All paths are full paths');
      }
      
      // Handle the file drop
      await handleElectronFileDrop(filePaths);
    } else {
      // For Tauri, the drop is handled by Tauri event listeners
      console.log('📥 Tauri will handle the drop');
    }
  }, [handleElectronFileDrop, resetDragState]);

  // Setup Tauri file drop listeners (only for Tauri, not Electron)
  useEffect(() => {
    console.log('🚀 GridDragDrop component mounted');
    
    // Skip Tauri listeners if running in Electron
    if (isElectron()) {
      console.log('🔧 Running in Electron - using HTML5 drag & drop');
      return;
    }
    
    let unlistenFileDrop: (() => void) | null = null;
    let unlistenFileDropHover: (() => void) | null = null;
    let unlistenFileDropCancelled: (() => void) | null = null;
    
    const setupFileDropListener = async () => {
      console.log('🔧 Setting up Tauri file drop listeners...');
      
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const currentWindow = getCurrentWindow();
        console.log('📱 Current window:', currentWindow.label);
        
        unlistenFileDropHover = await currentWindow.listen('tauri://file-drop-hover', (event) => {
          console.log('🎯 Tauri file drop hover event:', event);
          const filePaths = event.payload as string[];
          console.log('📁 Files hovering:', filePaths);
          setDragging(true);
        });
        console.log('✅ file-drop-hover listener registered');
        
        unlistenFileDrop = await currentWindow.listen('tauri://file-drop', (event) => {
          console.log('🎯 Tauri file drop event:', event);
          const filePaths = event.payload as string[];
          console.log('📁 Files dropped:', filePaths);
          handleTauriFileDrop(filePaths);
        });
        console.log('✅ file-drop listener registered');
        
        unlistenFileDropCancelled = await currentWindow.listen('tauri://file-drop-cancelled', (event) => {
          console.log('🎯 Tauri file drop cancelled event:', event);
          resetDragState();
        });
        console.log('✅ file-drop-cancelled listener registered');
        
        console.log('✅ All Tauri file drop listeners set up successfully');
      } catch (error) {
        console.error('❌ Failed to set up Tauri file drop listeners:', error);
      }
    };
    
    setupFileDropListener();
    
    return () => {
      console.log('🔄 GridDragDrop component unmounting, cleaning up listeners');
      if (unlistenFileDrop) unlistenFileDrop();
      if (unlistenFileDropHover) unlistenFileDropHover();
      if (unlistenFileDropCancelled) unlistenFileDropCancelled();
    };
  }, [handleTauriFileDrop, setDragging, resetDragState]);

  return (
    <>
      {children({
        dragState,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
      })}
    </>
  );
};

export default GridDragDrop;