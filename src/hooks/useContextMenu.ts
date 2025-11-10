import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

export interface ContextMenuState {
  isVisible: boolean;
  x: number;
  y: number;
  button: ActionButtonType | null;
  gridPosition: { row: number; col: number } | null;
  menuType: 'button' | 'empty-cell' | 'grid-background';
}

export interface UseContextMenuReturn {
  contextMenu: ContextMenuState;
  handleContextMenu: (event: React.MouseEvent, button: ActionButtonType) => void;
  handleEmptyCellContextMenu: (event: React.MouseEvent, row: number, col: number) => void;
  handleGridBackgroundContextMenu: (event: React.MouseEvent) => void;
  closeContextMenu: () => void;
}

export const useContextMenu = (): UseContextMenuReturn => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    x: 0,
    y: 0,
    button: null,
    gridPosition: null,
    menuType: 'grid-background',
  });

  // Handle context menu for buttons
  const handleContextMenu = useCallback((event: React.MouseEvent, button: ActionButtonType) => {
    logger.log('Context menu requested for button:', button.label);
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
    logger.log('Context menu requested for empty cell:', row, col);
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
    logger.log('Context menu requested for grid background');
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

  return {
    contextMenu,
    handleContextMenu,
    handleEmptyCellContextMenu,
    handleGridBackgroundContextMenu,
    closeContextMenu,
  };
};

