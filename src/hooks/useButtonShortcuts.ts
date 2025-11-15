import { useEffect, useCallback } from 'react';
import { ActionButton } from '../lib/platform-api';

interface UseButtonShortcutsProps {
  buttons: ActionButton[];
  onButtonClick: (button: ActionButton) => void;
  enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for grid buttons
 * Maps number keys (1-9, 0) to first 10 buttons in reading order
 * Maps Shift+number keys (Shift+1-9, Shift+0) to buttons 11-20 in reading order
 */
export const useButtonShortcuts = ({ 
  buttons, 
  onButtonClick, 
  enabled = true 
}: UseButtonShortcutsProps) => {
  const handleShortcutPress = useCallback((event: Event) => {
    if (!enabled) return;

    const customEvent = event as CustomEvent<{ buttonIndex: number }>;
    const { buttonIndex } = customEvent.detail;

    // Get the button at the specified index (only non-empty buttons)
    if (buttonIndex >= 0 && buttonIndex < buttons.length) {
      const button = buttons[buttonIndex];
      if (button) {
        console.log(`Button shortcut ${buttonIndex + 1} pressed, executing:`, button.label);
        onButtonClick(button);
      }
    }
  }, [buttons, onButtonClick, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('button-shortcut-pressed', handleShortcutPress);

    return () => {
      window.removeEventListener('button-shortcut-pressed', handleShortcutPress);
    };
  }, [handleShortcutPress, enabled]);

  /**
   * Get the shortcut number for a button (1-9, 0 for first 10 buttons, Shift+1-9, Shift+0 for buttons 11-20)
   * Returns null if button is not in first 20 or doesn't have a shortcut
   */
  const getButtonShortcut = useCallback((button: ActionButton): string | null => {
    const index = buttons.indexOf(button);
    if (index >= 0 && index < 10) {
      // Map: index 0->1, 1->2, ..., 8->9, 9->0
      return index === 9 ? '0' : `${index + 1}`;
    } else if (index >= 10 && index < 20) {
      // Map: index 10->Shift+1, 11->Shift+2, ..., 18->Shift+9, 19->Shift+0
      const shortcutNum = index === 19 ? '0' : `${index - 9}`;
      return `⇧${shortcutNum}`;
    }
    return null;
  }, [buttons]);

  return {
    getButtonShortcut,
  };
};
