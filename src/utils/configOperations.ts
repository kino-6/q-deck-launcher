import { tauriAPI } from '../lib/platform-api';
import { logger } from './logger';

/**
 * Handle system actions like config, back, hide_overlay, etc.
 */
export const handleSystemAction = (action: string, openConfig: () => void) => {
  logger.log('handleSystemAction called with:', action);
  
  switch (action) {
    case 'config':
      openConfig();
      break;
    case 'back':
    case 'exit_config':
      tauriAPI.hideOverlay().catch(logger.error);
      break;
    case 'hide_overlay':
      tauriAPI.hideOverlay().catch(logger.error);
      break;
    case 'toggle_overlay':
      tauriAPI.toggleOverlay().catch(logger.error);
      break;
    default:
      logger.warn('Unknown system action:', action);
  }
};

/**
 * Test click handler to verify component is interactive
 */
export const handleTestClick = () => {
  logger.log('Grid clicked - component is interactive!');
};
