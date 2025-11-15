/**
 * Update IPC Handlers tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger - must be defined before vi.mock
vi.mock('../logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { registerUpdateHandlers } from './updateHandlers.js';
import logger from '../logger.js';

describe('Update IPC Handlers', () => {
  let mockIpcMain;
  let mockAutoUpdateManager;
  let handlers;
  let mockLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = logger;
    
    handlers = {};
    mockIpcMain = {
      handle: vi.fn((channel, handler) => {
        handlers[channel] = handler;
      }),
    };

    mockAutoUpdateManager = {
      checkForUpdates: vi.fn(),
      getConfig: vi.fn(),
      updateConfig: vi.fn(),
    };

    registerUpdateHandlers(mockIpcMain, mockAutoUpdateManager);
  });

  describe('check-for-updates', () => {
    it('should register handler', () => {
      expect(mockIpcMain.handle).toHaveBeenCalledWith('check-for-updates', expect.any(Function));
    });

    it('should check for updates successfully', async () => {
      mockAutoUpdateManager.checkForUpdates.mockResolvedValue();
      
      const result = await handlers['check-for-updates']();
      
      expect(mockAutoUpdateManager.checkForUpdates).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Manual update check requested via IPC');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      mockAutoUpdateManager.checkForUpdates.mockRejectedValue(error);
      
      const result = await handlers['check-for-updates']();
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to check for updates via IPC', {
        error: 'Network error',
      });
      expect(result).toEqual({ success: false, error: 'Network error' });
    });
  });

  describe('get-update-config', () => {
    it('should register handler', () => {
      expect(mockIpcMain.handle).toHaveBeenCalledWith('get-update-config', expect.any(Function));
    });

    it('should get update config successfully', () => {
      const config = {
        autoDownload: false,
        autoInstallOnAppQuit: true,
        checkInterval: 7 * 24 * 60 * 60 * 1000,
      };
      mockAutoUpdateManager.getConfig.mockReturnValue(config);
      
      const result = handlers['get-update-config']();
      
      expect(mockAutoUpdateManager.getConfig).toHaveBeenCalled();
      expect(result).toEqual({ success: true, config });
    });

    it('should handle errors', () => {
      const error = new Error('Config error');
      mockAutoUpdateManager.getConfig.mockImplementation(() => {
        throw error;
      });
      
      const result = handlers['get-update-config']();
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to get update config via IPC', {
        error: 'Config error',
      });
      expect(result).toEqual({ success: false, error: 'Config error' });
    });
  });

  describe('update-update-config', () => {
    it('should register handler', () => {
      expect(mockIpcMain.handle).toHaveBeenCalledWith('update-update-config', expect.any(Function));
    });

    it('should update config successfully', async () => {
      const newConfig = { autoDownload: true };
      
      const result = await handlers['update-update-config'](null, newConfig);
      
      expect(mockAutoUpdateManager.updateConfig).toHaveBeenCalledWith(newConfig);
      expect(mockLogger.info).toHaveBeenCalledWith('Update config change requested via IPC', newConfig);
      expect(result).toEqual({ success: true });
    });

    it('should handle errors', async () => {
      const error = new Error('Update error');
      mockAutoUpdateManager.updateConfig.mockImplementation(() => {
        throw error;
      });
      
      const result = await handlers['update-update-config'](null, {});
      
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to update update config via IPC', {
        error: 'Update error',
      });
      expect(result).toEqual({ success: false, error: 'Update error' });
    });
  });
});
