import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionExecutor } from './ActionExecutor.js';

describe('ActionExecutor', () => {
  let executor;

  beforeEach(() => {
    executor = new ActionExecutor();
  });

  describe('Initialization', () => {
    it('should initialize with default handlers', () => {
      const supportedTypes = executor.getSupportedTypes();
      expect(supportedTypes).toContain('LaunchApp');
      expect(supportedTypes).toContain('Open');
      expect(supportedTypes).toContain('Terminal');
    });

    it('should have three default handlers', () => {
      const supportedTypes = executor.getSupportedTypes();
      expect(supportedTypes).toHaveLength(3);
    });
  });

  describe('Action Execution', () => {
    it('should return error for missing action type', async () => {
      const result = await executor.execute({});
      expect(result.success).toBe(false);
      expect(result.message).toContain('Action type is required');
    });

    it('should return error for unknown action type', async () => {
      const result = await executor.execute({ type: 'UnknownAction' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown action type');
    });

    it('should delegate to LaunchApp handler', async () => {
      const mockHandler = {
        execute: vi.fn().mockResolvedValue({ success: true, message: 'Launched' })
      };
      executor.handlers.LaunchApp = mockHandler;

      const config = { type: 'LaunchApp', path: 'test.exe' };
      const result = await executor.execute(config);

      expect(mockHandler.execute).toHaveBeenCalledWith(config);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Launched');
    });

    it('should delegate to Open handler', async () => {
      const mockHandler = {
        execute: vi.fn().mockResolvedValue({ success: true, message: 'Opened' })
      };
      executor.handlers.Open = mockHandler;

      const config = { type: 'Open', target: 'C:\\test' };
      const result = await executor.execute(config);

      expect(mockHandler.execute).toHaveBeenCalledWith(config);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Opened');
    });

    it('should delegate to Terminal handler', async () => {
      const mockHandler = {
        execute: vi.fn().mockResolvedValue({ success: true, message: 'Terminal launched' })
      };
      executor.handlers.Terminal = mockHandler;

      const config = { type: 'Terminal', terminal: 'PowerShell' };
      const result = await executor.execute(config);

      expect(mockHandler.execute).toHaveBeenCalledWith(config);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Terminal launched');
    });

    it('should handle handler execution errors', async () => {
      const mockHandler = {
        execute: vi.fn().mockRejectedValue(new Error('Handler failed'))
      };
      executor.handlers.LaunchApp = mockHandler;

      const config = { type: 'LaunchApp', path: 'test.exe' };
      const result = await executor.execute(config);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Action execution failed');
    });
  });

  describe('Custom Handler Registration', () => {
    it('should allow registering custom handlers', () => {
      const customHandler = {
        execute: vi.fn().mockResolvedValue({ success: true })
      };

      executor.registerHandler('CustomAction', customHandler);

      const supportedTypes = executor.getSupportedTypes();
      expect(supportedTypes).toContain('CustomAction');
    });

    it('should use registered custom handler', async () => {
      const customHandler = {
        execute: vi.fn().mockResolvedValue({ success: true, message: 'Custom executed' })
      };

      executor.registerHandler('CustomAction', customHandler);

      const config = { type: 'CustomAction', data: 'test' };
      const result = await executor.execute(config);

      expect(customHandler.execute).toHaveBeenCalledWith(config);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Custom executed');
    });

    it('should throw error when registering handler without execute method', () => {
      const invalidHandler = {};

      expect(() => {
        executor.registerHandler('InvalidAction', invalidHandler);
      }).toThrow('Handler must have an execute method');
    });

    it('should allow overriding existing handlers', () => {
      const customLaunchHandler = {
        execute: vi.fn().mockResolvedValue({ success: true, message: 'Custom launch' })
      };

      executor.registerHandler('LaunchApp', customLaunchHandler);

      expect(executor.handlers.LaunchApp).toBe(customLaunchHandler);
    });
  });
});
