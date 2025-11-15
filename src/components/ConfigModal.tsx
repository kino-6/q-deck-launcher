import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QDeckConfig } from '../lib/platform-api';

export interface ConfigModalProps {
  showConfig: boolean;
  tempConfig: QDeckConfig | null;
  config: QDeckConfig | undefined;
  currentProfileIndex: number;
  currentPageIndex: number;
  onClose: () => void;
  onSave: () => Promise<void>;
  onUpdateGridSize: (rows: number, cols: number) => Promise<void>;
  onUpdateThemeColor: (color: string) => Promise<void>;
  onUndo: () => Promise<void>;
}

export const ConfigModal: React.FC<ConfigModalProps> = React.memo(({
  showConfig,
  tempConfig,
  config,
  currentProfileIndex,
  currentPageIndex,
  onClose,
  onSave,
  onUpdateGridSize,
  onUpdateThemeColor,
  onUndo,
}) => {
  // Memoize grid size options
  const gridSizeOptions = React.useMemo(() => [
    { rows: 2, cols: 4, label: '2×4' },
    { rows: 3, cols: 4, label: '3×4' },
    { rows: 3, cols: 6, label: '3×6' },
    { rows: 4, cols: 6, label: '4×6' },
    { rows: 4, cols: 8, label: '4×8' },
    { rows: 5, cols: 8, label: '5×8' },
  ], []);

  // Memoize theme options
  const themeOptions = React.useMemo(() => [
    { value: 'dark', label: 'Dark', color: '#1e1e1e' },
    { value: 'blue', label: 'Blue', color: '#1e3a8a' },
    { value: 'green', label: 'Green', color: '#166534' },
    { value: 'purple', label: 'Purple', color: '#7c3aed' },
    { value: 'red', label: 'Red', color: '#dc2626' },
    { value: 'orange', label: 'Orange', color: '#ea580c' },
  ], []);

  // Memoize current page
  const currentPage = React.useMemo(
    () => tempConfig?.profiles?.[currentProfileIndex]?.pages?.[currentPageIndex],
    [tempConfig, currentProfileIndex, currentPageIndex]
  );

  return (
    <AnimatePresence>
      {showConfig && tempConfig && config && (
        <motion.div
          className="config-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            console.log('Overlay clicked');
            onClose();
          }}
        >
          <motion.div
            className="config-modal"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }
            }}
            tabIndex={-1}
          >
            <div className="config-header">
              <h3>Grid Settings</h3>
              <button 
                className="close-button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Close button clicked');
                  onClose();
                }}
              >
                ×
              </button>
            </div>

            <div className="config-content">
              {/* Grid Size Selection */}
              <div className="config-section">
                <h4>Grid Size</h4>
                <div className="grid-size-options">
                  {gridSizeOptions.map(({ rows, cols, label }) => (
                    <button
                      key={label}
                      className={`size-option ${
                        currentPage?.rows === rows && currentPage?.cols === cols
                          ? 'active' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Grid size button clicked:', rows, cols);
                        onUpdateGridSize(rows, cols);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color Selection */}
              <div className="config-section">
                <h4>Theme</h4>
                <div className="theme-options">
                  {themeOptions.map(({ value, label, color }) => (
                    <button
                      key={value}
                      className={`theme-option ${tempConfig?.ui?.window?.theme === value ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Theme button clicked:', value);
                        onUpdateThemeColor(value);
                      }}
                      title={label}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="config-footer">
              <button className="undo-button" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Undo button clicked');
                onUndo();
              }}>
                Undo Last
              </button>
              <button className="cancel-button" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked');
                onClose();
              }}>
                Cancel
              </button>
              <button className="save-button" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Save button clicked');
                onSave();
              }}>
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ConfigModal.displayName = 'ConfigModal';

export default ConfigModal;
