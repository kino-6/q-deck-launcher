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

export const GridCell: React.FC<GridCellProps> = ({
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
  return (
    <motion.div
      key={index}
      className={`grid-cell ${button ? 'has-button' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${isDropTarget ? 'drop-target' : ''}`}
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
          className={`empty-cell ${isDropTarget ? 'drop-zone' : ''}`}
          onContextMenu={(e) => onEmptyCellContextMenu(e, row, col)}
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
};

export default GridCell;
