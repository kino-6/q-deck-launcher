/**
 * Unit tests for portable mode functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Portable Mode Configuration', () => {
  let mockApp;
  let mockFs;
  let originalExistsSync;

  beforeEach(() => {
    // Mock electron app
    mockApp = {
      getPath: vi.fn((name) => {
        if (name === 'exe') return '/app/Q-Deck Launcher.exe';
        if (name === 'userData') return '/users/testuser/AppData/Roaming/q-deck-launcher';
        return '/mock/path';
      })
    };

    // Store original fs.existsSync
    originalExistsSync = fs.existsSync;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use portable config when config.yaml exists in app directory', () => {
    // Mock fs.existsSync to return true for portable config
    const expectedPortablePath = path.join('/app', 'config.yaml');
    vi.spyOn(fs, 'existsSync').mockImplementation((filePath) => {
      return path.normalize(filePath) === path.normalize(expectedPortablePath);
    });

    // Simulate getConfigPath logic
    const appDir = path.dirname(mockApp.getPath('exe'));
    const portableConfigPath = path.join(appDir, 'config.yaml');
    
    let configPath;
    if (fs.existsSync(portableConfigPath)) {
      configPath = portableConfigPath;
    } else {
      configPath = path.join(mockApp.getPath('userData'), 'config.yaml');
    }

    expect(path.normalize(configPath)).toBe(path.normalize(expectedPortablePath));
    expect(fs.existsSync).toHaveBeenCalled();
  });

  it('should use AppData config when portable config does not exist', () => {
    // Mock fs.existsSync to return false for portable config
    const expectedAppDataPath = path.join('/users/testuser/AppData/Roaming/q-deck-launcher', 'config.yaml');
    vi.spyOn(fs, 'existsSync').mockImplementation(() => false);

    // Simulate getConfigPath logic
    const appDir = path.dirname(mockApp.getPath('exe'));
    const portableConfigPath = path.join(appDir, 'config.yaml');
    
    let configPath;
    if (fs.existsSync(portableConfigPath)) {
      configPath = portableConfigPath;
    } else {
      configPath = path.join(mockApp.getPath('userData'), 'config.yaml');
    }

    expect(path.normalize(configPath)).toBe(path.normalize(expectedAppDataPath));
  });

  it('should place icon cache relative to config directory in portable mode', () => {
    const portableConfigPath = path.join('/app', 'config.yaml');
    const configDir = path.dirname(portableConfigPath);
    const iconCachePath = path.join(configDir, 'icon-cache');
    const expectedPath = path.join('/app', 'icon-cache');

    expect(path.normalize(iconCachePath)).toBe(path.normalize(expectedPath));
  });

  it('should place icon cache relative to config directory in normal mode', () => {
    const normalConfigPath = path.join('/users/testuser/AppData/Roaming/q-deck-launcher', 'config.yaml');
    const configDir = path.dirname(normalConfigPath);
    const iconCachePath = path.join(configDir, 'icon-cache');
    const expectedPath = path.join('/users/testuser/AppData/Roaming/q-deck-launcher', 'icon-cache');

    expect(path.normalize(iconCachePath)).toBe(path.normalize(expectedPath));
  });

  it('should correctly determine app directory from exe path', () => {
    const exePath = '/app/Q-Deck Launcher.exe';
    const appDir = path.dirname(exePath);

    expect(appDir).toBe('/app');
  });

  it('should handle Windows-style paths correctly', () => {
    const windowsExePath = 'C:\\Program Files\\Q-Deck\\Q-Deck Launcher.exe';
    const appDir = path.dirname(windowsExePath);
    const portableConfigPath = path.join(appDir, 'config.yaml');

    expect(portableConfigPath).toContain('Q-Deck');
    expect(portableConfigPath).toContain('config.yaml');
  });
});

describe('Portable Mode Build Configuration', () => {
  it('should have portable target in electron-builder config', async () => {
    // Read package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check if portable target exists
    expect(packageJson.build).toBeDefined();
    expect(packageJson.build.win).toBeDefined();
    expect(packageJson.build.win.target).toContain('portable');
  });

  it('should have correct output directory configured', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    expect(packageJson.build.directories).toBeDefined();
    expect(packageJson.build.directories.output).toBe('release');
  });
});
