/**
 * Production Logger Tests
 * 
 * Tests for the production logging system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

// Mock electron app
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/userdata')
  }
}));

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}));

describe('Production Logger', () => {
  let logger;
  let originalEnv;

  beforeEach(async () => {
    // Save original environment
    originalEnv = process.env.NODE_ENV;
    
    // Clear module cache to get fresh logger instance
    vi.resetModules();
    
    // Clear mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    
    // Shutdown logger if it exists
    if (logger) {
      logger.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize in production mode', async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      
      logger.initialize();
      
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(logger.logFilePath).toBeTruthy();
    });

    it('should not create log file in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      
      logger.initialize();
      
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(logger.logFilePath).toBeNull();
    });

    it('should create logs directory if it does not exist', async () => {
      process.env.NODE_ENV = 'production';
      fs.existsSync.mockReturnValue(false);
      
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      
      logger.initialize();
      
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
        { recursive: true }
      );
    });
  });

  describe('Logging Methods', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.info('Test info message', { key: 'value' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO]',
        'Test info message',
        { key: 'value' }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      logger.warn('Test warning message', { key: 'value' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WARN]',
        'Test warning message',
        { key: 'value' }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.error('Test error message', { key: 'value' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR]',
        'Test error message',
        { key: 'value' }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Action Logging', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should log successful action execution', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logAction('LaunchApp', 'notepad', 'success', 150, null, {
        path: 'notepad.exe'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ACTION]',
        'Action executed',
        expect.objectContaining({
          action_type: 'LaunchApp',
          action_id: 'notepad',
          result: 'success',
          execution_time_ms: 150,
          path: 'notepad.exe'
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log failed action execution with error message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logAction('LaunchApp', 'invalid', 'failure', 50, 'File not found', {
        path: 'invalid.exe'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ACTION]',
        'Action executed',
        expect.objectContaining({
          action_type: 'LaunchApp',
          action_id: 'invalid',
          result: 'failure',
          execution_time_ms: 50,
          error_message: 'File not found'
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Buffer and Flush', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should buffer log entries', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      
      expect(logger.logBuffer.length).toBe(3);
    });

    it('should flush buffer to file', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      
      logger.flush();
      
      expect(fs.appendFileSync).toHaveBeenCalled();
      expect(logger.logBuffer.length).toBe(0);
    });

    it('should auto-flush when buffer is full', () => {
      // Set small buffer size for testing
      logger.maxBufferSize = 3;
      
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3'); // Should trigger flush
      
      expect(fs.appendFileSync).toHaveBeenCalled();
    });
  });

  describe('Specialized Logging Methods', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should log application startup', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logStartup(850, { critical_path_ms: 300 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO]',
        'Application started',
        expect.objectContaining({
          startup_time_ms: 850,
          critical_path_ms: 300
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log hotkey registration success', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logHotkeyRegistration('F11', true);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO]',
        'Hotkey registered',
        expect.objectContaining({ hotkey: 'F11' })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log hotkey registration failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.logHotkeyRegistration('F11', false);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR]',
        'Hotkey registration failed',
        expect.objectContaining({ hotkey: 'F11' })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log profile switch', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logProfileSwitch('Development', 0);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO]',
        'Profile switched',
        expect.objectContaining({
          profile_name: 'Development',
          profile_index: 0
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log configuration save success', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      logger.logConfigSave(true);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO]',
        'Configuration saved',
        {}
      );
      
      consoleSpy.mockRestore();
    });

    it('should log configuration save failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.logConfigSave(false, { error: 'Permission denied' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR]',
        'Configuration save failed',
        expect.objectContaining({ error: 'Permission denied' })
      );
      
      consoleSpy.mockRestore();
    });

    it('should log unhandled errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('Test error');
      
      logger.logUnhandledError(testError, { type: 'uncaughtException' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR]',
        'Unhandled error',
        expect.objectContaining({
          error_message: 'Test error',
          error_stack: expect.any(String),
          type: 'uncaughtException'
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Shutdown', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should flush logs on shutdown', () => {
      logger.info('Final message');
      
      logger.shutdown();
      
      expect(fs.appendFileSync).toHaveBeenCalled();
      expect(logger.logBuffer.length).toBe(0);
    });

    it('should clear flush interval on shutdown', () => {
      const intervalId = logger.flushInterval;
      expect(intervalId).toBeTruthy();
      
      logger.shutdown();
      
      expect(logger.flushInterval).toBeNull();
    });
  });

  describe('JSON Format', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      const { default: Logger } = await import('./logger.js');
      logger = Logger;
      logger.initialize();
    });

    it('should write logs in JSON format', () => {
      logger.info('Test message', { key: 'value' });
      logger.flush();
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/^\{.*\}\n$/),
        'utf8'
      );
      
      // Verify JSON structure
      const callArgs = fs.appendFileSync.mock.calls[0];
      const logLine = callArgs[1].trim();
      const logEntry = JSON.parse(logLine);
      
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level', 'info');
      expect(logEntry).toHaveProperty('message', 'Test message');
      expect(logEntry).toHaveProperty('key', 'value');
    });
  });
});
