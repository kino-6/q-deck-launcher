import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ActionButton as ActionButtonType, tauriAPI, IconInfo } from '../lib/platform-api';
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
  const [processedIcon, setProcessedIcon] = useState<IconInfo | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);
  const [labelFontSize, setLabelFontSize] = useState<number | null>(null);
  const [typeFontSize, setTypeFontSize] = useState<number | null>(null);
  
  const labelRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dynamic font size adjustment function
  const adjustTextSize = useCallback(() => {
    if (!labelRef.current || !typeRef.current || !buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const availableWidth = buttonRect.width - 16; // Account for padding
    const availableHeight = buttonRect.height;

    // Calculate base font sizes based on DPI and screen info
    const baseLabelSize = 0.75 * Math.min(dpiScale, 1.6) * (screenInfo ? getScreenScaleFactor(screenInfo) : 1);
    const baseTypeSize = 0.6 * Math.min(dpiScale, 1.4) * (screenInfo ? getScreenScaleFactor(screenInfo) : 1);

    // Adjust label font size
    const labelText = button.label;
    const maxLabelSize = baseLabelSize * 16; // Convert to pixels
    const minLabelSize = Math.max(8, maxLabelSize * 0.6); // Minimum readable size
    
    let optimalLabelSize = maxLabelSize;
    
    // Create a temporary element to measure text
    const tempLabel = document.createElement('div');
    tempLabel.style.position = 'absolute';
    tempLabel.style.visibility = 'hidden';
    tempLabel.style.whiteSpace = 'nowrap';
    tempLabel.style.fontFamily = window.getComputedStyle(labelRef.current).fontFamily;
    tempLabel.style.fontWeight = window.getComputedStyle(labelRef.current).fontWeight;
    tempLabel.textContent = labelText;
    document.body.appendChild(tempLabel);

    // Binary search for optimal font size
    let low = minLabelSize;
    let high = maxLabelSize;
    
    while (high - low > 1) {
      const mid = (low + high) / 2;
      tempLabel.style.fontSize = `${mid}px`;
      
      if (tempLabel.offsetWidth <= availableWidth) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    optimalLabelSize = low;
    document.body.removeChild(tempLabel);

    // Adjust type font size similarly
    const typeText = button.action_type;
    const maxTypeSize = baseTypeSize * 16;
    const minTypeSize = Math.max(6, maxTypeSize * 0.7);
    
    let optimalTypeSize = maxTypeSize;
    
    const tempType = document.createElement('div');
    tempType.style.position = 'absolute';
    tempType.style.visibility = 'hidden';
    tempType.style.whiteSpace = 'nowrap';
    tempType.style.fontFamily = window.getComputedStyle(typeRef.current).fontFamily;
    tempType.style.fontWeight = window.getComputedStyle(typeRef.current).fontWeight;
    tempType.style.textTransform = 'uppercase';
    tempType.style.letterSpacing = '0.2px';
    tempType.textContent = typeText;
    document.body.appendChild(tempType);

    low = minTypeSize;
    high = maxTypeSize;
    
    while (high - low > 1) {
      const mid = (low + high) / 2;
      tempType.style.fontSize = `${mid}px`;
      
      if (tempType.offsetWidth <= availableWidth) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    optimalTypeSize = low;
    document.body.removeChild(tempType);

    setLabelFontSize(optimalLabelSize);
    setTypeFontSize(optimalTypeSize);
  }, [button.label, button.action_type, dpiScale, screenInfo]);

  // Helper function to get screen scale factor
  const getScreenScaleFactor = (screenInfo: any): number => {
    const screenArea = screenInfo.width * screenInfo.height;
    const isLargeScreen = screenArea > (2560 * 1440);
    const isSmallScreen = screenArea < (1366 * 768);
    
    if (isLargeScreen) return 1.1;
    if (isSmallScreen) return 0.9;
    return 1.0;
  };

  // Adjust text size when component mounts or dependencies change
  useEffect(() => {
    const timer = setTimeout(adjustTextSize, 100); // Small delay to ensure DOM is ready
    return () => clearTimeout(timer);
  }, [adjustTextSize]);

  // Re-adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      adjustTextSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustTextSize]);

  // Process icon when button or icon changes
  useEffect(() => {
    const processButtonIcon = async () => {
      if (!button.icon) {
        setProcessedIcon(null);
        return;
      }

      try {
        setIconError(null);
        
        // Determine fallback executable for icon extraction
        let fallbackExecutable: string | undefined;
        if (button.action_type === 'LaunchApp' && button.config.path) {
          fallbackExecutable = button.config.path as string;
        }

        const iconInfo = await tauriAPI.processIcon(button.icon, fallbackExecutable);
        setProcessedIcon(iconInfo);
      } catch (error) {
        console.warn('Failed to process icon:', error);
        setIconError(error as string);
        setProcessedIcon(null);
      }
    };

    processButtonIcon();
  }, [button.icon, button.action_type, button.config.path]);

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
      // Pass the full action configuration to the backend
      const actionConfig = {
        type: button.action_type,
        label: button.label,
        ...button.config
      };
      await tauriAPI.executeAction(actionConfig);
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  };

  const getActionIcon = () => {
    // If we have a processed icon, use it
    if (processedIcon) {
      switch (processedIcon.icon_type) {
        case 'Emoji':
          return processedIcon.path;
        case 'File':
        case 'Extracted':
        case 'Base64':
          if (processedIcon.data_url) {
            return (
              <img 
                src={processedIcon.data_url} 
                alt={button.label}
                className="button-icon-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onError={() => {
                  console.warn('Failed to load processed icon image');
                  setIconError('Failed to load icon image');
                }}
              />
            );
          } else if (processedIcon.path) {
            // For extracted icons, use file:// protocol
            const iconSrc = processedIcon.path.startsWith('file://') 
              ? processedIcon.path 
              : `file://${processedIcon.path}`;
            return (
              <img 
                src={iconSrc} 
                alt={button.label}
                className="button-icon-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onError={() => {
                  console.warn('Failed to load extracted icon:', iconSrc);
                  setIconError('Failed to load icon image');
                }}
              />
            );
          }
          break;
        case 'Url':
          return (
            <img 
              src={processedIcon.path} 
              alt={button.label}
              className="button-icon-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={() => {
                console.warn('Failed to load URL icon');
                setIconError('Failed to load URL icon');
              }}
            />
          );
      }
    }

    // Fallback to original icon if processing failed or is in progress
    if (button.icon && !iconError) {
      // Check if it's a simple emoji or text icon
      if (button.icon.length <= 4) { // Likely an emoji
        return button.icon;
      }
      
      // Check if it's a file path or URL
      if (button.icon.startsWith('http') || button.icon.includes('.')) {
        // For file paths, use file:// protocol
        const iconSrc = button.icon.startsWith('http') || button.icon.startsWith('file://') 
          ? button.icon 
          : `file://${button.icon}`;
        return (
          <img 
            src={iconSrc} 
            alt={button.label}
            className="button-icon-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={() => setIconError('Failed to load icon')}
          />
        );
      }
      
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
      '--effective-dpi': Math.min(dpiScale, 2.5).toString(),
    };
    
    // Enhanced custom styling with DPI awareness
    if (button.style) {
      // Background color and gradient
      if (button.style.background_color) {
        if (button.style.gradient?.enabled) {
          // Custom gradient
          const gradient = button.style.gradient;
          const gradientStops = gradient.colors.map(stop => 
            `${stop.color} ${stop.position}%`
          ).join(', ');
          baseStyle.background = `linear-gradient(${gradient.direction}deg, ${gradientStops})`;
        } else {
          // Simple color with auto-gradient
          const color = button.style.background_color;
          baseStyle.background = `linear-gradient(135deg, ${color} 0%, ${adjustColorOpacity(color, 0.7)} 100%)`;
        }
      }
      
      // Text color
      if (button.style.text_color) {
        baseStyle.color = button.style.text_color;
      }
      
      // Font settings
      if (button.style.font_size) {
        const scaledFontSize = button.style.responsive_font_scaling !== false 
          ? button.style.font_size * Math.min(dpiScale, 1.8)
          : button.style.font_size;
        baseStyle.fontSize = `${scaledFontSize}px`;
        baseStyle['--custom-font-size'] = `${scaledFontSize}px`;
      }
      
      // Apply dynamic font sizes if calculated
      if (labelFontSize) {
        baseStyle['--dynamic-label-size'] = `${labelFontSize}px`;
      }
      if (typeFontSize) {
        baseStyle['--dynamic-type-size'] = `${typeFontSize}px`;
      }
      
      if (button.style.font_family) {
        baseStyle.fontFamily = button.style.font_family;
      }
      
      // Border customization
      if (button.style.border_color) {
        baseStyle.borderColor = button.style.border_color;
      }
      
      if (button.style.border_width !== undefined) {
        baseStyle.borderWidth = `${button.style.border_width}px`;
      }
      
      if (button.style.border_radius !== undefined) {
        baseStyle.borderRadius = `${button.style.border_radius}px`;
      }
      
      // Shadow effects
      if (button.style.shadow?.enabled) {
        const shadow = button.style.shadow;
        const shadowValue = `${shadow.offset_x}px ${shadow.offset_y}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`;
        baseStyle.boxShadow = shadowValue;
      }
      
      // Animation settings
      if (button.style.animation) {
        const anim = button.style.animation;
        if (anim.transition_duration !== undefined) {
          baseStyle.transitionDuration = `${anim.transition_duration}ms`;
        }
        if (anim.hover_scale !== undefined) {
          baseStyle['--hover-scale'] = anim.hover_scale.toString();
        }
        if (anim.hover_rotation !== undefined) {
          baseStyle['--hover-rotation'] = `${anim.hover_rotation}deg`;
        }
        if (anim.click_scale !== undefined) {
          baseStyle['--click-scale'] = anim.click_scale.toString();
        }
      }
    }
    
    // Enhanced screen info and responsive variables
    if (screenInfo) {
      baseStyle['--screen-width'] = `${screenInfo.width}px`;
      baseStyle['--screen-height'] = `${screenInfo.height}px`;
      baseStyle['--screen-avail-width'] = `${screenInfo.availWidth}px`;
      baseStyle['--screen-avail-height'] = `${screenInfo.availHeight}px`;
      baseStyle['--pixel-ratio'] = screenInfo.pixelRatio.toString();
      baseStyle['--dpi-category'] = getDPICategory(screenInfo.pixelRatio);
      
      // Responsive font scaling based on screen size
      const screenArea = screenInfo.width * screenInfo.height;
      const isLargeScreen = screenArea > (2560 * 1440);
      const isSmallScreen = screenArea < (1366 * 768);
      
      if (isLargeScreen) {
        baseStyle['--font-scale-modifier'] = '1.1';
      } else if (isSmallScreen) {
        baseStyle['--font-scale-modifier'] = '0.9';
      } else {
        baseStyle['--font-scale-modifier'] = '1.0';
      }
    }
    
    return baseStyle;
  };

  // Helper function to adjust color opacity
  const adjustColorOpacity = (color: string, opacity: number): string => {
    // Simple opacity adjustment for hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // For rgba colors, adjust the alpha value
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    return color;
  };

  // Helper function to categorize DPI (same as in Grid component)
  const getDPICategory = (pixelRatio: number): string => {
    if (pixelRatio <= 1.25) return 'standard';
    if (pixelRatio <= 1.75) return 'high';
    if (pixelRatio <= 2.5) return 'very-high';
    return 'ultra-high';
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

  // Determine label length category for adaptive styling
  const getLabelLengthCategory = (label: string): string => {
    if (label.length <= 6) return 'short';
    if (label.length <= 12) return 'medium';
    return 'long';
  };

  return (
    <motion.button
      ref={buttonRef}
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
      data-label-length={getLabelLengthCategory(button.label)}
    >
      <div className="button-icon">
        {getActionIcon()}
      </div>
      <div 
        ref={labelRef}
        className="button-label"
        style={labelFontSize ? { fontSize: `${labelFontSize}px` } : undefined}
      >
        {button.label}
      </div>
      <div 
        ref={typeRef}
        className="button-type"
        style={typeFontSize ? { fontSize: `${typeFontSize}px` } : undefined}
      >
        {button.action_type}
      </div>
    </motion.button>
  );
};

export default ActionButton;