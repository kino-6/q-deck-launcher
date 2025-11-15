import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { QDeckConfig, tauriAPI } from '../lib/platform-api';

export interface UseConfigModalProps {
  config: QDeckConfig | undefined;
  currentProfileIndex: number;
  currentPageIndex: number;
  onModalStateChange?: (isOpen: boolean) => void;
}

export interface UseConfigModalReturn {
  showConfig: boolean;
  tempConfig: QDeckConfig | null;
  setTempConfig: (config: QDeckConfig | null) => void;
  openConfig: () => void;
  closeConfig: () => void;
  saveConfig: () => Promise<void>;
  updateGridSize: (rows: number, cols: number) => Promise<void>;
  updateThemeColor: (color: string) => Promise<void>;
}

export const useConfigModal = ({
  config,
  currentProfileIndex,
  currentPageIndex,
  onModalStateChange,
}: UseConfigModalProps): UseConfigModalReturn => {
  const [showConfig, setShowConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<QDeckConfig | null>(null);

  const openConfig = useCallback(() => {
    logger.log('openConfig called, current config:', config);
    if (config) {
      const configCopy = JSON.parse(JSON.stringify(config));
      logger.log('Setting tempConfig to:', configCopy);
      setTempConfig(configCopy);
      setShowConfig(true);
      onModalStateChange?.(true);
      logger.log('showConfig set to true');
    } else {
      logger.error('Cannot open config: config is null');
    }
  }, [config, onModalStateChange]);

  const closeConfig = useCallback(() => {
    logger.log('closeConfig called');
    setShowConfig(false);
    setTempConfig(null);
    onModalStateChange?.(false);
  }, [onModalStateChange]);

  const saveConfig = useCallback(async () => {
    logger.log('saveConfig called, tempConfig:', tempConfig);
    if (!tempConfig) {
      logger.error('saveConfig: tempConfig is null');
      return;
    }
    
    try {
      logger.log('Saving configuration...');
      await tauriAPI.saveConfig(tempConfig);
      logger.log('Configuration saved successfully');
      setShowConfig(false);
      setTempConfig(null);
      logger.log('Reloading page...');
      window.location.reload();
    } catch (err) {
      logger.error('Failed to save config:', err);
      alert(`Failed to save configuration: ${err}`);
    }
  }, [tempConfig]);

  const updateGridSize = useCallback(async (rows: number, cols: number) => {
    logger.log('updateGridSize called:', rows, cols, 'tempConfig:', tempConfig);
    if (!tempConfig) {
      logger.error('updateGridSize: tempConfig is null');
      return;
    }
    
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].rows = rows;
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].cols = cols;
      const existingButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons || [];
      newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons = existingButtons.filter(
        (button: any) => button.position.row <= rows && button.position.col <= cols
      );
      logger.log('Grid size updated to:', rows, 'x', cols);
      logger.log('New config:', newConfig);
      
      setTempConfig(newConfig);
      
      try {
        await tauriAPI.saveConfig(newConfig);
        logger.log('Grid size configuration saved successfully');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        logger.error('Failed to save grid size config:', err);
      }
    } else {
      logger.error('updateGridSize: Invalid profile or page');
    }
  }, [tempConfig, currentProfileIndex, currentPageIndex]);

  const updateThemeColor = useCallback(async (color: string) => {
    logger.log('updateThemeColor called:', color, 'tempConfig:', tempConfig);
    if (!tempConfig) {
      logger.error('updateThemeColor: tempConfig is null');
      return;
    }
    
    const newConfig = JSON.parse(JSON.stringify(tempConfig));
    newConfig.ui.window.theme = color;
    logger.log('Theme updated to:', color);
    logger.log('New config:', newConfig);
    
    setTempConfig(newConfig);
    
    try {
      await tauriAPI.saveConfig(newConfig);
      logger.log('Theme configuration saved successfully');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      logger.error('Failed to save theme config:', err);
    }
  }, [tempConfig]);

  return {
    showConfig,
    tempConfig,
    setTempConfig,
    openConfig,
    closeConfig,
    saveConfig,
    updateGridSize,
    updateThemeColor,
  };
};

