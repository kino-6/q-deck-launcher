import React from 'react';
import ActionButton from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';
import { ScreenInfo } from '../hooks/useScreenInfo';

export interface GridCellProps {
  index: number;
  row: number;
  col: number;
  button: ActionButtonType | undefined;
  isDragOver: boolean;
  isDropTarget: boolean;
  dpiScale: number;
  screenInfo: ScreenInfo;
  shortcutNumber?: string | null;
  onSystemAction?: (action: string) => void;
  onContextMenu: (event: React.MouseEvent, button: ActionButtonType) => void;
  onEmptyCellContextMenu: (event: React.MouseEvent, row: number, col: number) => void;
  onButtonDragStart?: (button: ActionButtonType, row: number, col: number) => void;
  onButtonDragOver?: (row: number, col: number) => void;
  onButtonDrop?: (row: number, col: number) => void;
  isBeingDragged?: boolean;
}

export const GridCell: React.FC<GridCellProps> = React.memo(({
  index,
  row,
  col,
  button,
  isDragOver,
  isDropTarget,
  dpiScale,
  screenInfo,
  shortcutNumber,
  onSystemAction,
  onContextMenu,
  onEmptyCellContextMenu,
  onButtonDragStart,
  onButtonDragOver,
  onButtonDrop,
  isBeingDragged = false,
}) => {
  // Memoize className to avoid string concatenation on every render
  const cellClassName = React.useMemo(
    () => `grid-cell ${button ? 'has-button' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDropTarget ? 'drop-target' : ''} ${isBeingDragged ? 'being-dragged' : ''}`,
    [button, isDragOver, isDropTarget, isBeingDragged]
  );

  // Memoize empty cell className
  const emptyCellClassName = React.useMemo(
    () => `empty-cell ${isDropTarget ? 'drop-zone' : ''}`,
    [isDropTarget]
  );

  // Memoize empty cell context menu handler
  const handleEmptyCellContextMenu = React.useCallback(
    (e: React.MouseEvent) => onEmptyCellContextMenu(e, row, col),
    [onEmptyCellContextMenu, row, col]
  );

  // Handle button drag start
  const handleDragStart = React.useCallback((e: React.DragEvent) => {
    if (button && onButtonDragStart) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
      onButtonDragStart(button, row, col);
    }
  }, [button, row, col, onButtonDragStart]);

  // Handle drag over
  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onButtonDragOver) {
      onButtonDragOver(row, col);
    }
  }, [row, col, onButtonDragOver]);

  // Handle drop
  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (onButtonDrop) {
      onButtonDrop(row, col);
    }
  }, [row, col, onButtonDrop]);

  return (
    <div
      key={index}
      className={cellClassName}
      style={{
        opacity: isBeingDragged ? 0.5 : 1,
        transform: isDragOver ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.15s ease',
      }}
      data-row={row}
      data-col={col}
      draggable={!!button}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {button ? (
        <ActionButton 
          button={button}
          dpiScale={dpiScale}
          screenInfo={screenInfo}
          shortcutNumber={shortcutNumber}
          onSystemAction={button.action?.action_type === 'system' ? onSystemAction : undefined}
          onContextMenu={onContextMenu}
        />
      ) : (
        <div 
          className={emptyCellClassName}
          onContextMenu={handleEmptyCellContextMenu}
        >
          {isDropTarget && (
            <div className="drop-indicator">
              <span>{button ? '🔄' : '📁'}</span>
              <span>{button ? 'Replace button' : 'Drop files here'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  return (
    prevProps.index === nextProps.index &&
    prevProps.row === nextProps.row &&
    prevProps.col === nextProps.col &&
    prevProps.button === nextProps.button &&
    prevProps.isDragOver === nextProps.isDragOver &&
    prevProps.isDropTarget === nextProps.isDropTarget &&
    prevProps.dpiScale === nextProps.dpiScale &&
    prevProps.screenInfo === nextProps.screenInfo &&
    prevProps.shortcutNumber === nextProps.shortcutNumber &&
    prevProps.onSystemAction === nextProps.onSystemAction &&
    prevProps.onContextMenu === nextProps.onContextMenu &&
    prevProps.onEmptyCellContextMenu === nextProps.onEmptyCellContextMenu &&
    prevProps.onButtonDragStart === nextProps.onButtonDragStart &&
    prevProps.onButtonDragOver === nextProps.onButtonDragOver &&
    prevProps.onButtonDrop === nextProps.onButtonDrop &&
    prevProps.isBeingDragged === nextProps.isBeingDragged
  );
});

GridCell.displayName = 'GridCell';

export default GridCell;
