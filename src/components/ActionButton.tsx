import React from 'react';
import { motion } from 'framer-motion';
import { ActionButton as ActionButtonType, tauriAPI } from '../lib/tauri';
import './ActionButton.css';

interface ActionButtonProps {
  button: ActionButtonType;
  dpiScale?: number;
  screenInfo?: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    pixelRatio: number;
  };
  onSystemAction?: (action: string) => void;
  onContextMenu?: (event: React.MouseEvent, button: ActionButtonType) => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ button, dpiScale = 1, screenInfo, onSystemAction, onContextMenu }) => {
  const handleClick = async () => {
    try {
      console.log('ActionButton clicked:', button.label, button.action);
      
      // Handle system actions
      if (button.action?.action_type === 'system' && onSystemAction && button.action.system_action) {
        console.log('Executing system action:', button.action.system_action);
        onSystemAction(button.action.system_action);
        return;
      }
      
      console.log('Executing action:', button.action_type, button.config);
      // TODO: Implement actual action execution in task 5
      await tauriAPI.executeAction(`${button.action_type}:${JSON.stringify(button.config)}`);
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  };

  const getActionIcon = () => {
    if (button.icon) {
      return button.icon;
    }
    
    // System action icons
    if (button.action?.action_type === 'system') {
      switch (button.action.system_action) {
        case 'config':
          return '⚙️';
        case 'back':
        case 'exit_config':
          return '←';
        case 'hide_overlay':
          return '❌';
        case 'toggle_overlay':
          return '🔄';
        default:
          return '🔧';
      }
    }
    
    // Default icons based on action type
    switch (button.action_type) {
      case 'LaunchApp':
        return '🚀';
      case 'Open':
        return '📂';
      case 'Terminal':
        return '💻';
      case 'SendKeys':
        return '⌨️';
      case 'PowerShell':
        return '🔧';
      case 'Folder':
        return '📁';
      case 'MultiAction':
        return '⚡';
      default:
        return '❓';
    }
  };

  const getButtonStyle = () => {
    const baseStyle: React.CSSProperties & Record<string, string> = {
      '--dpi-scale': dpiScale.toString(),
    };
    
    if (button.style) {
      if (button.style.background_color) {
        baseStyle.backgroundColor = button.style.background_color;
      }
      if (button.style.text_color) {
        baseStyle.color = button.style.text_color;
      }
      if (button.style.font_size) {
        // Apply DPI scaling to custom font sizes
        const scaledFontSize = button.style.font_size * Math.min(dpiScale, 1.5);
        baseStyle.fontSize = `${scaledFontSize}px`;
      }
      if (button.style.font_family) {
        baseStyle.fontFamily = button.style.font_family;
      }
    }
    
    // Add screen info for debugging (can be removed in production)
    if (screenInfo) {
      baseStyle['--screen-width'] = `${screenInfo.width}px`;
      baseStyle['--screen-height'] = `${screenInfo.height}px`;
      baseStyle['--pixel-ratio'] = screenInfo.pixelRatio.toString();
    }
    
    return baseStyle;
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    console.log('ActionButton: Right click detected on button:', button.label);
    event.preventDefault();
    event.stopPropagation();
    if (onContextMenu) {
      console.log('ActionButton: Calling onContextMenu callback');
      onContextMenu(event, button);
    } else {
      console.log('ActionButton: No onContextMenu callback provided');
    }
  };

  return (
    <motion.button
      className="action-button"
      style={getButtonStyle()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      initial={{ scale: 1, rotateZ: 0 }}
      whileHover={{ 
        scale: 1.05, 
        rotateZ: 1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95, 
        rotateZ: 0,
        transition: { duration: 0.1 }
      }}
      title={`${button.label} (${button.action?.action_type === 'system' ? button.action.system_action : button.action_type})`}
      data-system-action={button.action?.action_type === 'system' ? button.action.system_action : undefined}
    >
      <div className="button-icon">
        {getActionIcon()}
      </div>
      <div className="button-label">
        {button.label}
      </div>
      <div className="button-type">
        {button.action_type}
      </div>
    </motion.button>
  );
};

export default ActionButton;