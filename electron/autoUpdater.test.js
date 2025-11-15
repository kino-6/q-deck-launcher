/**
 * Auto-updater tests
 * 
 * Tests for the auto-update functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store event handlers
let eventHandlers = {};

// Mock electron-updater
const mockAutoUpdater = {
  autoDownload: false,
  autoInstallOnAppQuit: true,
  on: vi.fn((event, handler) => {
    eventHandlers[event] = handler;
  }),
  checkForUpdates: vi.fn(),
  downloadUpdate: vi.fn(),
  quitAndInstall: vi.fn(),
};

vi.mock('electron-updater', () => ({
  autoUpdater: mockAutoUpdater,
}));

// Mock electron dialog
const mockDialog = {
  showMessageBox: vi.fn(),
};

vi.mock('electron', () => ({
  dialog: mockDialog,
  app: {
    getVersion: vi.fn(() => '0.1.0'),
  },
}));

// Mock logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('./logger.js', () => ({
  default: mockLogger,
}));

describe('AutoUpdater', () => {
  let autoUpdateManager;
  let AutoUpdateManager;

  beforeEach(async () => {
    vi.clearAllMocks();
    eventHandlers = {};
    
    // Reset mock implementations
    mockAutoUpdater.on.mockImplementation((event, handler) => {
      eventHandlers[event] = handler;
    });
    mockAutoUpdater.checkForUpdates.mockResolvedValue({});
    mockDialog.showMessageBox.mockResolvedValue({ response: 0 });
    
    // Import the class and create a new instance for each test
    const module = await import('./autoUpdater.js');
    AutoUpdateManager = module.AutoUpdateManager;
    autoUpdateManager = new AutoUpdateManager();
  });

  afterEach(() => {
    if (autoUpdateManager) {
      autoUpdateManager.stopAutoUpdateChecks();
    }
  });

  describe('Configuration', () => {
    it('should initialize with default configuration', () => {
      const config = autoUpdateManager.getConfig();
      
      expect(config).toEqual({
        autoDownload: false,
        autoInstallOnAppQuit: true,
        checkInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    });

    it('should update configuration', () => {
      const newConfig = {
        autoDownload: true,
        checkInterval: 24 * 60 * 60 * 1000, // 1 day
      };
      
      autoUpdateManager.updateConfig(newConfig);
      const config = autoUpdateManager.getConfig();
      
      expect(config.autoDownload).toBe(true);
      expect(config.checkInterval).toBe(24 * 60 * 60 * 1000);
      expect(config.autoInstallOnAppQuit).toBe(true); // Should retain old value
    });

    it('should apply configuration to autoUpdater', () => {
      autoUpdateManager.updateConfig({ autoDownload: true });
      
      expect(mockAutoUpdater.autoDownload).toBe(true);
    });
  });

  describe('Event Handlers', () => {
    it('should register event handlers on initialization', () => {
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('checking-for-update', expect.any(Function));
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-available', expect.any(Function));
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-not-available', expect.any(Function));
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('download-progress', expect.any(Function));
      expect(mockAutoUpdater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
    });

    it('should log when checking for updates', () => {
      const handler = eventHandlers['checking-for-update'];
      expect(handler).toBeDefined();
      
      handler();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Checking for updates...');
    });

    it('should log when update is available', () => {
      const handler = eventHandlers['update-available'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Update available', { version: '0.2.0' });
    });

    it('should log when update is not available', () => {
      const handler = eventHandlers['update-not-available'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.1.0' };
      handler(updateInfo);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Update not available', { currentVersion: '0.1.0' });
    });

    it('should log errors', () => {
      const handler = eventHandlers['error'];
      expect(handler).toBeDefined();
      
      const error = new Error('Network error');
      handler(error);
      
      expect(mockLogger.error).toHaveBeenCalledWith('Error in auto-updater', {
        error: 'Network error',
        stack: expect.any(String),
      });
    });

    it('should log download progress', () => {
      const handler = eventHandlers['download-progress'];
      expect(handler).toBeDefined();
      
      const progressObj = {
        bytesPerSecond: 1024000,
        percent: 50,
        transferred: 5000000,
        total: 10000000,
      };
      handler(progressObj);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Update download progress', {
        percent: 50,
        transferred: 5000000,
        total: 10000000,
      });
    });

    it('should log when update is downloaded', () => {
      const handler = eventHandlers['update-downloaded'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      expect(mockLogger.info).toHaveBeenCalledWith('Update downloaded', { version: '0.2.0' });
    });
  });

  describe('Manual Update Check', () => {
    it('should check for updates', async () => {
      await autoUpdateManager.checkForUpdates();
      
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Manual update check initiated');
    });

    it('should prevent concurrent update checks', async () => {
      autoUpdateManager.isCheckingForUpdates = true;
      
      await autoUpdateManager.checkForUpdates();
      
      expect(mockAutoUpdater.checkForUpdates).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('Update check already in progress');
    });

    it('should handle errors during update check', async () => {
      const error = new Error('Network error');
      mockAutoUpdater.checkForUpdates.mockRejectedValueOnce(error);
      
      try {
        await autoUpdateManager.checkForUpdates();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).toBe('Network error');
        expect(mockLogger.error).toHaveBeenCalledWith('Failed to check for updates', {
          error: 'Network error',
        });
      }
    });
  });

  describe('Automatic Update Checks', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start automatic update checks', async () => {
      autoUpdateManager.startAutoUpdateChecks();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Auto-update checks started', {
        interval: 7 * 24 * 60 * 60 * 1000,
      });
      
      // Should check after 10 seconds
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalled();
    });

    it('should perform periodic update checks', async () => {
      autoUpdateManager.startAutoUpdateChecks();
      
      // Initial check after 10s
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalledTimes(1);
      
      // Periodic check after 7 days
      await vi.advanceTimersByTimeAsync(7 * 24 * 60 * 60 * 1000);
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalledTimes(2);
    });

    it('should stop automatic update checks', async () => {
      autoUpdateManager.startAutoUpdateChecks();
      
      // Let the initial timeout fire
      await vi.advanceTimersByTimeAsync(10000);
      const initialCallCount = mockAutoUpdater.checkForUpdates.mock.calls.length;
      
      autoUpdateManager.stopAutoUpdateChecks();
      
      expect(mockLogger.info).toHaveBeenCalledWith('Auto-update checks stopped');
      
      // Should not check after stopping (advance by the interval period)
      await vi.advanceTimersByTimeAsync(7 * 24 * 60 * 60 * 1000);
      expect(mockAutoUpdater.checkForUpdates).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('User Dialogs', () => {
    it('should show dialog when update is available', () => {
      const handler = eventHandlers['update-available'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      expect(mockDialog.showMessageBox).toHaveBeenCalledWith({
        type: 'info',
        buttons: ['Download Update', 'Later'],
        title: 'Update Available',
        message: 'Version 0.2.0 is available',
        detail: expect.stringContaining('Current version: 0.1.0'),
      });
    });

    it('should download update when user clicks "Download Update"', async () => {
      mockDialog.showMessageBox.mockResolvedValueOnce({ response: 0 });
      
      const handler = eventHandlers['update-available'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      // Wait for dialog promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockAutoUpdater.downloadUpdate).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('User initiated update download');
    });

    it('should not download update when user clicks "Later"', async () => {
      mockDialog.showMessageBox.mockResolvedValueOnce({ response: 1 });
      
      const handler = eventHandlers['update-available'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      // Wait for dialog promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockAutoUpdater.downloadUpdate).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('User postponed update');
    });

    it('should show dialog when update is downloaded', () => {
      const handler = eventHandlers['update-downloaded'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      expect(mockDialog.showMessageBox).toHaveBeenCalledWith({
        type: 'info',
        buttons: ['Restart Now', 'Later'],
        title: 'Update Ready',
        message: 'Update downloaded',
        detail: expect.stringContaining('Version 0.2.0 has been downloaded'),
      });
    });

    it('should restart app when user clicks "Restart Now"', async () => {
      mockDialog.showMessageBox.mockResolvedValueOnce({ response: 0 });
      
      const handler = eventHandlers['update-downloaded'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      // Wait for dialog promise and setImmediate to resolve
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockAutoUpdater.quitAndInstall).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('User initiated app restart for update');
    });

    it('should not restart app when user clicks "Later"', async () => {
      mockDialog.showMessageBox.mockResolvedValueOnce({ response: 1 });
      
      const handler = eventHandlers['update-downloaded'];
      expect(handler).toBeDefined();
      
      const updateInfo = { version: '0.2.0' };
      handler(updateInfo);
      
      // Wait for dialog promise to resolve
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockAutoUpdater.quitAndInstall).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('User postponed update installation');
    });
  });
});
