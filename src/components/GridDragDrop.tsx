import React, { useCallback, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { QDeckConfig, tauriAPI } from '../lib/platform-api';
import { useDragDrop } from '../hooks/useDragDrop';

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
    const gridElement = document.querySelector('.grid') as HTMLElement;
    if (!gridElement) return null;

    const gridCells = gridElement.querySelectorAll('.grid-cell');
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
        return { row, col };
      }
    }
    return null;
  }, []);

  // Tauri file drop handler
  const handleTauriFileDrop = useCallback(async (filePaths: string[]) => {
    console.log('🎯 Tauri file drop handler called');
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
    if (!dropPosition && lastMousePositionRef.current) {
      dropPosition = calculateDropPosition(
        lastMousePositionRef.current.x,
        lastMousePositionRef.current.y
      );
      console.log('📍 Calculated drop position from mouse:', dropPosition);
    }

    if (!dropPosition) {
      console.warn('⚠️ No drop position available - files dropped outside grid');
      resetDragState();
      return;
    }

    setProcessing(true);
    setDragging(false);

    try {
      console.log('📂 Processing dropped files at position:', dropPosition);
      console.log('📂 Full file paths:', filePaths);
      
      // For now, create a simple button for the first file
      // TODO: Implement full file analysis and button generation
      const currentPage = activeConfig.profiles[currentProfileIndex]?.pages[currentPageIndex];
      if (!currentPage) {
        console.error('❌ No current page available');
        return;
      }

      // Create a simple button from the first file
      const firstFilePath = filePaths[0];
      const fileName = firstFilePath.split('\\').pop() || firstFilePath.split('/').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

      console.log('📝 Creating button for file:', fileName);
      console.log('📝 File extension:', fileExtension);
      console.log('📝 Full path:', firstFilePath);

      // Determine action type based on file extension
      let actionType = 'open';
      if ([' exe', 'bat', 'cmd', 'ps1'].includes(fileExtension)) {
        actionType = 'launch_app';
      }

      const newButton = {
        label: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        position: dropPosition,
        action: {
          action_type: actionType,
          config: actionType === 'launch_app' 
            ? { type: 'LaunchApp', path: firstFilePath, args: null, workdir: null, env: null }
            : { type: 'Open', target: firstFilePath, verb: null }
        },
        style: {
          icon: null,
          background_color: null,
          text_color: null,
          font_size: null,
        },
      };

      // Add button to configuration
      const newConfig = JSON.parse(JSON.stringify(activeConfig));
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons.push(newButton);
      
      // Save configuration
      console.log('💾 Saving configuration...');
      await tauriAPI.saveConfig(newConfig);
      console.log('✅ Configuration saved successfully');
      
      // Update tempConfig if it exists
      if (tempConfig) {
        setTempConfig(newConfig);
      }
      
      console.log(`✅ Successfully added button for ${fileName}`);
      
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
      
      // Store mouse position for Tauri event
      lastMousePositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      
      // Calculate and update drag over position
      const target = event.target as HTMLElement;
      const gridCell = target.closest('.grid-cell') as HTMLElement;
      
      if (gridCell) {
        const row = parseInt(gridCell.dataset.row || '0');
        const col = parseInt(gridCell.dataset.col || '0');
        setDragOverPosition({ row, col });
      } else {
        setDragOverPosition(null);
      }
    }
  }, [setDragOverPosition]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    // Prevent default to allow Tauri event to handle the drop
    event.preventDefault();
    event.stopPropagation();
    
    console.log('📥 HTML drop event (will be handled by Tauri)');
    // Don't reset drag state here - let Tauri event handler do it
  }, []);

  // Setup Tauri file drop listeners
  useEffect(() => {
    console.log('🚀 GridDragDrop component mounted');
    let unlistenFileDrop: (() => void) | null = null;
    let unlistenFileDropHover: (() => void) | null = null;
    let unlistenFileDropCancelled: (() => void) | null = null;
    
    const setupFileDropListener = async () => {
      console.log('🔧 Setting up Tauri file drop listeners...');
      
      try {
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