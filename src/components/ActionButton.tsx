import React from 'react';
import { motion } from 'framer-motion';
import { ActionButton as ActionButtonType, tauriAPI } from '../lib/tauri';
import './ActionButton.css';

interface ActionButtonProps {
  button: ActionButtonType;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ button }) => {
  const handleClick = async () => {
    try {
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
    const baseStyle: React.CSSProperties = {};
    
    if (button.style) {
      if (button.style.background_color) {
        baseStyle.backgroundColor = button.style.background_color;
      }
      if (button.style.text_color) {
        baseStyle.color = button.style.text_color;
      }
      if (button.style.font_size) {
        baseStyle.fontSize = `${button.style.font_size}px`;
      }
      if (button.style.font_family) {
        baseStyle.fontFamily = button.style.font_family;
      }
    }
    
    return baseStyle;
  };

  return (
    <motion.button
      className="action-button"
      style={getButtonStyle()}
      onClick={handleClick}
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
      title={`${button.label} (${button.action_type})`}
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