/**
 * Integration test for file icon extraction
 * Tests the complete flow from file drop to icon display
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('File Icon Extraction Integration', () => {
  let testFilesDir;

  beforeAll(async () => {
    // Wait for Electron app to be ready
    await app.whenReady();
    
    // Create test files directory
    testFilesDir = path.join(__dirname, '../test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup is optional - test files can remain for manual testing
  });

  describe('Real File Icon Extraction', () => {
    it('should extract icon from a real PNG file', async () => {
      const testFile = path.join(testFilesDir, 'test-image.png');
      
      // Create a minimal PNG file if it doesn't exist
      if (!fs.existsSync(testFile)) {
        // Minimal 1x1 PNG file
        const pngData = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
          0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
          0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
          0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
          0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
          0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(testFile, pngData);
      }

      // Extract icon using Electron's API
      const icon = await app.getFileIcon(testFile, { size: 'large' });
      
      expect(icon).toBeDefined();
      expect(icon.isEmpty()).toBe(false);
      
      // Convert to PNG and verify it's valid
      const pngBuffer = icon.toPNG();
      expect(pngBuffer).toBeInstanceOf(Buffer);
      expect(pngBuffer.length).toBeGreaterThan(0);
      
      // Verify it can be converted to base64
      const base64 = pngBuffer.toString('base64');
      expect(base64).toBeTruthy();
      expect(base64.length).toBeGreaterThan(0);
    });

    it('should extract icon from a text file', async () => {
      const testFile = path.join(testFilesDir, 'test-document.txt');
      
      // Create a test text file
      if (!fs.existsSync(testFile)) {
        fs.writeFileSync(testFile, 'This is a test file for icon extraction.');
      }

      // Extract icon
      const icon = await app.getFileIcon(testFile, { size: 'large' });
      
      expect(icon).toBeDefined();
      expect(icon.isEmpty()).toBe(false);
      
      const pngBuffer = icon.toPNG();
      expect(pngBuffer.length).toBeGreaterThan(0);
    });

    it('should handle different file extensions', async () => {
      const extensions = ['txt', 'json', 'md', 'log'];
      
      for (const ext of extensions) {
        const testFile = path.join(testFilesDir, `test.${ext}`);
        
        // Create test file
        if (!fs.existsSync(testFile)) {
          fs.writeFileSync(testFile, `Test content for .${ext} file`);
        }

        // Extract icon
        const icon = await app.getFileIcon(testFile, { size: 'large' });
        
        expect(icon, `Icon for .${ext} file should be extracted`).toBeDefined();
        expect(icon.isEmpty(), `Icon for .${ext} file should not be empty`).toBe(false);
      }
    });
  });

  describe('Icon Size Options', () => {
    it('should extract small icons', async () => {
      const testFile = path.join(testFilesDir, 'test-image.png');
      
      const icon = await app.getFileIcon(testFile, { size: 'small' });
      
      expect(icon).toBeDefined();
      expect(icon.isEmpty()).toBe(false);
    });

    it('should extract normal icons', async () => {
      const testFile = path.join(testFilesDir, 'test-image.png');
      
      const icon = await app.getFileIcon(testFile, { size: 'normal' });
      
      expect(icon).toBeDefined();
      expect(icon.isEmpty()).toBe(false);
    });

    it('should extract large icons', async () => {
      const testFile = path.join(testFilesDir, 'test-image.png');
      
      const icon = await app.getFileIcon(testFile, { size: 'large' });
      
      expect(icon).toBeDefined();
      expect(icon.isEmpty()).toBe(false);
    });
  });

  describe('Data URL Generation', () => {
    it('should generate valid data URL from extracted icon', async () => {
      const testFile = path.join(testFilesDir, 'test-image.png');
      
      const icon = await app.getFileIcon(testFile, { size: 'large' });
      const pngBuffer = icon.toPNG();
      const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      
      // Verify data URL format
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
      
      // Verify base64 content is valid
      const base64Content = dataUrl.split(',')[1];
      expect(base64Content).toBeTruthy();
      expect(base64Content.length).toBeGreaterThan(0);
      
      // Verify it can be decoded back to buffer
      const decodedBuffer = Buffer.from(base64Content, 'base64');
      expect(decodedBuffer.length).toBe(pngBuffer.length);
    });
  });
});
