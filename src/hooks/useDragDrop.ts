import { useState, useCallback } from 'react';

export interface DragDropState {
  isDragging: boolean;
  dragOverPosition: { row: number; col: number } | null;
  draggedFiles: string[];
  isProcessing: boolean;
}

export const useDragDrop = () => {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    dragOverPosition: null,
    draggedFiles: [],
    isProcessing: false,
  });

  const setDragging = useCallback((isDragging: boolean) => {
    setDragState(prev => ({ ...prev, isDragging }));
  }, []);

  const setDragOverPosition = useCallback((position: { row: number; col: number } | null) => {
    setDragState(prev => ({ ...prev, dragOverPosition: position }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setDragState(prev => ({ ...prev, isProcessing }));
  }, []);

  const resetDragState = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOverPosition: null,
      draggedFiles: [],
      isProcessing: false,
    });
  }, []);

  return {
    dragState,
    setDragging,
    setDragOverPosition,
    setProcessing,
    resetDragState,
  };
};