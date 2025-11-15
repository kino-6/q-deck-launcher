/**
 * Production Error Logging Tests
 * 
 * Tests to verify that error logging works correctly in production mode.
 * This is a critical feature for debugging production issues.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

// Mock electron and fs before importing logger
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/userdata')
  }
}));

const mockFs = {
  existsSync: vi.fn(() => false),
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
  writeFileSync: vi.fn()
};

vi.mock('fs', () => ({
  default: mockFs
}));

describe('Production Error Logging', () => {
  let logger;
  let originalEnv;

  beforeEach(async () => {
    // Save original environment
    originalEnv = process.env.NODE_ENV;
    
    // Set production mode
    process.env.NODE_ENV = 'production';
    
    // Clear module cache to get fresh logger instance
    vi.resetModules();
    
    // Clear mock calls
    vi.clearAllMocks();
    
    // Import logger fresh
    const loggerModule = await import('./logger.js');
    logger = loggerModule.default;
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    
    // Shutdown logger if it exists
    if (logger && logger.shutdown) {
      logger.shutdown();
    }
  });

  it('should initialize logger in production mode', () => {
    expect(logger.isProduction).toBe(true);
    
    logger.initialize();
    
    expect(logger.logFilePath).toBeTruthy();
    expect(logger.logFilePath).toMatch(/q-deck-\d{4}-\d{2}-\d{2}\.log$/);
  });

  it('should log errors to file in production', () => {
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Log an error
    logger.error('Test production error', { 
      component: 'test',
      errorCode: 'TEST_ERROR' 
    });
    
    // Flush to file
    logger.flush();
    
    // Verify fs.appendFileSync was called
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    // Verify the log entry contains error information
    const callArgs = mockFs.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('Test production error');
    expect(logContent).toContain('error');
    expect(logContent).toContain('TEST_ERROR');
  });

  it('should log unhandled errors with stack traces', () => {
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Create a test error with stack trace
    const testError = new Error('Unhandled test error');
    
    // Log unhandled error
    logger.logUnhandledError(testError, { 
      type: 'uncaughtException',
      context: 'production test' 
    });
    
    // Flush to file
    logger.flush();
    
    // Verify error was logged with stack trace
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    const callArgs = mockFs.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('Unhandled test error');
    expect(logContent).toContain('error_stack');
    expect(logContent).toContain('uncaughtException');
  });

  it('should log action failures in production', () => {
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Log a failed action
    logger.logAction(
      'LaunchApp',
      'invalid-app',
      'failure',
      50,
      'Application not found: invalid-app.exe',
      { path: 'C:\\invalid-app.exe' }
    );
    
    // Flush to file
    logger.flush();
    
    // Verify action failure was logged
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    const callArgs = mockFs.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('LaunchApp');
    expect(logContent).toContain('invalid-app');
    expect(logContent).toContain('failure');
    expect(logContent).toContain('Application not found');
  });

  it('should write logs in JSON format for parsing', () => {
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Log multiple entries
    logger.error('Error 1', { code: 'E001' });
    logger.warn('Warning 1', { code: 'W001' });
    logger.info('Info 1', { code: 'I001' });
    
    // Flush to file
    logger.flush();
    
    // Verify JSON format
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    const callArgs = mockFs.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    // Split by newlines and parse each JSON entry
    const logLines = logContent.trim().split('\n');
    
    // Should have at least 3 log entries
    expect(logLines.length).toBeGreaterThanOrEqual(3);
    
    logLines.forEach(line => {
      const entry = JSON.parse(line);
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('message');
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  it('should handle high-frequency error logging without data loss', () => {
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Log many errors rapidly (more than buffer size to trigger auto-flush)
    for (let i = 0; i < 100; i++) {
      logger.error(`Error ${i}`, { index: i });
    }
    
    // Flush remaining logs
    logger.flush();
    
    // Verify all errors were flushed (may be in multiple calls due to auto-flush)
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    // Collect all log lines from all flush calls
    let allLogLines = [];
    mockFs.appendFileSync.mock.calls.forEach(call => {
      const logContent = call[1];
      const logLines = logContent.trim().split('\n');
      allLogLines = allLogLines.concat(logLines);
    });
    
    // Should have logged at least 100 errors (may include initialization log)
    expect(allLogLines.length).toBeGreaterThanOrEqual(100);
  });

  it('should create log directory if it does not exist', () => {
    // Mock directory doesn't exist
    mockFs.existsSync.mockReturnValue(false);
    
    logger.initialize();
    
    // Verify directory creation was attempted
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { recursive: true }
    );
  });

  it('should include timestamp in log file name', () => {
    logger.initialize();
    
    // Verify log file path includes date
    expect(logger.logFilePath).toMatch(/q-deck-\d{4}-\d{2}-\d{2}\.log$/);
  });

  it('should gracefully handle logger initialization failures', () => {
    // Mock fs.mkdirSync to throw error
    mockFs.mkdirSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Should not throw, but log error
    expect(() => logger.initialize()).not.toThrow();
    
    // Verify error was logged to console
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to initialize logger:',
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  it('should flush logs on shutdown', () => {
    // Reset mock to allow initialization
    mockFs.mkdirSync.mockReset();
    mockFs.mkdirSync.mockImplementation(() => {});
    
    logger.initialize();
    
    // Clear initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Add some log entries
    logger.error('Final error before shutdown');
    logger.warn('Final warning before shutdown');
    
    // Shutdown should flush
    logger.shutdown();
    
    // Verify flush was called
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    expect(logger.logBuffer.length).toBe(0);
  });

  it('should log errors with context information', () => {
    // Reset mock to allow initialization
    mockFs.mkdirSync.mockReset();
    mockFs.mkdirSync.mockImplementation(() => {});
    
    logger.initialize();
    
    // Clear any initialization logs
    mockFs.appendFileSync.mockClear();
    
    // Log error with rich context
    logger.error('Database connection failed', {
      host: 'localhost',
      port: 5432,
      database: 'q-deck',
      retryAttempt: 3,
      errorCode: 'ECONNREFUSED'
    });
    
    logger.flush();
    
    expect(mockFs.appendFileSync).toHaveBeenCalled();
    
    const callArgs = mockFs.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    const logLines = logContent.trim().split('\n');
    
    // Find the database error log entry (not the initialization log)
    const logEntry = logLines
      .map(line => JSON.parse(line))
      .find(entry => entry.message === 'Database connection failed');
    
    expect(logEntry).toBeDefined();
    expect(logEntry.message).toBe('Database connection failed');
    expect(logEntry.host).toBe('localhost');
    expect(logEntry.port).toBe(5432);
    expect(logEntry.errorCode).toBe('ECONNREFUSED');
  });

  it('should not log to file in development mode', async () => {
    // Switch to development mode
    process.env.NODE_ENV = 'development';
    
    // Reload logger
    vi.resetModules();
    const loggerModule = await import('./logger.js');
    const devLogger = loggerModule.default;
    
    devLogger.initialize();
    
    // Clear mocks
    mockFs.appendFileSync.mockClear();
    
    // Log an error
    devLogger.error('Development error');
    devLogger.flush();
    
    // Should NOT write to file in development
    expect(mockFs.appendFileSync).not.toHaveBeenCalled();
  });
});
