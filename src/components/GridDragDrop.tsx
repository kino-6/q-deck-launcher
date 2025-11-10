import React, { useCallback } from 'react';
import { QDeckConfig } from '../lib/platform-api';
import { useDragState } from '../hooks/useDragState';
import { useFileDrop } from '../hooks/useFileDrop';
import { calculateDropPosition } from '../utils/dropPositionCalculator';

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
  console.log('🚀🚀🚀 GridDragDrop component mounted/rendered');

  // Memoize the drop position calculator
  const calculatePosition = useCallback(calculateDropPosition, []);

  // Use drag state hook for visual feedback
  const {
    dragState,
    lastMousePositionRef,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
  } = useDragState(calculatePosition);

  // Use file drop hook for processing dropped files
  const { handleDrop } = useFileDrop({
    config,
    tempConfig,
    setTempConfig,
    currentProfileIndex,
    currentPageIndex,
    dragOverPosition: dragState.dragOverPosition,
    lastMousePosition: lastMousePositionRef.current,
    calculateDropPosition: calculatePosition,
  });

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
