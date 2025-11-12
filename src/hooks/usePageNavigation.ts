import { useEffect, useCallback, useState } from 'react';
import { tauriAPI, PageInfo } from '../lib/platform-api';
import { logger } from '../utils/logger';

interface UsePageNavigationOptions {
  enabled?: boolean;
  onPageChange?: (page: PageInfo | null) => void;
  onError?: (error: Error) => void;
  enableKeyboardShortcuts?: boolean;
}

interface UsePageNavigationReturn {
  // Navigation actions
  handleNextPage: () => Promise<PageInfo | null>;
  handlePreviousPage: () => Promise<PageInfo | null>;
  goToPage: (pageIndex: number) => Promise<PageInfo | null>;
  
  // State
  isNavigating: boolean;
  error: string | null;
}

/**
 * Custom hook for page navigation
 * Handles keyboard-based navigation (arrow keys, PageUp/PageDown) and programmatic navigation
 */
export const usePageNavigation = (options: UsePageNavigationOptions = {}): UsePageNavigationReturn => {
  const {
    enabled = true,
    onPageChange,
    onError,
    enableKeyboardShortcuts = true,
  } = options;

  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const fullMessage = `${context}: ${errorMessage}`;
    
    logger.error(fullMessage, err);
    setError(fullMessage);
    
    if (onError && err instanceof Error) {
      onError(err);
    }
  }, [onError]);

  // Navigate to next page
  const handleNextPage = useCallback(async (): Promise<PageInfo | null> => {
    if (!enabled || isNavigating) {
      return null;
    }

    try {
      setIsNavigating(true);
      setError(null);
      
      const result = await tauriAPI.nextPage() as PageInfo | null;
      
      if (result) {
        logger.log('Navigated to next page:', result);
        onPageChange?.(result);
      } else {
        logger.log('Already at last page');
      }
      
      return result;
    } catch (err) {
      handleError(err, 'Failed to navigate to next page');
      return null;
    } finally {
      setIsNavigating(false);
    }
  }, [enabled, isNavigating, onPageChange, handleError]);

  // Navigate to previous page
  const handlePreviousPage = useCallback(async (): Promise<PageInfo | null> => {
    if (!enabled || isNavigating) {
      return null;
    }

    try {
      setIsNavigating(true);
      setError(null);
      
      const result = await tauriAPI.previousPage() as PageInfo | null;
      
      if (result) {
        logger.log('Navigated to previous page:', result);
        onPageChange?.(result);
      } else {
        logger.log('Already at first page');
      }
      
      return result;
    } catch (err) {
      handleError(err, 'Failed to navigate to previous page');
      return null;
    } finally {
      setIsNavigating(false);
    }
  }, [enabled, isNavigating, onPageChange, handleError]);

  // Navigate to specific page
  const goToPage = useCallback(async (pageIndex: number): Promise<PageInfo | null> => {
    if (!enabled || isNavigating) {
      return null;
    }

    try {
      setIsNavigating(true);
      setError(null);
      
      logger.log('Navigating to page:', pageIndex);
      const result = await tauriAPI.switchToPage(pageIndex) as PageInfo | null;
      
      if (result) {
        logger.log('Navigated to page:', result);
        onPageChange?.(result);
      }
      
      return result;
    } catch (err) {
      handleError(err, 'Failed to navigate to page');
      return null;
    } finally {
      setIsNavigating(false);
    }
  }, [enabled, isNavigating, onPageChange, handleError]);

  // Set up keyboard shortcuts
  useEffect(() => {
    if (!enabled || !enableKeyboardShortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if any modal or input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                            activeElement?.tagName === 'TEXTAREA' ||
                            activeElement?.hasAttribute('contenteditable');
      
      // Don't handle navigation if an input is focused
      if (isInputFocused) {
        return;
      }

      // Don't handle if already navigating
      if (isNavigating) {
        return;
      }

      // Handle arrow keys and PageUp/PageDown
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextPage();
          break;
        case 'PageUp':
          event.preventDefault();
          handlePreviousPage();
          break;
        case 'PageDown':
          event.preventDefault();
          handleNextPage();
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, enableKeyboardShortcuts, isNavigating, handleNextPage, handlePreviousPage]);

  return {
    handleNextPage,
    handlePreviousPage,
    goToPage,
    isNavigating,
    error,
  };
};

export default usePageNavigation;
