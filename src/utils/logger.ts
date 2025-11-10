/**
 * Logging utility with environment-based control
 * 
 * Usage:
 * - logger.log() - Normal logs (only in development)
 * - logger.warn() - Warnings (always shown)
 * - logger.error() - Errors (always shown)
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log normal messages (only in development mode)
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
