import { useCallback, useRef } from 'react';
import { useDragDrop } from './useDragDrop';
import { logger } from '../utils/logger';

/**
 * Hook for managing drag state and HTML drag event handlers
 * Handles visual feedback during drag operations
 */
export const useDragState = (calculateDropPosition: (x: number, y: number) => { row: number; col: number } | null) => {
  const { dragState, setDragging, setDragOverPosition, resetDragState } = useDragDrop();
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Handle drag enter event - sets dragging state when files are detected
   */
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    logger.log('HTML dragEnter event fired');
    event.preventDefault();
    event.stopPropagation();
    
    const hasFiles = event.dataTransfer.types.includes('Files');
    
    if (hasFiles) {
      logger.log('Files detected in drag enter');
      setDragging(true);
    }
  }, [setDragging]);

  /**
   * Handle drag leave event - resets state when drag leaves grid area
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Check if mouse has actually left the grid area
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      logger.log('Drag left grid area - resetting drag state');
      setDragging(false);
      setDragOverPosition(null);
      lastMousePositionRef.current = null;
    }
  }, [setDragging, setDragOverPosition]);

  /**
   * Handle drag over event - updates drop position and mouse coordinates
   */
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

  return {
    dragState,
    lastMousePositionRef,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    resetDragState,
  };
};
