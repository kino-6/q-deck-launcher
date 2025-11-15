import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ContextMenu.css';

interface ContextMenuProps {
  isVisible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTheme?: () => void;
  onAddButton?: () => void;
  onSettings: () => void;
  buttonLabel?: string;
  menuType?: 'button' | 'empty-cell' | 'grid-background';
  gridPosition?: { row: number; col: number } | null;
}

export const ContextMenu: React.FC<ContextMenuProps> = React.memo(({
  isVisible,
  x,
  y,
  onClose,
  onEdit,
  onDelete,
  onTheme,
  onAddButton,
  onSettings,
  buttonLabel,
  menuType = 'button',
  gridPosition
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Calculate adjusted position to keep menu within viewport
  const getAdjustedPosition = () => {
    if (!menuRef.current) return { x, y };
    
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Adjust horizontal position if menu would overflow right edge
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10; // 10px margin
    }
    
    // Adjust vertical position if menu would overflow bottom edge
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10; // 10px margin
    }
    
    // Ensure menu doesn't go off the left or top edge
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);
    
    return { x: adjustedX, y: adjustedY };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Force re-render after menu is mounted to adjust position
      if (menuRef.current) {
        const adjustedPos = getAdjustedPosition();
        menuRef.current.style.left = `${adjustedPos.x}px`;
        menuRef.current.style.top = `${adjustedPos.y}px`;
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose, x, y]);

  if (!isVisible) return null;

  const adjustedPosition = getAdjustedPosition();

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="context-menu"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        {(buttonLabel || gridPosition) && (
          <div className="context-menu-header">
            <span className="context-menu-title">
              {buttonLabel || (gridPosition ? `セル (${gridPosition.row}, ${gridPosition.col})` : 'グリッド')}
            </span>
          </div>
        )}
        
        <div className="context-menu-items">
          {/* Button-specific actions */}
          {menuType === 'button' && (
            <>
              {onEdit && (
                <button
                  className="context-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    onClose();
                  }}
                >
                  <span className="context-menu-icon">✏️</span>
                  <span className="context-menu-text">編集</span>
                </button>
              )}
              
              {onTheme && (
                <button
                  className="context-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTheme();
                    onClose();
                  }}
                >
                  <span className="context-menu-icon">🎨</span>
                  <span className="context-menu-text">テーマ変更</span>
                </button>
              )}

              {onDelete && (
                <button
                  className="context-menu-item delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    onClose();
                  }}
                >
                  <span className="context-menu-icon">🗑️</span>
                  <span className="context-menu-text">削除</span>
                </button>
              )}
              
              <div className="context-menu-separator"></div>
            </>
          )}

          {/* Empty cell actions */}
          {menuType === 'empty-cell' && (
            <>
              {onAddButton && (
                <button
                  className="context-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddButton();
                    onClose();
                  }}
                >
                  <span className="context-menu-icon">➕</span>
                  <span className="context-menu-text">ボタンを追加</span>
                </button>
              )}
              
              <div className="context-menu-separator"></div>
            </>
          )}

          {/* Grid background actions */}
          {menuType === 'grid-background' && (
            <>
              <button
                className="context-menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement add button at next available position
                  console.log('Add button at next available position');
                  onClose();
                }}
              >
                <span className="context-menu-icon">➕</span>
                <span className="context-menu-text">ボタンを追加</span>
              </button>
              
              <div className="context-menu-separator"></div>
            </>
          )}
          
          {/* Common actions */}
          <button
            className="context-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              onSettings();
              onClose();
            }}
          >
            <span className="context-menu-icon">⚙️</span>
            <span className="context-menu-text">
              {menuType === 'button' ? 'グリッド設定' : '設定'}
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;