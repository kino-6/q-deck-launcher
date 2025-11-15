import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAction } from './OpenAction.js';
import { shell } from 'electron';

// Mock electron shell
vi.mock('electron', () => ({
  shell: {
    openPath: vi.fn(),
    openExternal: vi.fn()
  }
}));

describe('OpenAction Integration Tests', () => {
  let openAction;

  beforeEach(() => {
    openAction = new OpenAction();
    vi.clearAllMocks();
  });

  describe('File Opening', () => {
    it('should open text file (.txt)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Users\\TestUser\\notes.txt'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Users\\TestUser\\notes.txt');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open PDF file (.pdf)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Documents\\manual.pdf'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Documents\\manual.pdf');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open image file (.jpg)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Pictures\\photo.jpg'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Pictures\\photo.jpg');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open image file (.png)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Pictures\\screenshot.png'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Pictures\\screenshot.png');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open Word document (.docx)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Documents\\report.docx'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Documents\\report.docx');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open Excel spreadsheet (.xlsx)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Documents\\data.xlsx'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Documents\\data.xlsx');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should handle file opening failure', async () => {
      shell.openPath.mockResolvedValue('File not found');

      const result = await openAction.execute({
        target: 'C:\\NonExistent\\file.txt'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to open');
      expect(result.message).toContain('File not found');
    });
  });

  describe('Folder Opening (Explorer)', () => {
    it('should open folder in Explorer', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Users\\TestUser\\Documents'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Users\\TestUser\\Documents');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open Downloads folder', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Users\\TestUser\\Downloads'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Users\\TestUser\\Downloads');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open Program Files folder', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Program Files'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Program Files');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open folder with environment variable', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: '%USERPROFILE%\\Documents'
      });

      expect(shell.openPath).toHaveBeenCalledWith('%USERPROFILE%\\Documents');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should handle folder opening failure', async () => {
      shell.openPath.mockResolvedValue('Access denied');

      const result = await openAction.execute({
        target: 'C:\\System32\\config'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to open');
      expect(result.message).toContain('Access denied');
    });
  });

  describe('URL Opening (Browser)', () => {
    it('should open HTTP URL in browser', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'http://example.com'
      });

      expect(shell.openPath).toHaveBeenCalledWith('http://example.com');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open HTTPS URL in browser', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'https://www.google.com'
      });

      expect(shell.openPath).toHaveBeenCalledWith('https://www.google.com');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open localhost URL', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'http://localhost:3000'
      });

      expect(shell.openPath).toHaveBeenCalledWith('http://localhost:3000');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open URL with query parameters', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'https://www.google.com/search?q=electron'
      });

      expect(shell.openPath).toHaveBeenCalledWith('https://www.google.com/search?q=electron');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open URL with hash fragment', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'https://github.com/electron/electron#readme'
      });

      expect(shell.openPath).toHaveBeenCalledWith('https://github.com/electron/electron#readme');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should handle URL opening failure', async () => {
      shell.openPath.mockResolvedValue('Invalid URL');

      const result = await openAction.execute({
        target: 'invalid://url'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to open');
      expect(result.message).toContain('Invalid URL');
    });
  });

  describe('Error Handling', () => {
    it('should return error when target is missing', async () => {
      const result = await openAction.execute({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('Target path is required');
      expect(shell.openPath).not.toHaveBeenCalled();
    });

    it('should return error when target is null', async () => {
      const result = await openAction.execute({ target: null });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Target path is required');
      expect(shell.openPath).not.toHaveBeenCalled();
    });

    it('should return error when target is empty string', async () => {
      const result = await openAction.execute({ target: '' });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Target path is required');
      expect(shell.openPath).not.toHaveBeenCalled();
    });

    it('should handle shell.openPath exception', async () => {
      shell.openPath.mockRejectedValue(new Error('Shell error'));

      const result = await openAction.execute({
        target: 'C:\\test.txt'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to open');
      expect(result.message).toContain('Shell error');
    });
  });

  describe('Special Paths', () => {
    it('should open network path (UNC)', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: '\\\\server\\share\\folder'
      });

      expect(shell.openPath).toHaveBeenCalledWith('\\\\server\\share\\folder');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open relative path', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: '.\\subfolder'
      });

      expect(shell.openPath).toHaveBeenCalledWith('.\\subfolder');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });

    it('should open path with spaces', async () => {
      shell.openPath.mockResolvedValue('');

      const result = await openAction.execute({
        target: 'C:\\Program Files\\My Application\\data.txt'
      });

      expect(shell.openPath).toHaveBeenCalledWith('C:\\Program Files\\My Application\\data.txt');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Opened');
    });
  });

  describe('Various File Types', () => {
    const fileTypes = [
      { ext: '.txt', path: 'C:\\test.txt', desc: 'text file' },
      { ext: '.pdf', path: 'C:\\test.pdf', desc: 'PDF document' },
      { ext: '.jpg', path: 'C:\\test.jpg', desc: 'JPEG image' },
      { ext: '.png', path: 'C:\\test.png', desc: 'PNG image' },
      { ext: '.gif', path: 'C:\\test.gif', desc: 'GIF image' },
      { ext: '.docx', path: 'C:\\test.docx', desc: 'Word document' },
      { ext: '.xlsx', path: 'C:\\test.xlsx', desc: 'Excel spreadsheet' },
      { ext: '.pptx', path: 'C:\\test.pptx', desc: 'PowerPoint presentation' },
      { ext: '.mp4', path: 'C:\\test.mp4', desc: 'MP4 video' },
      { ext: '.mp3', path: 'C:\\test.mp3', desc: 'MP3 audio' },
      { ext: '.zip', path: 'C:\\test.zip', desc: 'ZIP archive' },
      { ext: '.html', path: 'C:\\test.html', desc: 'HTML file' },
      { ext: '.json', path: 'C:\\test.json', desc: 'JSON file' },
      { ext: '.xml', path: 'C:\\test.xml', desc: 'XML file' },
      { ext: '.csv', path: 'C:\\test.csv', desc: 'CSV file' }
    ];

    fileTypes.forEach(({ ext, path, desc }) => {
      it(`should open ${desc} (${ext})`, async () => {
        shell.openPath.mockResolvedValue('');

        const result = await openAction.execute({ target: path });

        expect(shell.openPath).toHaveBeenCalledWith(path);
        expect(result.success).toBe(true);
        expect(result.message).toContain('Opened');
      });
    });
  });
});
