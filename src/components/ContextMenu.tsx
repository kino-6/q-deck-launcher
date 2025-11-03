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
  onSettings: () => void;
  buttonLabel?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  x,
  y,
  onClose,
  onEdit,
  onDelete,
  onSettings,
  buttonLabel
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="context-menu"
        style={{
          left: x,
          top: y,
        }}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        {buttonLabel && (
          <div className="context-menu-header">
            <span className="context-menu-title">{buttonLabel}</span>
          </div>
        )}
        
        <div className="context-menu-items">
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
          
          <button
            className="context-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              onSettings();
              onClose();
            }}
          >
            <span className="context-menu-icon">⚙️</span>
            <span className="context-menu-text">設定</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;