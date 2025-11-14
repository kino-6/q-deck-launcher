/**
 * Tests for utility IPC handlers
 * Specifically testing file icon extraction for various file types
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExtractFileIconHandler } from './utilityHandlers.js';

describe('File Icon Extraction', () => {
  let mockApp;
  let mockEvent;
  let handler;

  beforeEach(() => {
    // Mock Electron app with getFileIcon method
    mockApp = {
      getFileIcon: vi.fn()
    };

    // Mock IPC event
    mockEvent = {
      sender: {
        send: vi.fn()
      }
    };

    // Create handler with mocked app
    handler = createExtractFileIconHandler(mockApp);
  });

  describe('Common File Types', () => {
    it('should extract icon for PNG image files', async () => {
      // Mock icon extraction
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-png-data')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\image.png');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.iconType).toBe('file');
      expect(mockApp.getFileIcon).toHaveBeenCalledWith('C:\\test\\image.png', { size: 'large' });
    });

    it('should extract icon for PDF document files', async () => {
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-pdf-icon')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\document.pdf');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
      expect(result.iconType).toBe('file');
    });

    it('should extract icon for DOCX document files', async () => {
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-docx-icon')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\document.docx');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
    });

    it('should extract icon for MP4 video files', async () => {
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-video-icon')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\video.mp4');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
    });

    it('should extract icon for ZIP archive files', async () => {
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-zip-icon')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\archive.zip');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
    });

    it('should extract icon for XLSX spreadsheet files', async () => {
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => Buffer.from('fake-xlsx-icon')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\spreadsheet.xlsx');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty icon gracefully', async () => {
      const mockIcon = {
        isEmpty: () => true,
        toPNG: () => Buffer.from('')
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\file.txt');

      expect(result.success).toBe(false);
      expect(result.message).toBe('No icon found');
    });

    it('should handle null icon gracefully', async () => {
      mockApp.getFileIcon.mockResolvedValue(null);

      const result = await handler(mockEvent, 'C:\\test\\file.txt');

      expect(result.success).toBe(false);
      expect(result.message).toBe('No icon found');
    });

    it('should handle extraction errors', async () => {
      mockApp.getFileIcon.mockRejectedValue(new Error('File not found'));

      const result = await handler(mockEvent, 'C:\\test\\nonexistent.txt');

      expect(result.success).toBe(false);
      expect(result.message).toBe('File not found');
    });
  });

  describe('Data URL Format', () => {
    it('should return properly formatted base64 data URL', async () => {
      const testData = Buffer.from('test-icon-data');
      const mockIcon = {
        isEmpty: () => false,
        toPNG: () => testData
      };
      mockApp.getFileIcon.mockResolvedValue(mockIcon);

      const result = await handler(mockEvent, 'C:\\test\\file.png');

      expect(result.success).toBe(true);
      expect(result.dataUrl).toBe(`data:image/png;base64,${testData.toString('base64')}`);
    });
  });
});
