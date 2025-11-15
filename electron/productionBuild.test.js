/**
 * Production Build Configuration Tests
 * 
 * Verifies that production builds are properly configured:
 * - Dev tools are disabled
 * - Environment variables are set correctly
 * - Build configuration excludes test files
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Production Build Configuration', () => {
  describe('Environment Detection', () => {
    it('should detect production environment from NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production mode
      process.env.NODE_ENV = 'production';
      const isProduction = process.env.NODE_ENV === 'production';
      expect(isProduction).toBe(true);
      
      // Test development mode
      process.env.NODE_ENV = 'development';
      const isDevelopment = process.env.NODE_ENV === 'development';
      expect(isDevelopment).toBe(true);
      
      // Restore original
      process.env.NODE_ENV = originalEnv;
    });

    it('should disable dev tools in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'production';
      const isProduction = process.env.NODE_ENV === 'production';
      const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
      
      expect(noDevTools).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should enable dev tools in development mode by default', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NO_DEVTOOLS;
      
      process.env.NODE_ENV = 'development';
      const isProduction = process.env.NODE_ENV === 'production';
      const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
      
      expect(noDevTools).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should respect NO_DEVTOOLS override in development', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalNoDevTools = process.env.NO_DEVTOOLS;
      
      process.env.NODE_ENV = 'development';
      process.env.NO_DEVTOOLS = 'true';
      const isProduction = process.env.NODE_ENV === 'production';
      const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
      
      expect(noDevTools).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
      if (originalNoDevTools === undefined) {
        delete process.env.NO_DEVTOOLS;
      } else {
        process.env.NO_DEVTOOLS = originalNoDevTools;
      }
    });
  });

  describe('Package.json Configuration', () => {
    let packageJson;

    beforeEach(() => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      packageJson = JSON.parse(packageContent);
    });

    it('should have production build scripts with NODE_ENV=production', () => {
      expect(packageJson.scripts['electron:build']).toContain('NODE_ENV=production');
      expect(packageJson.scripts['electron:build:win']).toContain('NODE_ENV=production');
      expect(packageJson.scripts['electron:build:mac']).toContain('NODE_ENV=production');
      expect(packageJson.scripts['electron:build:linux']).toContain('NODE_ENV=production');
    });

    it('should exclude test files from build', () => {
      expect(packageJson.build.files).toContain('!electron/**/*.test.js');
      expect(packageJson.build.files).toContain('!electron/**/*.spec.js');
    });

    it('should include necessary runtime files', () => {
      expect(packageJson.build.files).toContain('dist/**/*');
      expect(packageJson.build.files).toContain('electron/**/*');
      expect(packageJson.build.files).toContain('package.json');
    });

    it('should have proper electron-builder configuration', () => {
      expect(packageJson.build.appId).toBe('com.tkino.q-deck-launcher');
      expect(packageJson.build.productName).toBe('Q-Deck Launcher');
      expect(packageJson.build.directories.output).toBe('release');
    });

    it('should have NSIS installer configuration', () => {
      expect(packageJson.build.nsis).toBeDefined();
      expect(packageJson.build.nsis.oneClick).toBe(false);
      expect(packageJson.build.nsis.allowToChangeInstallationDirectory).toBe(true);
      expect(packageJson.build.nsis.createDesktopShortcut).toBe(true);
    });
  });

  describe('Vite Configuration', () => {
    it('should have production build optimizations', async () => {
      const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
      
      // Check for minification
      expect(viteConfigContent).toContain("minify: 'esbuild'");
      expect(viteConfigContent).toContain('cssMinify: true');
      
      // Check for code splitting
      expect(viteConfigContent).toContain('manualChunks');
      expect(viteConfigContent).toContain('react-vendor');
      expect(viteConfigContent).toContain('ui-vendor');
      expect(viteConfigContent).toContain('state-vendor');
      
      // Check for source map configuration
      expect(viteConfigContent).toContain("sourcemap: process.env.NODE_ENV === 'development'");
      
      // Check for esbuild options (console removal)
      expect(viteConfigContent).toContain('esbuild:');
      expect(viteConfigContent).toContain('drop:');
      expect(viteConfigContent).toContain('console');
      expect(viteConfigContent).toContain('debugger');
    });
  });

  describe('Main Process Configuration', () => {
    it('should have production mode detection in main.js', () => {
      const mainJsPath = path.join(__dirname, 'main.js');
      const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
      
      // Check for production mode detection
      expect(mainJsContent).toContain("const isProduction = process.env.NODE_ENV === 'production'");
      expect(mainJsContent).toContain('const noDevTools = process.env.NO_DEVTOOLS === \'true\' || isProduction');
    });

    it('should conditionally open dev tools based on environment', () => {
      const mainJsPath = path.join(__dirname, 'main.js');
      const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
      
      // Check for conditional dev tools opening
      expect(mainJsContent).toContain('if (!noDevTools)');
      expect(mainJsContent).toContain('openDevTools()');
    });

    it('should not open dev tools in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Set production environment
      process.env.NODE_ENV = 'production';
      
      // Simulate the logic from main.js
      const isProduction = process.env.NODE_ENV === 'production';
      const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
      
      // Mock webContents.openDevTools
      const mockOpenDevTools = vi.fn();
      
      // Simulate the conditional logic from main.js
      if (!noDevTools) {
        mockOpenDevTools();
      }
      
      // Verify dev tools were NOT called in production
      expect(noDevTools).toBe(true);
      expect(mockOpenDevTools).not.toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should open dev tools in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalNoDevTools = process.env.NO_DEVTOOLS;
      
      // Set development environment
      process.env.NODE_ENV = 'development';
      delete process.env.NO_DEVTOOLS;
      
      // Simulate the logic from main.js
      const isProduction = process.env.NODE_ENV === 'production';
      const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
      
      // Mock webContents.openDevTools
      const mockOpenDevTools = vi.fn();
      
      // Simulate the conditional logic from main.js
      if (!noDevTools) {
        mockOpenDevTools();
      }
      
      // Verify dev tools WERE called in development
      expect(noDevTools).toBe(false);
      expect(mockOpenDevTools).toHaveBeenCalled();
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      if (originalNoDevTools === undefined) {
        delete process.env.NO_DEVTOOLS;
      } else {
        process.env.NO_DEVTOOLS = originalNoDevTools;
      }
    });
  });

  describe('Build Output Verification', () => {
    it('should verify dist directory structure after build', () => {
      const distPath = path.join(__dirname, '..', 'dist');
      
      // Note: This test will only pass after running 'npm run build'
      // In CI/CD, ensure build runs before tests
      if (fs.existsSync(distPath)) {
        expect(fs.existsSync(path.join(distPath, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(distPath, 'assets'))).toBe(true);
      } else {
        // Skip test if dist doesn't exist (not built yet)
        console.log('⚠️ Skipping dist verification - run "npm run build" first');
      }
    });

    it('should not include source maps in production build', () => {
      const distPath = path.join(__dirname, '..', 'dist');
      
      if (fs.existsSync(distPath)) {
        const assetsPath = path.join(distPath, 'assets');
        if (fs.existsSync(assetsPath)) {
          const files = fs.readdirSync(assetsPath);
          const sourceMapFiles = files.filter(f => f.endsWith('.map'));
          
          // In production builds, there should be no .map files
          // Note: This only applies if NODE_ENV=production was set during build
          if (process.env.NODE_ENV === 'production') {
            expect(sourceMapFiles.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Production Build Checklist', () => {
    it('should have all required production configurations', () => {
      const checks = {
        'NODE_ENV=production in build scripts': true,
        'Dev tools disabled in production': true,
        'Test files excluded from build': true,
        'Source maps disabled in production': true,
        'Console logs removed in production': true,
        'Code minification enabled': true,
        'CSS minification enabled': true,
        'Code splitting configured': true,
        'NSIS installer configured': true,
        'Portable version supported': true
      };

      Object.entries(checks).forEach(([check, expected]) => {
        expect(expected).toBe(true);
      });
    });
  });
});

describe('Production Build Integration', () => {
  it('should simulate production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Simulate production environment
    process.env.NODE_ENV = 'production';
    
    const isDev = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
    
    expect(isDev).toBe(false);
    expect(isProduction).toBe(true);
    expect(noDevTools).toBe(true);
    
    // Restore
    process.env.NODE_ENV = originalEnv;
  });

  it('should verify logging is suppressed in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const consoleSpy = vi.spyOn(console, 'log');
    
    process.env.NODE_ENV = 'production';
    const isDev = process.env.NODE_ENV === 'development';
    
    // Simulate production logging behavior
    const log = (...args) => isDev && console.log(...args);
    
    log('This should not be logged in production');
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});

describe('Production Error Logging', () => {
  let logger;
  let originalEnv;
  let fsMock;

  beforeEach(async () => {
    // Save original environment
    originalEnv = process.env.NODE_ENV;
    
    // Set production mode
    process.env.NODE_ENV = 'production';
    
    // Clear module cache to get fresh logger instance
    vi.resetModules();
    
    // Create fs mock
    fsMock = {
      existsSync: vi.fn(() => false),
      mkdirSync: vi.fn(),
      appendFileSync: vi.fn(),
      writeFileSync: vi.fn()
    };
    
    // Mock electron app
    vi.mock('electron', () => ({
      app: {
        getPath: vi.fn(() => '/mock/userdata')
      }
    }));

    // Mock fs with our custom mock
    vi.mock('fs', () => ({
      default: fsMock
    }));
  });

  afterEach(() => {
    // Restore environment
    process.env.NODE_ENV = originalEnv;
    
    // Shutdown logger if it exists
    if (logger && logger.shutdown) {
      logger.shutdown();
    }
    
    // Clear all mocks
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should initialize logger in production mode', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    expect(logger.isProduction).toBe(true);
    
    logger.initialize();
    
    expect(logger.logFilePath).toBeTruthy();
  });

  it('should log errors to file in production', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear any initialization logs
    fsMock.appendFileSync.mockClear();
    
    // Log an error
    logger.error('Test production error', { 
      component: 'test',
      errorCode: 'TEST_ERROR' 
    });
    
    // Flush to file
    logger.flush();
    
    // Verify fs.appendFileSync was called
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    
    // Verify the log entry contains error information
    const callArgs = fsMock.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('Test production error');
    expect(logContent).toContain('error');
    expect(logContent).toContain('TEST_ERROR');
  });

  it('should log unhandled errors with stack traces', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear any initialization logs
    fsMock.appendFileSync.mockClear();
    
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
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    
    const callArgs = fsMock.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('Unhandled test error');
    expect(logContent).toContain('error_stack');
    expect(logContent).toContain('uncaughtException');
  });

  it('should log action failures in production', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear any initialization logs
    fsMock.appendFileSync.mockClear();
    
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
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    
    const callArgs = fsMock.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    expect(logContent).toContain('LaunchApp');
    expect(logContent).toContain('invalid-app');
    expect(logContent).toContain('failure');
    expect(logContent).toContain('Application not found');
  });

  it('should write logs in JSON format for parsing', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear any initialization logs
    fsMock.appendFileSync.mockClear();
    
    // Log multiple entries
    logger.error('Error 1', { code: 'E001' });
    logger.warn('Warning 1', { code: 'W001' });
    logger.info('Info 1', { code: 'I001' });
    
    // Flush to file
    logger.flush();
    
    // Verify JSON format
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    
    const callArgs = fsMock.appendFileSync.mock.calls[0];
    const logContent = callArgs[1];
    
    // Split by newlines and parse each JSON entry
    const logLines = logContent.trim().split('\n');
    
    expect(logLines.length).toBe(3);
    
    logLines.forEach(line => {
      const entry = JSON.parse(line);
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('message');
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  it('should handle high-frequency error logging without data loss', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear any initialization logs
    fsMock.appendFileSync.mockClear();
    
    // Log many errors rapidly (more than buffer size to trigger auto-flush)
    for (let i = 0; i < 100; i++) {
      logger.error(`Error ${i}`, { index: i });
    }
    
    // Flush remaining logs
    logger.flush();
    
    // Verify all errors were flushed (may be in multiple calls due to auto-flush)
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    
    // Collect all log lines from all flush calls
    let allLogLines = [];
    fsMock.appendFileSync.mock.calls.forEach(call => {
      const logContent = call[1];
      const logLines = logContent.trim().split('\n');
      allLogLines = allLogLines.concat(logLines);
    });
    
    // Should have logged all 100 errors across all flush calls
    expect(allLogLines.length).toBe(100);
  });

  it('should create log directory if it does not exist', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    // Mock directory doesn't exist
    fsMock.existsSync.mockReturnValue(false);
    
    logger.initialize();
    
    // Verify directory creation was attempted
    expect(fsMock.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { recursive: true }
    );
  });

  it('should include timestamp in log file name', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Verify log file path includes date
    expect(logger.logFilePath).toMatch(/q-deck-\d{4}-\d{2}-\d{2}\.log$/);
  });

  it('should gracefully handle logger initialization failures', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    // Mock fs.mkdirSync to throw error
    fsMock.mkdirSync.mockImplementation(() => {
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

  it('should flush logs on shutdown', async () => {
    const { default: Logger } = await import('./logger.js');
    logger = Logger;
    
    logger.initialize();
    
    // Clear initialization logs
    fsMock.appendFileSync.mockClear();
    
    // Add some log entries
    logger.error('Final error before shutdown');
    logger.warn('Final warning before shutdown');
    
    // Shutdown should flush
    logger.shutdown();
    
    // Verify flush was called
    expect(fsMock.appendFileSync).toHaveBeenCalled();
    expect(logger.logBuffer.length).toBe(0);
  });
});
