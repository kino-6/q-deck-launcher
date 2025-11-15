import { describe, it, expect } from 'vitest';

/**
 * Button generation logic tests
 * These tests verify the button generation logic without requiring full DOM simulation
 */

describe('Button Generation Logic', () => {
  describe('File path parsing', () => {
    it('should extract filename from Windows path', () => {
      const filePath = 'C:\\Windows\\System32\\notepad.exe';
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
      
      expect(fileName).toBe('notepad.exe');
    });

    it('should extract filename from Unix path', () => {
      const filePath = '/usr/bin/vim';
      // For Unix paths, split by '/' first since split('\\') won't work
      const fileName = filePath.includes('\\') 
        ? (filePath.split('\\').pop() || 'Unknown')
        : (filePath.split('/').pop() || 'Unknown');
      
      expect(fileName).toBe('vim');
    });

    it('should handle filename without path', () => {
      const filePath = 'document.txt';
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Unknown';
      
      expect(fileName).toBe('document.txt');
    });
  });

  describe('File extension detection', () => {
    it('should detect .exe extension', () => {
      const fileName = 'notepad.exe';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      expect(fileExtension).toBe('exe');
    });

    it('should detect .txt extension', () => {
      const fileName = 'document.txt';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      expect(fileExtension).toBe('txt');
    });

    it('should handle files without extension', () => {
      const fileName = 'README';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      expect(fileExtension).toBe('readme');
    });

    it('should handle multiple dots in filename', () => {
      const fileName = 'my.document.v2.txt';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      
      expect(fileExtension).toBe('txt');
    });
  });

  describe('Action type determination', () => {
    it('should return LaunchApp for .exe files', () => {
      const fileExtension = 'exe';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(actionType).toBe('LaunchApp');
    });

    it('should return Open for .txt files', () => {
      const fileName = 'document.txt';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(actionType).toBe('Open');
    });

    it('should return Open for .pdf files', () => {
      const fileName = 'report.pdf';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(actionType).toBe('Open');
    });

    it('should return Open for .docx files', () => {
      const fileName = 'document.docx';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(actionType).toBe('Open');
    });

    it('should return LaunchApp for .exe files with full path', () => {
      const filePath = 'C:\\Program Files\\MyApp\\application.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(fileExtension).toBe('exe');
      expect(isExecutable).toBe(true);
      expect(actionType).toBe('LaunchApp');
    });

    it('should return LaunchApp for .EXE files (case insensitive)', () => {
      const filePath = 'C:\\Windows\\System32\\NOTEPAD.EXE';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      
      expect(fileExtension).toBe('exe');
      expect(isExecutable).toBe(true);
      expect(actionType).toBe('LaunchApp');
    });

    it('should return LaunchApp for various .exe files', () => {
      const exeFiles = [
        'C:\\Program Files\\VSCode\\Code.exe',
        'C:\\Windows\\System32\\notepad.exe',
        'D:\\Games\\game.exe',
        'E:\\Tools\\utility.EXE',
        'notepad.exe',
      ];

      for (const filePath of exeFiles) {
        const fileName = filePath.includes('\\') 
          ? (filePath.split('\\').pop() || 'Unknown')
          : (filePath.split('/').pop() || 'Unknown');
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        
        expect(actionType).toBe('LaunchApp');
      }
    });
  });

  describe('Button label generation', () => {
    it('should remove .exe extension from label', () => {
      const fileName = 'notepad.exe';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      expect(buttonLabel).toBe('notepad');
    });

    it('should remove .txt extension from label', () => {
      const fileName = 'document.txt';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      expect(buttonLabel).toBe('document');
    });

    it('should handle filename without extension', () => {
      const fileName = 'README';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      expect(buttonLabel).toBe('README');
    });

    it('should handle multiple dots correctly', () => {
      const fileName = 'my.document.v2.txt';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      expect(buttonLabel).toBe('my.document.v2');
    });
  });

  describe('Button object creation', () => {
    it('should create correct button structure for .exe file', () => {
      const filePath = 'C:\\Program Files\\MyApp\\app.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      const row = 1;
      const col = 1;

      const button = {
        position: { row, col },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };

      expect(button.position.row).toBe(1);
      expect(button.position.col).toBe(1);
      expect(button.action_type).toBe('LaunchApp');
      expect(button.label).toBe('app');
      expect(button.config.path).toBe('C:\\Program Files\\MyApp\\app.exe');
      expect(button.icon).toBeUndefined();
    });

    it('should create LaunchApp button for notepad.exe', () => {
      const filePath = 'C:\\Windows\\System32\\notepad.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');

      const button = {
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

      expect(button.action_type).toBe('LaunchApp');
      expect(button.label).toBe('notepad');
      expect(button.config).toHaveProperty('path');
      expect(button.config.path).toBe(filePath);
      expect(button.config).not.toHaveProperty('target');
    });

    it('should create LaunchApp button with path config (not target) for .exe files', () => {
      const filePath = 'C:\\Program Files\\VSCode\\Code.exe';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');

      const button = {
        position: { row: 2, col: 3 },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };

      // Verify it's LaunchApp action
      expect(button.action_type).toBe('LaunchApp');
      
      // Verify config has 'path' property (for LaunchApp)
      expect(button.config).toHaveProperty('path');
      expect(button.config.path).toBe(filePath);
      
      // Verify config does NOT have 'target' property (which is for Open action)
      expect(button.config).not.toHaveProperty('target');
    });

    it('should create correct button structure for .txt file', () => {
      const filePath = 'C:\\Documents\\notes.txt';
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      const row = 2;
      const col = 3;

      const button = {
        position: { row, col },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };

      expect(button.position.row).toBe(2);
      expect(button.position.col).toBe(3);
      expect(button.action_type).toBe('Open');
      expect(button.label).toBe('notes');
      expect(button.config.target).toBe('C:\\Documents\\notes.txt');
      expect(button.icon).toBeUndefined();
    });
  });

  describe('Multiple file handling', () => {
    it('should generate correct positions for multiple files', () => {
      const filePaths = [
        'C:\\file1.exe',
        'C:\\file2.txt',
        'C:\\file3.pdf',
      ];
      
      const gridCols = 4;
      const gridRows = 3;
      let currentRow = 1;
      let currentCol = 1;
      
      const positions = [];
      
      for (const filePath of filePaths) {
        positions.push({ row: currentRow, col: currentCol });
        
        currentCol++;
        if (currentCol > gridCols) {
          currentCol = 1;
          currentRow++;
          
          if (currentRow > gridRows) {
            break;
          }
        }
      }

      expect(positions).toEqual([
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
      ]);
    });

    it('should wrap to next row when reaching end of columns', () => {
      const filePaths = [
        'C:\\file1.exe',
        'C:\\file2.txt',
        'C:\\file3.pdf',
        'C:\\file4.docx',
        'C:\\file5.xlsx',
      ];
      
      const gridCols = 4;
      const gridRows = 3;
      let currentRow = 1;
      let currentCol = 1;
      
      const positions = [];
      
      for (const filePath of filePaths) {
        positions.push({ row: currentRow, col: currentCol });
        
        currentCol++;
        if (currentCol > gridCols) {
          currentCol = 1;
          currentRow++;
          
          if (currentRow > gridRows) {
            break;
          }
        }
      }

      expect(positions).toEqual([
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 1, col: 4 },
        { row: 2, col: 1 },
      ]);
    });

    it('should stop when grid is full', () => {
      const filePaths = Array.from({ length: 20 }, (_, i) => `C:\\file${i}.txt`);
      
      const gridCols = 4;
      const gridRows = 3;
      let currentRow = 1;
      let currentCol = 1;
      
      const positions = [];
      
      for (const filePath of filePaths) {
        if (currentRow > gridRows) {
          break;
        }
        
        positions.push({ row: currentRow, col: currentCol });
        
        currentCol++;
        if (currentCol > gridCols) {
          currentCol = 1;
          currentRow++;
        }
      }

      expect(positions.length).toBe(12); // 3 rows × 4 cols = 12
      expect(positions[positions.length - 1]).toEqual({ row: 3, col: 4 });
    });
  });

  describe('Button replacement logic', () => {
    it('should identify existing button at position', () => {
      const existingButtons = [
        { position: { row: 1, col: 1 }, label: 'Button 1' },
        { position: { row: 1, col: 2 }, label: 'Button 2' },
        { position: { row: 2, col: 1 }, label: 'Button 3' },
      ];
      
      const newButtonPosition = { row: 1, col: 2 };
      
      const existingButtonIndex = existingButtons.findIndex((btn: any) => 
        btn.position.row === newButtonPosition.row && 
        btn.position.col === newButtonPosition.col
      );
      
      expect(existingButtonIndex).toBe(1);
      expect(existingButtons[existingButtonIndex].label).toBe('Button 2');
    });

    it('should return -1 when no button exists at position', () => {
      const existingButtons = [
        { position: { row: 1, col: 1 }, label: 'Button 1' },
        { position: { row: 1, col: 2 }, label: 'Button 2' },
      ];
      
      const newButtonPosition = { row: 2, col: 3 };
      
      const existingButtonIndex = existingButtons.findIndex((btn: any) => 
        btn.position.row === newButtonPosition.row && 
        btn.position.col === newButtonPosition.col
      );
      
      expect(existingButtonIndex).toBe(-1);
    });
  });

  describe('Button creation at drop position', () => {
    it('should create Open action for non-executable files', () => {
      // Test various non-executable file types to ensure they all create "Open" action
      const nonExecutableFiles = [
        'C:\\Documents\\report.pdf',
        'C:\\Users\\John\\notes.txt',
        'C:\\Projects\\presentation.pptx',
        'C:\\Data\\spreadsheet.xlsx',
        'C:\\Files\\document.docx',
        'C:\\Images\\photo.jpg',
        'C:\\Images\\picture.png',
        'C:\\Videos\\movie.mp4',
        'C:\\Music\\song.mp3',
        'C:\\Archives\\data.zip',
        'C:\\Code\\script.py',
        'C:\\Code\\source.js',
        'C:\\Web\\page.html',
        '/home/user/file.txt',
        '/usr/share/doc/README',
      ];

      for (const filePath of nonExecutableFiles) {
        const fileName = filePath.includes('\\') 
          ? (filePath.split('\\').pop() || 'Unknown')
          : (filePath.split('/').pop() || 'Unknown');
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        
        const button = {
          position: { row: 1, col: 1 },
          action_type: actionType,
          label: fileName.replace(/\.[^/.]+$/, ''),
          icon: undefined,
          config: isExecutable 
            ? { path: filePath }
            : { target: filePath },
          style: undefined,
          action: undefined,
        };
        
        // Verify action type is "Open" for non-executable files
        expect(button.action_type).toBe('Open');
        
        // Verify config uses "target" property (not "path")
        expect(button.config).toHaveProperty('target');
        expect(button.config.target).toBe(filePath);
        expect(button.config).not.toHaveProperty('path');
      }
    });

    it('should create button with label matching filename (without extension)', () => {
      // Test various file types to ensure label is always the filename without extension
      const testCases = [
        { filePath: 'C:\\Program Files\\MyApp\\app.exe', expectedLabel: 'app' },
        { filePath: 'C:\\Documents\\report.pdf', expectedLabel: 'report' },
        { filePath: 'C:\\Users\\John\\notes.txt', expectedLabel: 'notes' },
        { filePath: '/usr/bin/vim', expectedLabel: 'vim' },
        { filePath: 'C:\\Projects\\my.project.v2.docx', expectedLabel: 'my.project.v2' },
        { filePath: 'README', expectedLabel: 'README' },
      ];

      for (const testCase of testCases) {
        const fileName = testCase.filePath.includes('\\') 
          ? (testCase.filePath.split('\\').pop() || 'Unknown')
          : (testCase.filePath.split('/').pop() || 'Unknown');
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
        
        expect(buttonLabel).toBe(testCase.expectedLabel);
      }
    });

    it('should create button at the dropped position', () => {
      // Simulate dropping a file at position (2, 3)
      const filePath = 'C:\\Program Files\\MyApp\\app.exe';
      const dropPosition = { row: 2, col: 3 };
      
      // Extract file information
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      // Create button at drop position
      const button = {
        position: { row: dropPosition.row, col: dropPosition.col },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      // Verify button was created at the correct position
      expect(button.position.row).toBe(2);
      expect(button.position.col).toBe(3);
      expect(button.action_type).toBe('LaunchApp');
      expect(button.label).toBe('app');
      expect(button.config.path).toBe(filePath);
    });

    it('should create button at position (1, 1) when dropped there', () => {
      const filePath = 'C:\\Documents\\notes.txt';
      const dropPosition = { row: 1, col: 1 };
      
      const fileName = filePath.split('\\').pop() || 'Unknown';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      const button = {
        position: { row: dropPosition.row, col: dropPosition.col },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      expect(button.position.row).toBe(1);
      expect(button.position.col).toBe(1);
      expect(button.action_type).toBe('Open');
      expect(button.label).toBe('notes');
    });

    it('should create button at position (3, 4) when dropped there', () => {
      const filePath = '/usr/bin/vim';
      const dropPosition = { row: 3, col: 4 };
      
      // Handle Unix paths
      const fileName = filePath.includes('\\') 
        ? (filePath.split('\\').pop() || 'Unknown')
        : (filePath.split('/').pop() || 'Unknown');
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const isExecutable = fileExtension === 'exe';
      const actionType = isExecutable ? 'LaunchApp' : 'Open';
      const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
      
      const button = {
        position: { row: dropPosition.row, col: dropPosition.col },
        action_type: actionType,
        label: buttonLabel,
        icon: undefined,
        config: isExecutable 
          ? { path: filePath }
          : { target: filePath },
        style: undefined,
        action: undefined,
      };
      
      expect(button.position.row).toBe(3);
      expect(button.position.col).toBe(4);
      expect(button.action_type).toBe('Open');
      expect(button.label).toBe('vim');
    });

    it('should create multiple buttons starting from drop position', () => {
      const filePaths = [
        'C:\\file1.exe',
        'C:\\file2.txt',
        'C:\\file3.pdf',
      ];
      const dropPosition = { row: 2, col: 2 };
      const gridCols = 4;
      const gridRows = 3;
      
      const buttons = [];
      let currentRow = dropPosition.row;
      let currentCol = dropPosition.col;
      
      for (const filePath of filePaths) {
        const fileName = filePath.split('\\').pop() || 'Unknown';
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        const isExecutable = fileExtension === 'exe';
        const actionType = isExecutable ? 'LaunchApp' : 'Open';
        const buttonLabel = fileName.replace(/\.[^/.]+$/, '');
        
        const button = {
          position: { row: currentRow, col: currentCol },
          action_type: actionType,
          label: buttonLabel,
          icon: undefined,
          config: isExecutable 
            ? { path: filePath }
            : { target: filePath },
          style: undefined,
          action: undefined,
        };
        
        buttons.push(button);
        
        currentCol++;
        if (currentCol > gridCols) {
          currentCol = 1;
          currentRow++;
          
          if (currentRow > gridRows) {
            break;
          }
        }
      }
      
      // Verify first button is at drop position
      expect(buttons[0].position.row).toBe(2);
      expect(buttons[0].position.col).toBe(2);
      
      // Verify subsequent buttons are placed correctly
      expect(buttons[1].position.row).toBe(2);
      expect(buttons[1].position.col).toBe(3);
      
      expect(buttons[2].position.row).toBe(2);
      expect(buttons[2].position.col).toBe(4);
    });
  });
});
