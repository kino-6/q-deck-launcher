/**
 * ProfileStateManager Integration Tests
 * 
 * Tests for profile state persistence with actual file I/O.
 * These tests verify that profile state is correctly saved to and loaded from disk.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProfileStateManager } from './ProfileStateManager.js';

// Create a consistent test directory path
const TEST_DIR = path.join(os.tmpdir(), 'q-deck-test-integration');

// Mock electron app module
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => TEST_DIR)
  }
}));

describe('ProfileStateManager Integration Tests', () => {
  let manager;
  let mockConfig;
  let testDir;
  let stateFilePath;

  beforeEach(() => {
    // Create test config
    mockConfig = {
      profiles: [
        {
          name: 'Default',
          hotkey: null,
          pages: [
            { name: 'Main', rows: 4, cols: 6, buttons: [] },
          ],
        },
        {
          name: 'Development',
          hotkey: 'Ctrl+1',
          pages: [
            { name: 'Code', rows: 4, cols: 6, buttons: [] },
            { name: 'Tools', rows: 4, cols: 6, buttons: [] },
          ],
        },
        {
          name: 'Gaming',
          hotkey: 'Ctrl+2',
          pages: [
            { name: 'Games', rows: 4, cols: 6, buttons: [] },
          ],
        },
      ],
    };

    // Create manager instance (will create temp directory)
    manager = new ProfileStateManager();
    testDir = path.dirname(manager.stateFilePath);
    stateFilePath = manager.stateFilePath;

    // Ensure test directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    try {
      if (fs.existsSync(stateFilePath)) {
        fs.unlinkSync(stateFilePath);
      }
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir, { recursive: true });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('File Persistence', () => {
    it('should create state file when switching profiles', () => {
      // Initially, state file should not exist
      if (fs.existsSync(stateFilePath)) {
        fs.unlinkSync(stateFilePath);
      }

      // Switch to a profile
      manager.switchToProfile(1, mockConfig);

      // State file should now exist
      expect(fs.existsSync(stateFilePath)).toBe(true);
    });

    it('should save profile state to file', () => {
      // Switch to Development profile
      manager.switchToProfile(1, mockConfig);

      // Read the state file
      const stateData = fs.readFileSync(stateFilePath, 'utf8');
      const state = JSON.parse(stateData);

      // Verify state content
      expect(state.currentProfileIndex).toBe(1);
      expect(state.currentPageIndex).toBe(0);
      expect(state.lastUpdated).toBeDefined();
    });

    it('should update state file when switching pages', () => {
      // Switch to Development profile
      manager.switchToProfile(1, mockConfig);

      // Switch to second page
      manager.switchToPage(1, mockConfig);

      // Read the state file
      const stateData = fs.readFileSync(stateFilePath, 'utf8');
      const state = JSON.parse(stateData);

      // Verify state content
      expect(state.currentProfileIndex).toBe(1);
      expect(state.currentPageIndex).toBe(1);
    });

    it('should load state from file on initialization', () => {
      // Create a state file manually
      const initialState = {
        currentProfileIndex: 2,
        currentPageIndex: 0,
        lastUpdated: new Date().toISOString()
      };

      fs.writeFileSync(stateFilePath, JSON.stringify(initialState, null, 2), 'utf8');

      // Create a new manager instance (should load the state)
      const newManager = new ProfileStateManager();

      // Verify state was loaded
      expect(newManager.getCurrentProfileIndex()).toBe(2);
      expect(newManager.getCurrentPageIndex()).toBe(0);
    });

    it('should persist state across manager instances', () => {
      // First manager: switch to Development profile, page 1
      manager.switchToProfile(1, mockConfig);
      manager.switchToPage(1, mockConfig);

      // Create a new manager instance
      const newManager = new ProfileStateManager();

      // Verify state was persisted
      expect(newManager.getCurrentProfileIndex()).toBe(1);
      expect(newManager.getCurrentPageIndex()).toBe(1);
    });

    it('should handle missing state file gracefully', () => {
      // Delete state file if it exists
      if (fs.existsSync(stateFilePath)) {
        fs.unlinkSync(stateFilePath);
      }

      // Create a new manager instance
      const newManager = new ProfileStateManager();

      // Should use default values
      expect(newManager.getCurrentProfileIndex()).toBe(0);
      expect(newManager.getCurrentPageIndex()).toBe(0);
    });

    it('should handle corrupted state file gracefully', () => {
      // Write invalid JSON to state file
      fs.writeFileSync(stateFilePath, 'invalid json content', 'utf8');

      // Create a new manager instance
      const newManager = new ProfileStateManager();

      // Should use default values
      expect(newManager.getCurrentProfileIndex()).toBe(0);
      expect(newManager.getCurrentPageIndex()).toBe(0);
    });

    it('should update lastUpdated timestamp on save', () => {
      // Switch to a profile
      manager.switchToProfile(1, mockConfig);

      // Read the state file
      const stateData1 = fs.readFileSync(stateFilePath, 'utf8');
      const state1 = JSON.parse(stateData1);
      const timestamp1 = new Date(state1.lastUpdated);

      // Wait a bit
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      return delay(10).then(() => {
        // Switch to another page
        manager.switchToPage(1, mockConfig);

        // Read the state file again
        const stateData2 = fs.readFileSync(stateFilePath, 'utf8');
        const state2 = JSON.parse(stateData2);
        const timestamp2 = new Date(state2.lastUpdated);

        // Timestamp should be updated
        expect(timestamp2.getTime()).toBeGreaterThan(timestamp1.getTime());
      });
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistency between memory and file', () => {
      // Perform multiple operations
      manager.switchToProfile(1, mockConfig);
      manager.switchToPage(1, mockConfig);
      manager.switchToProfile(2, mockConfig);

      // Read state from file
      const stateData = fs.readFileSync(stateFilePath, 'utf8');
      const state = JSON.parse(stateData);

      // Verify consistency
      expect(state.currentProfileIndex).toBe(manager.getCurrentProfileIndex());
      expect(state.currentPageIndex).toBe(manager.getCurrentPageIndex());
    });

    it('should save state after each navigation operation', () => {
      // Switch to Development profile
      manager.switchToProfile(1, mockConfig);

      // Navigate through pages
      manager.nextPage(mockConfig);
      
      // Read state from file
      const stateData = fs.readFileSync(stateFilePath, 'utf8');
      const state = JSON.parse(stateData);

      // Verify state was saved
      expect(state.currentPageIndex).toBe(1);

      // Navigate back
      manager.previousPage(mockConfig);

      // Read state again
      const stateData2 = fs.readFileSync(stateFilePath, 'utf8');
      const state2 = JSON.parse(stateData2);

      // Verify state was updated
      expect(state2.currentPageIndex).toBe(0);
    });
  });
});
