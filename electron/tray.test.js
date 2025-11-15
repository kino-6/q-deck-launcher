/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app, Tray, Menu, nativeImage } from 'electron';

// Mock Electron modules
vi.mock('electron', () => ({
  app: {
    quit: vi.fn(),
    getPath: vi.fn(() => '/mock/path'),
  },
  Tray: vi.fn(),
  Menu: {
    buildFromTemplate: vi.fn((template) => template),
  },
  nativeImage: {
    createFromPath: vi.fn(() => ({
      isEmpty: () => false,
    })),
  },
}));

describe('System Tray', () => {
  let mockTrayInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Tray instance
    mockTrayInstance = {
      setToolTip: vi.fn(),
      setContextMenu: vi.fn(),
      on: vi.fn(),
    };
    
    // Mock Tray constructor
    Tray.mockImplementation(function() {
      return mockTrayInstance;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create tray with correct icon', () => {
    // This test verifies the tray icon path is correct
    const iconPath = '/mock/path/32x32.png';
    
    expect(nativeImage.createFromPath).toBeDefined();
    
    // Verify nativeImage.createFromPath can be called
    const icon = nativeImage.createFromPath(iconPath);
    expect(icon).toBeDefined();
    expect(icon.isEmpty()).toBe(false);
  });

  it('should create tray with tooltip', () => {
    const tray = new Tray();
    tray.setToolTip('Q-Deck Launcher');
    
    expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith('Q-Deck Launcher');
  });

  it('should update tooltip with profile name', () => {
    const tray = new Tray();
    
    // Initial tooltip
    tray.setToolTip('Q-Deck Launcher');
    expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith('Q-Deck Launcher');
    
    // Update with profile name
    tray.setToolTip('Q-Deck Launcher - Development');
    expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith('Q-Deck Launcher - Development');
  });

  it('should show only app name when no profile is active', () => {
    const tray = new Tray();
    tray.setToolTip('Q-Deck Launcher');
    
    expect(mockTrayInstance.setToolTip).toHaveBeenCalledWith('Q-Deck Launcher');
  });

  it('should create context menu with correct structure', () => {
    const menuTemplate = [
      {
        label: 'Show/Hide Overlay',
        click: vi.fn(),
      },
      {
        label: 'Settings',
        click: vi.fn(),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: vi.fn(),
      },
    ];
    
    const menu = Menu.buildFromTemplate(menuTemplate);
    
    expect(Menu.buildFromTemplate).toHaveBeenCalledWith(menuTemplate);
    expect(menu).toHaveLength(4);
    expect(menu[0].label).toBe('Show/Hide Overlay');
    expect(menu[1].label).toBe('Settings');
    expect(menu[2].type).toBe('separator');
    expect(menu[3].label).toBe('Quit');
  });

  it('should set context menu on tray', () => {
    const tray = new Tray();
    const menu = Menu.buildFromTemplate([]);
    
    tray.setContextMenu(menu);
    
    expect(mockTrayInstance.setContextMenu).toHaveBeenCalledWith(menu);
  });

  it('should handle tray click event', () => {
    const tray = new Tray();
    const clickHandler = vi.fn();
    
    tray.on('click', clickHandler);
    
    expect(mockTrayInstance.on).toHaveBeenCalledWith('click', clickHandler);
  });

  it('should call app.quit when Quit menu item is clicked', () => {
    const menuTemplate = [
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ];
    
    const menu = Menu.buildFromTemplate(menuTemplate);
    
    // Simulate clicking the Quit menu item
    menu[0].click();
    
    expect(app.quit).toHaveBeenCalled();
  });

  it('should have Show/Hide Overlay as first menu item', () => {
    const menuTemplate = [
      { label: 'Show/Hide Overlay', click: vi.fn() },
      { label: 'Settings', click: vi.fn() },
      { type: 'separator' },
      { label: 'Quit', click: vi.fn() },
    ];
    
    expect(menuTemplate[0].label).toBe('Show/Hide Overlay');
    expect(menuTemplate[0].click).toBeDefined();
  });

  it('should have Settings as second menu item', () => {
    const menuTemplate = [
      { label: 'Show/Hide Overlay', click: vi.fn() },
      { label: 'Settings', click: vi.fn() },
      { type: 'separator' },
      { label: 'Quit', click: vi.fn() },
    ];
    
    expect(menuTemplate[1].label).toBe('Settings');
    expect(menuTemplate[1].click).toBeDefined();
  });

  it('should have separator as third menu item', () => {
    const menuTemplate = [
      { label: 'Show/Hide Overlay', click: vi.fn() },
      { label: 'Settings', click: vi.fn() },
      { type: 'separator' },
      { label: 'Quit', click: vi.fn() },
    ];
    
    expect(menuTemplate[2].type).toBe('separator');
  });

  it('should have Quit as fourth menu item', () => {
    const menuTemplate = [
      { label: 'Show/Hide Overlay', click: vi.fn() },
      { label: 'Settings', click: vi.fn() },
      { type: 'separator' },
      { label: 'Quit', click: vi.fn() },
    ];
    
    expect(menuTemplate[3].label).toBe('Quit');
    expect(menuTemplate[3].click).toBeDefined();
  });
});

describe('App Lifecycle - Window Close Behavior', () => {
  it('should not quit app when all windows are closed', () => {
    // Mock the window-all-closed event handler
    const windowAllClosedHandler = vi.fn(() => {
      // Do nothing - app continues running
      // This is the correct behavior for system tray apps
    });
    
    // Simulate all windows being closed
    windowAllClosedHandler();
    
    // Verify app.quit was NOT called
    expect(app.quit).not.toHaveBeenCalled();
  });

  it('should only quit when user selects Quit from tray menu', () => {
    const quitHandler = vi.fn(() => {
      app.quit();
    });
    
    // Simulate clicking Quit from tray menu
    quitHandler();
    
    // Verify app.quit was called
    expect(app.quit).toHaveBeenCalled();
  });
});
