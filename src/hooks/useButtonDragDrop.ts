/**
 * Hook for handling button drag and drop to swap positions
 */

import { useState, useCallback } from 'react';
import { ActionButton } from '../lib/platform-api';

interface DragState {
  isDragging: boolean;
  draggedButton: ActionButton | null;
  draggedPosition: { row: number; col: number } | null;
  dropTargetPosition: { row: number; col: number } | null;
}

export function useButtonDragDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedButton: null,
    draggedPosition: null,
    dropTargetPosition: null,
  });

  const handleButtonDragStart = useCallback((button: ActionButton, row: number, col: number) => {
    console.log('🔄 Button drag started:', button.label, `(${row}, ${col})`);
    setDragState({
      isDragging: true,
      draggedButton: button,
      draggedPosition: { row, col },
      dropTargetPosition: null,
    });
  }, []);

  const handleButtonDragOver = useCallback((row: number, col: number) => {
    setDragState(prev => ({
      ...prev,
      dropTargetPosition: { row, col },
    }));
  }, []);

  const handleButtonDragEnd = useCallback(() => {
    console.log('🔄 Button drag ended');
    setDragState({
      isDragging: false,
      draggedButton: null,
      draggedPosition: null,
      dropTargetPosition: null,
    });
  }, []);

  return {
    dragState,
    handleButtonDragStart,
    handleButtonDragOver,
    handleButtonDragEnd,
  };
}
