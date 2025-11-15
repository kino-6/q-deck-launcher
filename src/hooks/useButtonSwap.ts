/**
 * Hook for swapping button positions
 */

import { useCallback } from 'react';
import { ActionButton, QDeckConfig } from '../lib/platform-api';
import { tauriAPI } from '../lib/platform-api';

interface UseButtonSwapProps {
  config: QDeckConfig | null | undefined;
  currentProfileIndex: number;
  currentPageIndex: number;
  onConfigUpdate?: (newConfig: QDeckConfig) => void;
}

export function useButtonSwap({
  config,
  currentProfileIndex,
  currentPageIndex,
  onConfigUpdate,
}: UseButtonSwapProps) {
  
  const swapButtons = useCallback(async (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => {
    if (!config) return;

    console.log(`🔄 Swapping buttons: (${fromRow}, ${fromCol}) ↔ (${toRow}, ${toCol})`);

    const profile = config.profiles[currentProfileIndex];
    const page = profile.pages[currentPageIndex];
    
    // Find buttons at both positions
    const fromButton = page.buttons.find(
      b => b.position.row === fromRow && b.position.col === fromCol
    );
    const toButton = page.buttons.find(
      b => b.position.row === toRow && b.position.col === toCol
    );

    // If dragging to the same position, do nothing
    if (fromRow === toRow && fromCol === toCol) {
      console.log('🔄 Same position, no swap needed');
      return;
    }

    // Create new config with swapped positions
    const newConfig = { ...config };
    const newProfile = { ...newConfig.profiles[currentProfileIndex] };
    const newPage = { ...newProfile.pages[currentPageIndex] };
    const newButtons = [...newPage.buttons];

    // Case 1: Both positions have buttons - swap them
    if (fromButton && toButton) {
      console.log(`🔄 Swapping: "${fromButton.label}" ↔ "${toButton.label}"`);
      
      const fromIndex = newButtons.findIndex(
        b => b.position.row === fromRow && b.position.col === fromCol
      );
      const toIndex = newButtons.findIndex(
        b => b.position.row === toRow && b.position.col === toCol
      );

      // Swap positions
      newButtons[fromIndex] = {
        ...fromButton,
        position: { row: toRow, col: toCol },
      };
      newButtons[toIndex] = {
        ...toButton,
        position: { row: fromRow, col: fromCol },
      };
    }
    // Case 2: Only source has button - move it to empty cell
    else if (fromButton && !toButton) {
      console.log(`🔄 Moving "${fromButton.label}" to empty cell (${toRow}, ${toCol})`);
      
      const fromIndex = newButtons.findIndex(
        b => b.position.row === fromRow && b.position.col === fromCol
      );

      newButtons[fromIndex] = {
        ...fromButton,
        position: { row: toRow, col: toCol },
      };
    }
    // Case 3: Only target has button - swap with empty source
    else if (!fromButton && toButton) {
      console.log(`🔄 Moving "${toButton.label}" to empty cell (${fromRow}, ${fromCol})`);
      
      const toIndex = newButtons.findIndex(
        b => b.position.row === toRow && b.position.col === toCol
      );

      newButtons[toIndex] = {
        ...toButton,
        position: { row: fromRow, col: fromCol },
      };
    }
    // Case 4: Both empty - nothing to do
    else {
      console.log('🔄 Both positions empty, no swap needed');
      return;
    }

    // Update config
    newPage.buttons = newButtons;
    newProfile.pages[currentPageIndex] = newPage;
    newConfig.profiles[currentProfileIndex] = newProfile;

    // Save to backend
    try {
      await tauriAPI.saveConfig(newConfig);
      console.log('✅ Button swap saved successfully');
      
      // Notify parent component
      if (onConfigUpdate) {
        onConfigUpdate(newConfig);
      }
    } catch (error) {
      console.error('❌ Failed to save button swap:', error);
    }
  }, [config, currentProfileIndex, currentPageIndex, onConfigUpdate]);

  return {
    swapButtons,
  };
}
