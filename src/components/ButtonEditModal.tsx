import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionButton as ActionButtonType } from '../lib/platform-api';
import './ButtonEditModal.css';

export interface ButtonEditModalProps {
  button: ActionButtonType | null;
  onClose: () => void;
  onSave: (updatedButton: ActionButtonType) => Promise<void>;
}

export const ButtonEditModal: React.FC<ButtonEditModalProps> = ({
  button,
  onClose,
  onSave,
}) => {
  const [editedButton, setEditedButton] = useState<ActionButtonType | null>(null);

  useEffect(() => {
    if (button) {
      setEditedButton(JSON.parse(JSON.stringify(button)));
    }
  }, [button]);

  if (!button || !editedButton) {
    return null;
  }

  const handleSave = async () => {
    if (editedButton) {
      await onSave(editedButton);
      onClose();
    }
  };

  const updateStyle = (updates: Partial<ActionButtonType['style']>) => {
    setEditedButton({
      ...editedButton,
      style: {
        ...editedButton.style,
        ...updates,
      },
    });
  };

  const renderPreviewIcon = (icon: string) => {
    // Check if it's a short emoji or text
    if (icon.length <= 4 && !icon.includes('.') && !icon.includes('/') && !icon.includes('\\')) {
      return icon;
    }

    // Check if it's a URL or file path
    if (icon.startsWith('http') || icon.includes('.')) {
      const iconSrc = icon.startsWith('http') || icon.startsWith('file://') 
        ? icon 
        : `file://${icon}`;
      
      return (
        <img 
          src={iconSrc} 
          alt="Icon preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            maxWidth: '48px',
            maxHeight: '48px',
          }}
          onError={(e) => {
            // Fallback to emoji on error
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.textContent = '🚀';
          }}
        />
      );
    }

    // Default emoji
    return icon || '🚀';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="button-edit-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="button-edit-modal"
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
          <div className="button-edit-header">
            <h3>Edit Button: {button.label}</h3>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="button-edit-content">
            {/* Background Color */}
            <div className="edit-section">
              <label htmlFor="bg-color">Background Color</label>
              <div className="color-input-group">
                <input
                  id="bg-color"
                  type="color"
                  value={editedButton.style?.background_color || '#3b82f6'}
                  onChange={(e) => updateStyle({ background_color: e.target.value })}
                />
                <input
                  type="text"
                  value={editedButton.style?.background_color || '#3b82f6'}
                  onChange={(e) => updateStyle({ background_color: e.target.value })}
                  placeholder="#3b82f6"
                  className="color-text-input"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="edit-section">
              <label htmlFor="text-color">Text Color</label>
              <div className="color-input-group">
                <input
                  id="text-color"
                  type="color"
                  value={editedButton.style?.text_color || '#ffffff'}
                  onChange={(e) => updateStyle({ text_color: e.target.value })}
                />
                <input
                  type="text"
                  value={editedButton.style?.text_color || '#ffffff'}
                  onChange={(e) => updateStyle({ text_color: e.target.value })}
                  placeholder="#ffffff"
                  className="color-text-input"
                />
              </div>
            </div>

            {/* Font Size */}
            <div className="edit-section">
              <label htmlFor="font-size">Font Size (px)</label>
              <input
                id="font-size"
                type="number"
                min="8"
                max="48"
                value={editedButton.style?.font_size || 14}
                onChange={(e) => updateStyle({ font_size: parseInt(e.target.value) || 14 })}
                className="number-input"
              />
            </div>

            {/* Font Family */}
            <div className="edit-section">
              <label htmlFor="font-family">Font Family</label>
              <select
                id="font-family"
                value={editedButton.style?.font_family || 'inherit'}
                onChange={(e) => updateStyle({ font_family: e.target.value })}
                className="select-input"
              >
                <option value="inherit">Default</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                <option value="'Verdana', sans-serif">Verdana</option>
                <option value="'Georgia', serif">Georgia</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            {/* Custom Icon */}
            <div className="edit-section">
              <label htmlFor="custom-icon">Custom Icon</label>
              <div className="icon-input-group">
                <input
                  id="custom-icon"
                  type="text"
                  value={editedButton.icon || ''}
                  onChange={(e) => setEditedButton({ ...editedButton, icon: e.target.value })}
                  placeholder="Emoji, file path, or URL"
                  className="icon-text-input"
                />
                <button
                  type="button"
                  className="icon-file-button"
                  onClick={async () => {
                    try {
                      // Use HTML5 file input
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.png,.ico,.svg,.jpg,.jpeg';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Use the file path
                          const filePath = (file as any).path || file.name;
                          setEditedButton({ ...editedButton, icon: filePath });
                        }
                      };
                      input.click();
                    } catch (err) {
                      console.error('Failed to select icon file:', err);
                    }
                  }}
                >
                  📁 Browse
                </button>
              </div>
              <div className="icon-help-text">
                Enter an emoji (🚀), file path (C:\icons\app.png), or URL (https://example.com/icon.png)
              </div>
            </div>

            {/* Preview */}
            <div className="edit-section">
              <label>Preview</label>
              <div
                className="button-preview"
                style={{
                  backgroundColor: editedButton.style?.background_color || '#3b82f6',
                  color: editedButton.style?.text_color || '#ffffff',
                  fontSize: `${editedButton.style?.font_size || 14}px`,
                  fontFamily: editedButton.style?.font_family || 'inherit',
                }}
              >
                <div className="preview-icon">
                  {renderPreviewIcon(editedButton.icon || button.icon || '🚀')}
                </div>
                <div className="preview-label">{button.label}</div>
                <div className="preview-type">{button.action_type}</div>
              </div>
            </div>
          </div>

          <div className="button-edit-footer">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ButtonEditModal;
