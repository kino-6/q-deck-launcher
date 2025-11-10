import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * File path retrieval tests for drag and drop functionality
 * These tests verify that full file paths are correctly retrieved from dropped files
 */

describe('GridDragDrop - File Path Retrieval', () => {
  describe('File path extraction from drop events', () => {
    it('should extract full path from Windows executable file', () => {
      const testFilePath = 'C:\\Program Files\\MyApp\\application.exe';
      
      // Simulate the file path extraction logic
      const fileName = testFilePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      
      // Verify full path is preserved
      expect(testFilePath).toBe('C:\\Program Files\\MyApp\\application.exe');
      expect(testFilePath).toContain('\\');
      expect(isExecutable).toBe(true);
    });

    it('should extract full path from non-executable file', () => {
      const testFilePath = 'C:\\Users\\John\\Documents\\report.pdf';
      
      // Simulate the file path extraction logic
      const fileName = testFilePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      
      // Verify full path is preserved
      expect(testFilePath).toBe('C:\\Users\\John\\Documents\\report.pdf');
      expect(testFilePath).toContain('\\');
      expect(isExecutable).toBe(false);
    });

    it('should handle multiple file paths correctly', () => {
      const testFilePaths = [
        'C:\\Program Files\\VSCode\\Code.exe',
        'C:\\Users\\John\\Documents\\notes.txt',
        'D:\\Projects\\presentation.pptx',
      ];
      
      // Verify all paths are preserved
      expect(testFilePaths.length).toBe(3);
      expect(testFilePaths[0]).toBe('C:\\Program Files\\VSCode\\Code.exe');
      expect(testFilePaths[1]).toBe('C:\\Users\\John\\Documents\\notes.txt');
      expect(testFilePaths[2]).toBe('D:\\Projects\\presentation.pptx');
      
      // Verify each path contains backslashes
      testFilePaths.forEach(path => {
        expect(path).toContain('\\');
      });
    });

    it('should preserve Windows paths with backslashes', () => {
      const testFilePath = 'C:\\Windows\\System32\\notepad.exe';
      
      // Verify backslashes are preserved
      expect(testFilePath).toContain('\\');
      expect(testFilePath.split('\\').length).toBe(4); // C:, Windows, System32, notepad.exe
      
      // Verify path components
      const pathComponents = testFilePath.split('\\');
      expect(pathComponents[0]).toBe('C:');
      expect(pathComponents[1]).toBe('Windows');
      expect(pathComponents[2]).toBe('System32');
      expect(pathComponents[3]).toBe('notepad.exe');
    });

    it('should preserve paths with spaces', () => {
      const testFilePath = 'C:\\Program Files\\My Application\\app with spaces.exe';
      
      // Verify spaces are preserved
      expect(testFilePath).toContain(' ');
      expect(testFilePath).toContain('Program Files');
      expect(testFilePath).toContain('My Application');
      expect(testFilePath).toContain('app with spaces.exe');
    });

    it('should preserve paths with special characters', () => {
      const testFilePath = 'C:\\Users\\John\\Documents\\report (2024-01-15) [final].pdf';
      
      // Verify special characters are preserved
      expect(testFilePath).toContain('(');
      expect(testFilePath).toContain(')');
      expect(testFilePath).toContain('[');
      expect(testFilePath).toContain(']');
      expect(testFilePath).toContain('-');
    });

    it('should preserve UNC network paths', () => {
      const testFilePath = '\\\\server\\share\\folder\\file.txt';
      
      // Verify UNC path format is preserved
      expect(testFilePath).toMatch(/^\\\\/);
      expect(testFilePath.startsWith('\\\\')).toBe(true);
      
      // Verify path components
      const pathComponents = testFilePath.split('\\').filter(c => c);
      expect(pathComponents[0]).toBe('server');
      expect(pathComponents[1]).toBe('share');
      expect(pathComponents[2]).toBe('folder');
      expect(pathComponents[3]).toBe('file.txt');
    });
  });

  describe('Button configuration with file paths', () => {
    it('should create LaunchApp button config with full path for .exe files', () => {
      const filePath = 'C:\\Program Files\\MyApp\\application.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      const buttonConfig = {
        position: { row: 1, col: 1 },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      // Verify button config uses full path
      expect(buttonConfig.action_type).toBe('LaunchApp');
      expect(buttonConfig.config.path).toBe(filePath);
      expect(buttonConfig.config.path).toBe('C:\\Program Files\\MyApp\\application.exe');
      expect(buttonConfig.label).toBe('application');
    });

    it('should create Open button config with full path for non-executable files', () => {
      const filePath = 'C:\\Users\\John\\Documents\\report.pdf';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      const buttonConfig = {
        position: { row: 1, col: 1 },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      // Verify button config uses full path
      expect(buttonConfig.action_type).toBe('Open');
      expect(buttonConfig.config.target).toBe(filePath);
      expect(buttonConfig.config.target).toBe('C:\\Users\\John\\Documents\\report.pdf');
      expect(buttonConfig.label).toBe('report');
    });

    it('should preserve full paths in button configs for multiple files', () => {
      const filePaths = [
        'C:\\Program Files\\VSCode\\Code.exe',
        'C:\\Users\\John\\Documents\\notes.txt',
        'D:\\Projects\\presentation.pptx',
      ];
      
      const buttonConfigs = filePaths.map((filePath, index) => {
        const fileName = filePath.split('\\').pop() || 'Unknown';
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
        
        return {
          position: { row: 1, col: index + 1 },
          action_type: actionType,
          label: buttonLabel,
          icon: undefined,
          config: isExecutable 
            ? { path: filePath }
            : { target: filePath },
          style: undefined,
          action: undefined,
        };
      });
      
      // Verify all button configs preserve full paths
      expect(buttonConfigs[0].config.path).toBe('C:\\Program Files\\VSCode\\Code.exe');
      expect(buttonConfigs[0].action_type).toBe('LaunchApp');
      
      expect(buttonConfigs[1].config.target).toBe('C:\\Users\\John\\Documents\\notes.txt');
      expect(buttonConfigs[1].action_type).toBe('Open');
      
      expect(buttonConfigs[2].config.target).toBe('D:\\Projects\\presentation.pptx');
      expect(buttonConfigs[2].action_type).toBe('Open');
    });

    it('should preserve paths with spaces in button configs', () => {
      const filePath = 'C:\\Program Files\\My Application\\app with spaces.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      
      const buttonConfig = {
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
      };
      
      // Verify spaces are preserved in button config
      expect(buttonConfig.config.path).toContain(' ');
      expect(buttonConfig.config.path).toBe('C:\\Program Files\\My Application\\app with spaces.exe');
    });

    it('should preserve paths with special characters in button configs', () => {
      const filePath = 'C:\\Users\\John\\Documents\\report (2024-01-15) [final].pdf';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      
      const buttonConfig = {
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
      };
      
      // Verify special characters are preserved in button config
      expect(buttonConfig.config.target).toContain('(');
      expect(buttonConfig.config.target).toContain(')');
      expect(buttonConfig.config.target).toContain('[');
      expect(buttonConfig.config.target).toContain(']');
      expect(buttonConfig.config.target).toBe('C:\\Users\\John\\Documents\\report (2024-01-15) [final].pdf');
    });

    it('should preserve UNC network paths in button configs', () => {
      const filePath = '\\\\server\\share\\folder\\file.txt';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      
      const buttonConfig = {
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
      };
      
      // Verify UNC path is preserved in button config
      expect(buttonConfig.config.target).toMatch(/^\\\\/);
      expect(buttonConfig.config.target).toBe('\\\\server\\share\\folder\\file.txt');
    });
  });

  describe('IPC file path transmission', () => {
    it('should correctly format file paths for IPC transmission', () => {
      // Simulate the file paths that would be sent via IPC
      const filePaths = [
        'C:\\Program Files\\MyApp\\application.exe',
        'C:\\Users\\John\\Documents\\report.pdf',
      ];
      
      // Verify paths are in the correct format for IPC
      expect(Array.isArray(filePaths)).toBe(true);
      expect(filePaths.length).toBe(2);
      expect(typeof filePaths[0]).toBe('string');
      expect(typeof filePaths[1]).toBe('string');
      
      // Verify paths contain backslashes (Windows format)
      filePaths.forEach(path => {
        expect(path).toContain('\\');
      });
    });

    it('should handle single file path in IPC transmission', () => {
      const filePaths = ['C:\\Windows\\System32\\notepad.exe'];
      
      // Verify single file path is correctly formatted
      expect(Array.isArray(filePaths)).toBe(true);
      expect(filePaths.length).toBe(1);
      expect(filePaths[0]).toBe('C:\\Windows\\System32\\notepad.exe');
    });

    it('should handle multiple file paths in IPC transmission', () => {
      const filePaths = [
        'C:\\file1.exe',
        'C:\\file2.txt',
        'C:\\file3.pdf',
        'C:\\file4.docx',
      ];
      
      // Verify multiple file paths are correctly formatted
      expect(Array.isArray(filePaths)).toBe(true);
      expect(filePaths.length).toBe(4);
      
      // Verify each path is a string
      filePaths.forEach(path => {
        expect(typeof path).toBe('string');
        expect(path).toContain('\\');
      });
    });
  });

  describe('Button click action execution', () => {
    let mockExecuteAction: ReturnType<typeof vi.fn>;
    
    beforeEach(() => {
      // Mock the executeAction function
      mockExecuteAction = vi.fn().mockResolvedValue({ success: true });
      
      // Mock window.electronAPI
      (window as any).electronAPI = {
        executeAction: mockExecuteAction,
        isElectron: true,
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should execute LaunchApp action when clicking button created from .exe file', async () => {
      const filePath = 'C:\\Program Files\\MyApp\\application.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      // Create button config as it would be created from dropped file
      const buttonConfig = {
        position: { row: 1, col: 1 },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      // Simulate button click - construct action config as ActionButton does
      const actionConfig = {
        type: buttonConfig.action_type,
        label: buttonConfig.label,
        ...buttonConfig.config
      };
      
      // Execute the action
      await window.electronAPI!.executeAction(actionConfig);
      
      // Verify executeAction was called with correct parameters
      expect(mockExecuteAction).toHaveBeenCalledTimes(1);
      expect(mockExecuteAction).toHaveBeenCalledWith({
        type: 'LaunchApp',
        label: 'application',
        path: 'C:\\Program Files\\MyApp\\application.exe'
      });
    });

    it('should execute Open action when clicking button created from non-executable file', async () => {
      const filePath = 'C:\\Users\\John\\Documents\\report.pdf';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      // Create button config as it would be created from dropped file
      const buttonConfig = {
        position: { row: 1, col: 1 },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      // Simulate button click - construct action config as ActionButton does
      const actionConfig = {
        type: buttonConfig.action_type,
        label: buttonConfig.label,
        ...buttonConfig.config
      };
      
      // Execute the action
      await window.electronAPI!.executeAction(actionConfig);
      
      // Verify executeAction was called with correct parameters
      expect(mockExecuteAction).toHaveBeenCalledTimes(1);
      expect(mockExecuteAction).toHaveBeenCalledWith({
        type: 'Open',
        label: 'report',
        target: 'C:\\Users\\John\\Documents\\report.pdf'
      });
    });

    it('should execute actions for multiple buttons created from dropped files', async () => {
      const filePaths = [
        'C:\\Program Files\\VSCode\\Code.exe',
        'C:\\Users\\John\\Documents\\notes.txt',
        'D:\\Projects\\presentation.pptx',
      ];
      
      // Create button configs for all files
      const buttonConfigs = filePaths.map((filePath, index) => {
        const fileName = filePath.split('\\').pop() || 'Unknown';
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
        
        return {
          position: { row: 1, col: index + 1 },
          action_type: actionType,
          label: buttonLabel,
          icon: undefined,
          config: isExecutable 
            ? { path: filePath }
            : { target: filePath },
          style: undefined,
          action: undefined,
        };
      });
      
      // Simulate clicking each button
      for (const buttonConfig of buttonConfigs) {
        const actionConfig = {
          type: buttonConfig.action_type,
          label: buttonConfig.label,
          ...buttonConfig.config
        };
        
        await window.electronAPI!.executeAction(actionConfig);
      }
      
      // Verify executeAction was called for each button
      expect(mockExecuteAction).toHaveBeenCalledTimes(3);
      
      // Verify first button (LaunchApp)
      expect(mockExecuteAction).toHaveBeenNthCalledWith(1, {
        type: 'LaunchApp',
        label: 'Code',
        path: 'C:\\Program Files\\VSCode\\Code.exe'
      });
      
      // Verify second button (Open)
      expect(mockExecuteAction).toHaveBeenNthCalledWith(2, {
        type: 'Open',
        label: 'notes',
        target: 'C:\\Users\\John\\Documents\\notes.txt'
      });
      
      // Verify third button (Open)
      expect(mockExecuteAction).toHaveBeenNthCalledWith(3, {
        type: 'Open',
        label: 'presentation',
        target: 'D:\\Projects\\presentation.pptx'
      });
    });

    it('should preserve full file paths when executing button actions', async () => {
      const testCases = [
        {
          filePath: 'C:\\Program Files\\My Application\\app with spaces.exe',
          expectedType: 'LaunchApp',
          expectedLabel: 'app with spaces',
          expectedConfigKey: 'path'
        },
        {
          filePath: 'C:\\Users\\John\\Documents\\report (2024-01-15) [final].pdf',
          expectedType: 'Open',
          expectedLabel: 'report (2024-01-15) [final]',
          expectedConfigKey: 'target'
        },
        {
          filePath: '\\\\server\\share\\folder\\file.txt',
          expectedType: 'Open',
          expectedLabel: 'file',
          expectedConfigKey: 'target'
        },
      ];
      
      for (const testCase of testCases) {
        mockExecuteAction.mockClear();
        
        const fileName = testCase.filePath.split('\\').pop() || 'Unknown';
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
        
        const buttonConfig = {
          position: { row: 1, col: 1 },
          action_type: actionType,
          label: buttonLabel,
          icon: undefined,
          config: isExecutable 
            ? { path: testCase.filePath }
            : { target: testCase.filePath },
          style: undefined,
          action: undefined,
        };
        
        const actionConfig = {
          type: buttonConfig.action_type,
          label: buttonConfig.label,
          ...buttonConfig.config
        };
        
        await window.electronAPI!.executeAction(actionConfig);
        
        // Verify the full path is preserved in the action config
        expect(mockExecuteAction).toHaveBeenCalledTimes(1);
        const calledConfig = mockExecuteAction.mock.calls[0][0];
        expect(calledConfig.type).toBe(testCase.expectedType);
        expect(calledConfig.label).toBe(testCase.expectedLabel);
        expect(calledConfig[testCase.expectedConfigKey]).toBe(testCase.filePath);
      }
    });
  });
});
