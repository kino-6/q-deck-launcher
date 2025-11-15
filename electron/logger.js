/**
 * Production Logger
 * 
 * Implements structured JSON logging for production environments.
 * Logs all actions, errors, and important events to a log file.
 * 
 * Requirements: 6.5 (Requirement 6 - Performance and Efficiency)
 */

import fs from 'fs';
import path from 'path';
import { app } from 'electron';

class ProductionLogger {
  constructor() {
    this.logFilePath = null;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logBuffer = [];
    this.flushInterval = null;
    this.maxBufferSize = 50; // Flush after 50 entries
    this.flushIntervalMs = 5000; // Flush every 5 seconds
  }

  /**
   * Initialize the logger
   * Must be called after app is ready
   */
  initialize() {
    if (!this.isProduction) {
      return; // Only log to file in production
    }

    try {
      // Determine log directory
      const logDir = path.join(app.getPath('userData'), 'logs');
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Create log file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      this.logFilePath = path.join(logDir, `q-deck-${timestamp}.log`);

      // Start flush interval
      this.flushInterval = setInterval(() => {
        this.flush();
      }, this.flushIntervalMs);

      // Log initialization
      this.info('Logger initialized', {
        logFile: this.logFilePath,
        nodeEnv: process.env.NODE_ENV
      });
    } catch (err) {
      console.error('Failed to initialize logger:', err);
    }
  }

  /**
   * Shutdown the logger
   * Flushes remaining logs
   */
  shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Write a log entry
   */
  writeLog(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };

    // Always log to console
    const consoleMethod = level === 'error' ? console.error : 
                         level === 'warn' ? console.warn : 
                         console.log;
    consoleMethod(`[${level.toUpperCase()}]`, message, context);

    // In production, also log to file
    if (this.isProduction && this.logFilePath) {
      this.logBuffer.push(entry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.maxBufferSize) {
        this.flush();
      }
    }
  }

  /**
   * Flush log buffer to file
   */
  flush() {
    if (!this.isProduction || !this.logFilePath || this.logBuffer.length === 0) {
      return;
    }

    try {
      const logLines = this.logBuffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      fs.appendFileSync(this.logFilePath, logLines, 'utf8');
      this.logBuffer = [];
    } catch (err) {
      console.error('Failed to flush logs:', err);
    }
  }

  /**
   * Log an info message
   */
  info(message, context = {}) {
    this.writeLog('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message, context = {}) {
    this.writeLog('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message, context = {}) {
    this.writeLog('error', message, context);
  }

  /**
   * Log an action execution
   */
  logAction(actionType, actionId, result, executionTimeMs, errorMessage = null, context = {}) {
    this.writeLog('action', 'Action executed', {
      action_type: actionType,
      action_id: actionId,
      result,
      execution_time_ms: executionTimeMs,
      error_message: errorMessage,
      ...context
    });
  }

  /**
   * Log application startup
   */
  logStartup(startupTimeMs, context = {}) {
    this.info('Application started', {
      startup_time_ms: startupTimeMs,
      ...context
    });
  }

  /**
   * Log hotkey registration
   */
  logHotkeyRegistration(hotkey, success, context = {}) {
    if (success) {
      this.info('Hotkey registered', { hotkey, ...context });
    } else {
      this.error('Hotkey registration failed', { hotkey, ...context });
    }
  }

  /**
   * Log profile switch
   */
  logProfileSwitch(profileName, profileIndex, context = {}) {
    this.info('Profile switched', {
      profile_name: profileName,
      profile_index: profileIndex,
      ...context
    });
  }

  /**
   * Log configuration save
   */
  logConfigSave(success, context = {}) {
    if (success) {
      this.info('Configuration saved', context);
    } else {
      this.error('Configuration save failed', context);
    }
  }

  /**
   * Log unhandled errors
   */
  logUnhandledError(error, context = {}) {
    this.error('Unhandled error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }
}

// Create singleton instance
const logger = new ProductionLogger();

export default logger;
