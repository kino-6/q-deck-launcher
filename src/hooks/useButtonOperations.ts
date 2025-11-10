import { useCallback } from 'react';
import { logger } from '../utils/logger';
import { QDeckConfig, ActionButton as ActionButtonType, tauriAPI } from '../lib/platform-api';

export interface UseButtonOperationsProps {
  config: QDeckConfig | undefined;
  tempConfig: QDeckConfig | null;
  setTempConfig: (config: QDeckConfig | null) => void;
  currentProfileIndex: number;
  currentPageIndex: number;
  closeContextMenu?: () => void;
}

export interface UseButtonOperationsReturn {
  handleEditButton: (button: ActionButtonType | null) => void;
  handleRemoveButton: (button: ActionButtonType) => Promise<void>;
  handleAddButton: (row: number, col: number) => Promise<void>;
  handleUndo: () => Promise<void>;
}

export const useButtonOperations = ({
  config,
  tempConfig,
  setTempConfig,
  currentProfileIndex,
  currentPageIndex,
  closeContextMenu,
}: UseButtonOperationsProps): UseButtonOperationsReturn => {
  
  const handleEditButton = useCallback((button: ActionButtonType | null) => {
    logger.log('Edit button:', button?.label);
    logger.log('Button edit feature will be implemented in the future');
  }, []);

  // Handle removing button
  const handleRemoveButton = useCallback(async (button: ActionButtonType) => {
    logger.log('Removing button:', button.label);
    
    const activeConfig = tempConfig || config;
    if (!activeConfig) {
      logger.error('No config available for removing button');
      return;
    }
    
    try {
      const newConfig = JSON.parse(JSON.stringify(activeConfig));
      
      if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
        const buttons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
        const buttonIndex = buttons.findIndex((btn: ActionButtonType) => 
          btn.position.row === button.position.row &&
          btn.position.col === button.position.col &&
          btn.label === button.label
        );
        
        if (buttonIndex !== -1) {
          // Remove the button from the array
          buttons.splice(buttonIndex, 1);
          logger.log(`Button "${button.label}" removed from position (${button.position.row}, ${button.position.col})`);
          
          // Update tempConfig if we're in config mode
          if (tempConfig) {
            setTempConfig(newConfig);
          }
          
          // Save the configuration
          try {
            await tauriAPI.saveConfig(newConfig);
            logger.log('Configuration saved successfully after button deletion');
            
            // Close context menu
            closeContextMenu?.();
            
            // Reload the page to reflect changes
            setTimeout(() => window.location.reload(), 500);
          } catch (saveErr) {
            logger.error('Failed to save configuration after button deletion:', saveErr);
            alert(`Failed to save configuration: ${saveErr}`);
          }
        } else {
          logger.warn('Button not found in configuration');
        }
      } else {
        logger.error('Invalid profile or page index');
      }
    } catch (err) {
      logger.error('Failed to remove button:', err);
      alert(`Failed to remove button: ${err}`);
    }
  }, [tempConfig, config, currentProfileIndex, currentPageIndex, closeContextMenu, setTempConfig]);

  // Handle adding new button
  const handleAddButton = useCallback(async (row: number, col: number) => {
    logger.log('Adding new button at:', row, col);
    
    if (!tempConfig) {
      logger.error('No tempConfig available');
      return;
    }
    
    try {
      const newButton: ActionButtonType = {
        position: { row, col },
        action_type: 'LaunchApp',
        label: 'New Button',
        icon: '🚀',
        config: {
          path: 'notepad.exe'
        },
        style: undefined,
        action: undefined,
      };
      
      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      
      if (newConfig.profiles[currentProfileIndex]?.pages[currentPageIndex]) {
        newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons.push(newButton);
        
        setTempConfig(newConfig);
        
        await tauriAPI.saveConfig(newConfig);
        logger.log('New button added and saved successfully');
        
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      logger.error('Failed to add new button:', err);
      alert(`ボタンの追加に失敗しました: ${err}`);
    }
  }, [tempConfig, currentProfileIndex, currentPageIndex, setTempConfig]);

  // Handle undo operation
  const handleUndo = useCallback(async () => {
    try {
      const lastOperation = await tauriAPI.getLastUndoOperation();
      
      if (!lastOperation) {
        alert('No operations to undo');
        return;
      }

      if (!tempConfig) {
        logger.error('No tempConfig available for undo');
        return;
      }

      const newConfig = JSON.parse(JSON.stringify(tempConfig));
      const currentPageButtons = newConfig.profiles[currentProfileIndex].pages[currentPageIndex].buttons;
      
      if (lastOperation.operation_type === 'AddButtons') {
        for (const position of lastOperation.affected_positions) {
          const buttonIndex = currentPageButtons.findIndex((btn: ActionButtonType) => 
            btn.position.row === position.row && btn.position.col === position.col
          );
          
          if (buttonIndex !== -1) {
            currentPageButtons.splice(buttonIndex, 1);
          }
        }
      }
      
      setTempConfig(newConfig);
      await tauriAPI.saveConfig(newConfig);
      
      await tauriAPI.undoLastOperation();
      
      logger.log('Undo operation completed');
      alert('Last operation undone');
      
      setTimeout(() => window.location.reload(), 500);
      
    } catch (error) {
      logger.error('Failed to undo operation:', error);
      alert(`Failed to undo operation: ${error}`);
    }
  }, [tempConfig, currentProfileIndex, currentPageIndex, setTempConfig]);

  return {
    handleEditButton,
    handleRemoveButton,
    handleAddButton,
    handleUndo,
  };
};

