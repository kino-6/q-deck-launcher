import { useState, useCallback } from 'react';
import { ActionButton as ActionButtonType, ButtonStyle, QDeckConfig, tauriAPI } from '../lib/platform-api';
import { logger } from '../utils/logger';

export interface ThemeSelectorState {
  isVisible: boolean;
  button: ActionButtonType | null;
}

export interface UseThemeSelectorProps {
  tempConfig: QDeckConfig | null;
  setTempConfig: (config: QDeckConfig | null) => void;
}

export interface UseThemeSelectorReturn {
  themeSelector: ThemeSelectorState;
  handleThemeButton: (button: ActionButtonType | null) => void;
  handleThemeSelect: (style: ButtonStyle) => Promise<void>;
  closeThemeSelector: () => void;
}

export const useThemeSelector = ({
  tempConfig,
  setTempConfig,
}: UseThemeSelectorProps): UseThemeSelectorReturn => {
  const [themeSelector, setThemeSelector] = useState<ThemeSelectorState>({
    isVisible: false,
    button: null,
  });

  const handleThemeButton = useCallback((button: ActionButtonType | null) => {
    logger.log('Theme button:', button?.label);
    if (button) {
      setThemeSelector({
        isVisible: true,
        button: button,
      });
    }
  }, []);

  const handleThemeSelect = useCallback(async (style: ButtonStyle) => {
    if (!themeSelector.button || !tempConfig) return;
    
    logger.log('Applying theme to button:', themeSelector.button.label);
    
    try {
      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      
      for (const profile of newConfig.profiles) {
        for (const page of profile.pages) {
          const buttonIndex = page.buttons.findIndex((btn: ActionButtonType) => 
            btn.position.row === themeSelector.button!.position.row &&
            btn.position.col === themeSelector.button!.position.col &&
            btn.label === themeSelector.button!.label
          );
          
          if (buttonIndex !== -1) {
            page.buttons[buttonIndex].style = style;
            
            setTempConfig(newConfig);
            
            await tauriAPI.saveConfig(newConfig);
            logger.log('Theme configuration saved successfully');
            
            setTimeout(() => window.location.reload(), 500);
            return;
          }
        }
      }
      
      logger.error('Button not found for theme update');
    } catch (err) {
      logger.error('Failed to apply theme:', err);
      alert(`テーマの適用に失敗しました: ${err}`);
    }
  }, [themeSelector.button, tempConfig, setTempConfig]);

  const closeThemeSelector = useCallback(() => {
    setThemeSelector({
      isVisible: false,
      button: null,
    });
  }, []);

  return {
    themeSelector,
    handleThemeButton,
    handleThemeSelect,
    closeThemeSelector,
  };
};
