import React from 'react';
import { motion } from 'framer-motion';
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
  onSystemAction?: (action: string) => void;
  onContextMenu: (event: React.MouseEvent, button: ActionButtonType) => void;
  onEmptyCellContextMenu: (event: React.MouseEvent, row: number, col: number) => void;
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
  onSystemAction,
  onContextMenu,
  onEmptyCellContextMenu,
}) => {
  // Memoize className to avoid string concatenation on every render
  const cellClassName = React.useMemo(
    () => `grid-cell ${button ? 'has-button' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDropTarget ? 'drop-target' : ''}`,
    [button, isDragOver, isDropTarget]
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

  return (
    <motion.div
      key={index}
      className={cellClassName}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: isDragOver ? 1.05 : 1, 
        y: 0,
        transition: { duration: 0.15 }
      }}
      data-row={row}
      data-col={col}
    >
      {button ? (
        <ActionButton 
          button={button}
          dpiScale={dpiScale}
          screenInfo={screenInfo}
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
    </motion.div>
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
    prevProps.onSystemAction === nextProps.onSystemAction &&
    prevProps.onContextMenu === nextProps.onContextMenu &&
    prevProps.onEmptyCellContextMenu === nextProps.onEmptyCellContextMenu
  );
});

GridCell.displayName = 'GridCell';

export default GridCell;
