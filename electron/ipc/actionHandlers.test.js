/**
 * Action Handlers Tests
 * 
 * Tests for action IPC handlers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExecuteActionHandler } from './actionHandlers.js';

describe('Action Handlers', () => {
  let mockActionExecutor;
  let mockEvent;
  
  beforeEach(() => {
    mockActionExecutor = {
      execute: vi.fn()
    };
    
    mockEvent = {};
  });
  
  describe('createExecuteActionHandler', () => {
    it('should execute action successfully', async () => {
      const handler = createExecuteActionHandler(mockActionExecutor);
      const actionConfig = { type: 'LaunchApp', path: 'notepad.exe' };
      
      mockActionExecutor.execute.mockResolvedValue({
        success: true,
        message: 'Action executed successfully'
      });
      
      const result = await handler(mockEvent, actionConfig);
      
      expect(mockActionExecutor.execute).toHaveBeenCalledWith(actionConfig);
      expect(result.success).toBe(true);
    });
    
    it('should handle missing action config', async () => {
      const handler = createExecuteActionHandler(mockActionExecutor);
      
      const result = await handler(mockEvent, null);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Action configuration is required');
    });
    
    it('should handle action execution failure', async () => {
      const handler = createExecuteActionHandler(mockActionExecutor);
      const actionConfig = { type: 'LaunchApp', path: 'invalid.exe' };
      
      mockActionExecutor.execute.mockResolvedValue({
        success: false,
        message: 'File not found'
      });
      
      const result = await handler(mockEvent, actionConfig);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('File not found');
    });
    
    it('should handle unexpected errors', async () => {
      const handler = createExecuteActionHandler(mockActionExecutor);
      const actionConfig = { type: 'LaunchApp', path: 'notepad.exe' };
      
      mockActionExecutor.execute.mockRejectedValue(new Error('Unexpected error'));
      
      const result = await handler(mockEvent, actionConfig);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unexpected error');
    });
  });
});
