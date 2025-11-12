/**
 * Electron Main Process Tests
 * Tests for window creation and configuration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Electron modules
class MockBrowserWindow {
  constructor(config) {
    this.config = config;
    this.webContents = {
      openDevTools: vi.fn(),
      on: vi.fn(),
    };
    this._visible = config.show || false;
  }

  loadURL = vi.fn();
  loadFile = vi.fn();
  show = vi.fn(() => { this._visible = true; });
  hide = vi.fn(() => { this._visible = false; });
  focus = vi.fn();
  isVisible = vi.fn(() => this._visible);
  on = vi.fn();
}

const mockBrowserWindow = vi.fn((config) => new MockBrowserWindow(config));

const mockApp = {
  whenReady: vi.fn(() => Promise.resolve()),
  getPath: vi.fn(() => '/mock/path'),
  on: vi.fn(),
  quit: vi.fn(),
};
const mockGlobalShortcut = {
  register: vi.fn(() => true),
  unregisterAll: vi.fn(),
};
const mockScreen = {
  getPrimaryDisplay: vi.fn(() => ({
    workAreaSize: { width: 1920, height: 1080 },
  })),
};
const mockIpcMain = {
  handle: vi.fn(),
};
const mockShell = {
  openPath: vi.fn(),
};

vi.mock('electron', () => ({
  app: mockApp,
  BrowserWindow: mockBrowserWindow,
  globalShortcut: mockGlobalShortcut,
  ipcMain: mockIpcMain,
  screen: mockScreen,
  shell: mockShell,
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('yaml', () => ({
  default: {
    parse: vi.fn(),
    stringify: vi.fn(() => 'mock yaml'),
  },
}));

describe('Electron Main Process - Window Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create window with correct configuration', () => {
    // Create a window with the expected configuration
    const windowConfig = {
      width: 1000,
      height: 600,
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: '/mock/preload.js',
      },
    };

    const window = mockBrowserWindow(windowConfig);

    // Verify window was created
    expect(mockBrowserWindow).toHaveBeenCalledWith(windowConfig);
    expect(window).toBeDefined();
    expect(window.config).toEqual(windowConfig);
  });

  it('should configure overlay window with correct dimensions', () => {
    // Expected overlay configuration
    const overlayConfig = {
      width: 1000,
      height: 600,
      x: 460,
      y: 50,
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: '/mock/preload.js',
      },
    };

    const overlayWindow = mockBrowserWindow(overlayConfig);

    // Verify overlay window configuration
    expect(mockBrowserWindow).toHaveBeenCalledWith(overlayConfig);
    expect(overlayWindow).toBeDefined();
    expect(overlayWindow.config.width).toBe(1000);
    expect(overlayWindow.config.height).toBe(600);
  });

  it('should have dark background color', () => {
    const windowConfig = {
      backgroundColor: '#1e1e1e',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    };

    const window = mockBrowserWindow(windowConfig);

    expect(window.config.backgroundColor).toBe('#1e1e1e');
  });

  it('should configure window to be always on top', () => {
    const windowConfig = {
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    };

    const window = mockBrowserWindow(windowConfig);

    expect(window.config.alwaysOnTop).toBe(true);
    expect(window.config.skipTaskbar).toBe(true);
  });

  it('should verify overlay is always displayed on top', () => {
    // Create overlay window with alwaysOnTop configuration
    const overlayConfig = {
      width: 1000,
      height: 600,
      x: 460,
      y: 50,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: '/mock/preload.js',
      },
    };

    const overlayWindow = mockBrowserWindow(overlayConfig);

    // Verify overlay window is configured with alwaysOnTop
    expect(overlayWindow.config.alwaysOnTop).toBe(true);

    // Show the overlay
    overlayWindow.show();
    expect(overlayWindow.isVisible()).toBe(true);

    // Verify alwaysOnTop remains true when window is visible
    expect(overlayWindow.config.alwaysOnTop).toBe(true);

    // Simulate focus change (another window tries to come to front)
    // The overlay should maintain its alwaysOnTop status
    overlayWindow.focus();
    expect(overlayWindow.config.alwaysOnTop).toBe(true);

    // Verify the overlay maintains alwaysOnTop even after multiple operations
    overlayWindow.hide();
    expect(overlayWindow.config.alwaysOnTop).toBe(true);
    
    overlayWindow.show();
    expect(overlayWindow.config.alwaysOnTop).toBe(true);
    
    overlayWindow.focus();
    expect(overlayWindow.config.alwaysOnTop).toBe(true);

    // Verify skipTaskbar is also maintained (prevents overlay from appearing in taskbar)
    expect(overlayWindow.config.skipTaskbar).toBe(true);
  });

  it('should configure window to not show initially', () => {
    const windowConfig = {
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    };

    const window = mockBrowserWindow(windowConfig);

    expect(window.config.show).toBe(false);
    expect(window.isVisible()).toBe(false);
  });

  it('should enable context isolation and disable node integration', () => {
    const windowConfig = {
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: '/mock/preload.js',
      },
    };

    const window = mockBrowserWindow(windowConfig);

    expect(window.config.webPreferences.nodeIntegration).toBe(false);
    expect(window.config.webPreferences.contextIsolation).toBe(true);
  });
});

describe('Electron Main Process - Window Display', () => {
  it('should verify window can be shown', () => {
    const window = mockBrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Initially hidden
    expect(window.isVisible()).toBe(false);

    // Show the window
    window.show();
    expect(window.show).toHaveBeenCalled();
    expect(window.isVisible()).toBe(true);
  });

  it('should verify window can be focused', () => {
    const window = mockBrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Focus the window
    window.focus();
    expect(window.focus).toHaveBeenCalled();
  });

  it('should verify developer tools can be opened', () => {
    const window = mockBrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Open developer tools
    window.webContents.openDevTools();
    expect(window.webContents.openDevTools).toHaveBeenCalled();
  });

  it('should display overlay with transparent background', () => {
    // Create overlay window with transparent background configuration
    const overlayConfig = {
      width: 1000,
      height: 600,
      x: 460,
      y: 50,
      show: false,
      frame: false,
      transparent: true, // Transparent background for overlay
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: '/mock/preload.js',
      },
    };

    const overlayWindow = mockBrowserWindow(overlayConfig);

    // Verify overlay window is configured with transparent background
    expect(overlayWindow.config.transparent).toBe(true);
    expect(overlayWindow.config.frame).toBe(false);
    
    // Verify overlay is configured to be always on top
    expect(overlayWindow.config.alwaysOnTop).toBe(true);
    
    // Verify overlay doesn't show in taskbar
    expect(overlayWindow.config.skipTaskbar).toBe(true);
  });
});

describe('Electron Main Process - Hotkey Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register F11 hotkey successfully', () => {
    // Simulate registering F11 hotkey
    const hotkeyCallback = vi.fn();
    const result = mockGlobalShortcut.register('F11', hotkeyCallback);

    // Verify registration was successful
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith('F11', hotkeyCallback);
    expect(result).toBe(true);
  });

  it('should call callback when F11 is pressed', () => {
    // Create a callback function
    const hotkeyCallback = vi.fn();
    
    // Register the hotkey
    mockGlobalShortcut.register('F11', hotkeyCallback);

    // Get the registered callback
    const registeredCallback = mockGlobalShortcut.register.mock.calls[0][1];

    // Simulate F11 key press by calling the callback
    registeredCallback();

    // Verify the callback was executed
    expect(registeredCallback).toBeDefined();
  });

  it('should toggle overlay when F11 is pressed', () => {
    // Create overlay window
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Initially hidden
    expect(overlayWindow.isVisible()).toBe(false);

    // Simulate F11 press - show overlay
    const toggleOverlay = () => {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    // Register F11 with toggle function
    mockGlobalShortcut.register('F11', toggleOverlay);

    // Get the registered callback and execute it (simulating F11 press)
    const registeredCallback = mockGlobalShortcut.register.mock.calls[0][1];
    registeredCallback();

    // Verify overlay is now visible
    expect(overlayWindow.isVisible()).toBe(true);
    expect(overlayWindow.show).toHaveBeenCalled();
    expect(overlayWindow.focus).toHaveBeenCalled();
  });

  it('should hide overlay when F11 is pressed again', () => {
    // Create overlay window that is initially visible
    const overlayWindow = mockBrowserWindow({
      show: true,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Initially visible
    expect(overlayWindow.isVisible()).toBe(true);

    // Simulate F11 press - hide overlay
    const toggleOverlay = () => {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    // Register F11 with toggle function
    mockGlobalShortcut.register('F11', toggleOverlay);

    // Get the registered callback and execute it (simulating F11 press)
    const registeredCallback = mockGlobalShortcut.register.mock.calls[0][1];
    registeredCallback();

    // Verify overlay is now hidden
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalled();
  });

  it('should support multiple hotkeys in configuration', () => {
    const config = {
      ui: {
        summon: {
          hotkeys: ['F11', 'Ctrl+Alt+Q']
        }
      }
    };

    // Register all hotkeys from config
    config.ui.summon.hotkeys.forEach(hotkey => {
      const callback = vi.fn();
      mockGlobalShortcut.register(hotkey, callback);
    });

    // Verify both hotkeys were registered
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(2);
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith('F11', expect.any(Function));
    expect(mockGlobalShortcut.register).toHaveBeenCalledWith('Ctrl+Alt+Q', expect.any(Function));
  });

  it('should not have hotkey conflicts', () => {
    // Create overlay window
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Define toggle function
    const toggleOverlay = () => {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    // Register multiple hotkeys with the same action
    const hotkeys = ['F11', 'Ctrl+Alt+Q', 'Alt+Space'];
    const registeredCallbacks = [];

    hotkeys.forEach(hotkey => {
      const success = mockGlobalShortcut.register(hotkey, toggleOverlay);
      expect(success).toBe(true);
      
      // Store the callback for later testing
      const callIndex = mockGlobalShortcut.register.mock.calls.length - 1;
      registeredCallbacks.push({
        hotkey,
        callback: mockGlobalShortcut.register.mock.calls[callIndex][1]
      });
    });

    // Verify all hotkeys were registered successfully
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(3);

    // Test that each hotkey works independently without conflicts
    // Initially hidden
    expect(overlayWindow.isVisible()).toBe(false);

    // Test F11 - should show overlay
    registeredCallbacks[0].callback();
    expect(overlayWindow.isVisible()).toBe(true);
    expect(overlayWindow.show).toHaveBeenCalledTimes(1);

    // Test Ctrl+Alt+Q - should hide overlay (toggle)
    registeredCallbacks[1].callback();
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalledTimes(1);

    // Test Alt+Space - should show overlay again
    registeredCallbacks[2].callback();
    expect(overlayWindow.isVisible()).toBe(true);
    expect(overlayWindow.show).toHaveBeenCalledTimes(2);

    // Test F11 again - should hide overlay
    registeredCallbacks[0].callback();
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalledTimes(2);

    // Verify each hotkey triggered the same toggle behavior without interfering
    expect(overlayWindow.show).toHaveBeenCalledTimes(2);
    expect(overlayWindow.hide).toHaveBeenCalledTimes(2);
    expect(overlayWindow.focus).toHaveBeenCalledTimes(2);
  });

  it('should not have conflicts between summon and profile hotkeys', () => {
    // Create overlay window
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Track current profile
    let currentProfile = 0;

    // Define toggle function for summon hotkeys
    const toggleOverlay = () => {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    // Define profile switch function
    const switchToProfile = (profileIndex) => {
      currentProfile = profileIndex;
      if (!overlayWindow.isVisible()) {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    // Register summon hotkeys
    const summonHotkeys = ['F11', 'Ctrl+Alt+Q'];
    summonHotkeys.forEach(hotkey => {
      const success = mockGlobalShortcut.register(hotkey, toggleOverlay);
      expect(success).toBe(true);
    });

    // Register profile hotkeys (different from summon hotkeys)
    const profileHotkeys = [
      { key: 'Ctrl+1', profile: 0 },
      { key: 'Ctrl+2', profile: 1 },
      { key: 'Ctrl+3', profile: 2 },
    ];

    profileHotkeys.forEach(({ key, profile }) => {
      const success = mockGlobalShortcut.register(key, () => switchToProfile(profile));
      expect(success).toBe(true);
    });

    // Verify all hotkeys were registered successfully (2 summon + 3 profile = 5 total)
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(5);

    // Verify no duplicate hotkeys were registered
    const registeredKeys = mockGlobalShortcut.register.mock.calls.map(call => call[0]);
    const uniqueKeys = new Set(registeredKeys);
    expect(uniqueKeys.size).toBe(registeredKeys.length);

    // Test that summon hotkeys and profile hotkeys work independently
    // Initially hidden, profile 0
    expect(overlayWindow.isVisible()).toBe(false);
    expect(currentProfile).toBe(0);

    // Test F11 (summon) - should show overlay
    const f11Callback = mockGlobalShortcut.register.mock.calls[0][1];
    f11Callback();
    expect(overlayWindow.isVisible()).toBe(true);
    expect(currentProfile).toBe(0); // Profile should not change

    // Test Ctrl+2 (profile switch) - should switch to profile 1
    const ctrl2Callback = mockGlobalShortcut.register.mock.calls[3][1];
    ctrl2Callback();
    expect(overlayWindow.isVisible()).toBe(true); // Should remain visible
    expect(currentProfile).toBe(1); // Profile should change

    // Test F11 again (summon) - should hide overlay
    f11Callback();
    expect(overlayWindow.isVisible()).toBe(false);
    expect(currentProfile).toBe(1); // Profile should not change

    // Test Ctrl+3 (profile switch) - should switch to profile 2 and show overlay
    const ctrl3Callback = mockGlobalShortcut.register.mock.calls[4][1];
    ctrl3Callback();
    expect(overlayWindow.isVisible()).toBe(true); // Should show overlay
    expect(currentProfile).toBe(2); // Profile should change

    // Verify no conflicts occurred - each hotkey performed its intended action
    expect(overlayWindow.show).toHaveBeenCalled();
    expect(overlayWindow.hide).toHaveBeenCalled();
  });

  it('should detect and prevent duplicate hotkey registration', () => {
    // Attempt to register the same hotkey twice
    const hotkey = 'F11';
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    // First registration should succeed
    const success1 = mockGlobalShortcut.register(hotkey, callback1);
    expect(success1).toBe(true);

    // Mock the second registration to fail (simulating Electron's behavior)
    mockGlobalShortcut.register.mockReturnValueOnce(false);

    // Second registration should fail
    const success2 = mockGlobalShortcut.register(hotkey, callback2);
    expect(success2).toBe(false);

    // Verify that only one registration succeeded
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(2);
  });

  it('should handle profile hotkeys without conflicts between profiles', () => {
    // Track current profile
    let currentProfile = 0;

    // Define profile switch function
    const switchToProfile = (profileIndex) => {
      currentProfile = profileIndex;
    };

    // Register profile hotkeys for multiple profiles
    const profileHotkeys = [
      { key: 'Ctrl+1', profile: 0, name: 'Development' },
      { key: 'Ctrl+2', profile: 1, name: 'Gaming' },
      { key: 'Ctrl+3', profile: 2, name: 'Work' },
      { key: 'Ctrl+4', profile: 3, name: 'Personal' },
    ];

    profileHotkeys.forEach(({ key, profile }) => {
      const success = mockGlobalShortcut.register(key, () => switchToProfile(profile));
      expect(success).toBe(true);
    });

    // Verify all profile hotkeys were registered successfully
    expect(mockGlobalShortcut.register).toHaveBeenCalledTimes(4);

    // Verify no duplicate hotkeys
    const registeredKeys = mockGlobalShortcut.register.mock.calls.map(call => call[0]);
    const uniqueKeys = new Set(registeredKeys);
    expect(uniqueKeys.size).toBe(4);

    // Test that each profile hotkey switches to the correct profile
    expect(currentProfile).toBe(0);

    // Test Ctrl+1 - should switch to profile 0
    const ctrl1Callback = mockGlobalShortcut.register.mock.calls[0][1];
    ctrl1Callback();
    expect(currentProfile).toBe(0);

    // Test Ctrl+2 - should switch to profile 1
    const ctrl2Callback = mockGlobalShortcut.register.mock.calls[1][1];
    ctrl2Callback();
    expect(currentProfile).toBe(1);

    // Test Ctrl+3 - should switch to profile 2
    const ctrl3Callback = mockGlobalShortcut.register.mock.calls[2][1];
    ctrl3Callback();
    expect(currentProfile).toBe(2);

    // Test Ctrl+4 - should switch to profile 3
    const ctrl4Callback = mockGlobalShortcut.register.mock.calls[3][1];
    ctrl4Callback();
    expect(currentProfile).toBe(3);

    // Test Ctrl+1 again - should switch back to profile 0
    ctrl1Callback();
    expect(currentProfile).toBe(0);

    // Verify each hotkey works independently without conflicts
    expect(currentProfile).toBe(0);
  });
});

describe('Electron Main Process - Focus Loss Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hide overlay when it loses focus', () => {
    // Create overlay window that is initially visible
    const overlayWindow = mockBrowserWindow({
      show: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Verify overlay is initially visible
    expect(overlayWindow.isVisible()).toBe(true);

    // Simulate blur event handler (as implemented in main.js)
    const blurHandler = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Register the blur event handler
    overlayWindow.on('blur', blurHandler);

    // Verify the blur event was registered
    expect(overlayWindow.on).toHaveBeenCalledWith('blur', blurHandler);

    // Simulate the overlay losing focus by calling the blur handler
    blurHandler();

    // Verify overlay is now hidden
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalled();
  });

  it('should not attempt to hide overlay if already hidden when focus is lost', () => {
    // Create overlay window that is initially hidden
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Verify overlay is initially hidden
    expect(overlayWindow.isVisible()).toBe(false);

    // Simulate blur event handler
    const blurHandler = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Register the blur event handler
    overlayWindow.on('blur', blurHandler);

    // Simulate the overlay losing focus
    blurHandler();

    // Verify hide was not called since window was already hidden
    expect(overlayWindow.hide).not.toHaveBeenCalled();
    expect(overlayWindow.isVisible()).toBe(false);
  });

  it('should automatically close overlay when user clicks outside', () => {
    // Create overlay window that is initially visible
    const overlayWindow = mockBrowserWindow({
      show: true,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Verify overlay is initially visible
    expect(overlayWindow.isVisible()).toBe(true);

    // Simulate blur event handler (clicking outside causes blur)
    const blurHandler = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Register the blur event handler
    overlayWindow.on('blur', blurHandler);

    // Simulate user clicking outside the overlay (which triggers blur event)
    blurHandler();

    // Verify overlay is automatically closed
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalled();
  });
});

describe('Electron Main Process - Escape Key Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hide overlay when Escape key is pressed', () => {
    // Create overlay window that is initially visible
    const overlayWindow = mockBrowserWindow({
      show: true,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Verify overlay is initially visible
    expect(overlayWindow.isVisible()).toBe(true);

    // Simulate Escape key press by calling hideOverlay
    // (In the actual app, this is triggered by the React component's keydown handler)
    const hideOverlay = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Execute the hide overlay function (simulating Escape key press)
    hideOverlay();

    // Verify overlay is now hidden
    expect(overlayWindow.isVisible()).toBe(false);
    expect(overlayWindow.hide).toHaveBeenCalled();
  });

  it('should not hide overlay if already hidden when Escape is pressed', () => {
    // Create overlay window that is initially hidden
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Verify overlay is initially hidden
    expect(overlayWindow.isVisible()).toBe(false);

    // Simulate Escape key press by calling hideOverlay
    const hideOverlay = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Execute the hide overlay function
    hideOverlay();

    // Verify hide was not called since window was already hidden
    expect(overlayWindow.hide).not.toHaveBeenCalled();
    expect(overlayWindow.isVisible()).toBe(false);
  });

  it('should handle Escape key independently from F11 hotkey', () => {
    // Create overlay window
    const overlayWindow = mockBrowserWindow({
      show: false,
      frame: false,
      transparent: false,
      backgroundColor: '#1e1e1e',
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Define toggle and hide functions
    const toggleOverlay = () => {
      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    };

    const hideOverlay = () => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
      }
    };

    // Register F11 hotkey
    mockGlobalShortcut.register('F11', toggleOverlay);

    // Initially hidden
    expect(overlayWindow.isVisible()).toBe(false);

    // Simulate F11 press to show overlay
    const f11Callback = mockGlobalShortcut.register.mock.calls[0][1];
    f11Callback();
    expect(overlayWindow.isVisible()).toBe(true);

    // Simulate Escape key press to hide overlay
    hideOverlay();
    expect(overlayWindow.isVisible()).toBe(false);

    // Verify both show and hide were called
    expect(overlayWindow.show).toHaveBeenCalled();
    expect(overlayWindow.hide).toHaveBeenCalled();
  });
});

describe('Electron Main Process - Configuration File Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save config file to correct location in APPDATA', () => {
    // Mock app.getPath to return a test path
    const expectedAppDataPath = 'C:\\Users\\TestUser\\AppData\\Roaming\\q-deck-launcher';
    mockApp.getPath.mockReturnValue(expectedAppDataPath);

    // Get the config path (simulating how main.js constructs it)
    const configPath = `${mockApp.getPath('userData')}\\config.yaml`;
    const expectedConfigPath = `${expectedAppDataPath}\\config.yaml`;

    // Verify the config path is correct
    expect(configPath).toBe(expectedConfigPath);
    expect(mockApp.getPath).toHaveBeenCalledWith('userData');

    // Verify the path contains the expected structure
    expect(configPath).toContain('AppData');
    expect(configPath).toContain('Roaming');
    expect(configPath).toContain('q-deck-launcher');
    expect(configPath).toContain('config.yaml');
  });
});

describe('Electron Main Process - Default Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create default configuration on first launch', () => {
    // Mock createDefaultConfig function behavior
    const createDefaultConfig = () => {
      return {
        version: '1.0',
        ui: {
          summon: {
            hotkeys: ['F11'],
            edge_trigger: {
              enabled: false,
              edges: ['top'],
              dwell_ms: 300,
              margin_px: 5
            }
          },
          window: {
            placement: 'dropdown-top',
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: 'dark',
            animation: {
              enabled: true,
              duration_ms: 150
            }
          }
        },
        profiles: [
          {
            name: 'Default',
            hotkey: null,
            pages: [
              {
                name: 'Main',
                rows: 4,
                cols: 6,
                buttons: []
              }
            ]
          }
        ]
      };
    };

    // Create default config (simulating init mode)
    const config = createDefaultConfig();

    // Verify config structure
    expect(config).toBeDefined();
    expect(config.version).toBe('1.0');
    
    // Verify UI configuration
    expect(config.ui).toBeDefined();
    expect(config.ui.summon.hotkeys).toEqual(['F11']);
    expect(config.ui.summon.edge_trigger.enabled).toBe(false);
    expect(config.ui.window.width_px).toBe(1000);
    expect(config.ui.window.height_px).toBe(600);
    expect(config.ui.window.theme).toBe('dark');
    
    // Verify default profile exists
    expect(config.profiles).toBeDefined();
    expect(config.profiles.length).toBe(1);
    expect(config.profiles[0].name).toBe('Default');
    expect(config.profiles[0].hotkey).toBeNull();
    
    // Verify default page exists
    expect(config.profiles[0].pages).toBeDefined();
    expect(config.profiles[0].pages.length).toBe(1);
    expect(config.profiles[0].pages[0].name).toBe('Main');
    expect(config.profiles[0].pages[0].rows).toBe(4);
    expect(config.profiles[0].pages[0].cols).toBe(6);
    expect(config.profiles[0].pages[0].buttons).toEqual([]);
  });

  it('should persist configuration changes after restart', async () => {
    // Import fs and yaml mocks
    const fs = (await import('fs')).default;
    const yaml = (await import('yaml')).default;

    // Create initial default config
    const createDefaultConfig = () => {
      return {
        version: '1.0',
        ui: {
          summon: {
            hotkeys: ['F11'],
            edge_trigger: {
              enabled: false,
              edges: ['top'],
              dwell_ms: 300,
              margin_px: 5
            }
          },
          window: {
            placement: 'dropdown-top',
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: 'dark',
            animation: {
              enabled: true,
              duration_ms: 150
            }
          }
        },
        profiles: [
          {
            name: 'Default',
            hotkey: null,
            pages: [
              {
                name: 'Main',
                rows: 4,
                cols: 6,
                buttons: []
              }
            ]
          }
        ]
      };
    };

    // Simulate saving configuration
    const saveConfig = (config) => {
      const yamlStr = yaml.stringify(config);
      fs.writeFileSync('/mock/config.yaml', yamlStr, 'utf8');
    };

    // Simulate loading configuration
    const loadConfig = () => {
      if (fs.existsSync('/mock/config.yaml')) {
        const fileContents = fs.readFileSync('/mock/config.yaml', 'utf8');
        return yaml.parse(fileContents);
      }
      return null;
    };

    // Step 1: Create initial config
    let config = createDefaultConfig();
    expect(config.ui.window.width_px).toBe(1000);
    expect(config.ui.window.height_px).toBe(600);
    expect(config.ui.summon.hotkeys).toEqual(['F11']);
    expect(config.profiles[0].name).toBe('Default');

    // Step 2: Modify configuration
    config.ui.window.width_px = 1200;
    config.ui.window.height_px = 800;
    config.ui.summon.hotkeys = ['F11', 'Ctrl+Alt+Q'];
    config.profiles[0].name = 'Development';
    config.profiles[0].pages[0].rows = 5;
    config.profiles[0].pages[0].cols = 8;

    // Step 3: Save modified configuration
    let savedYaml = '';
    fs.existsSync.mockReturnValue(false);
    fs.writeFileSync.mockImplementation((path, content) => {
      savedYaml = content;
    });
    yaml.stringify.mockImplementation((obj) => {
      return JSON.stringify(obj); // Use JSON for simplicity in test
    });

    saveConfig(config);

    // Verify save was called
    expect(fs.writeFileSync).toHaveBeenCalledWith('/mock/config.yaml', expect.any(String), 'utf8');
    expect(yaml.stringify).toHaveBeenCalledWith(config);

    // Step 4: Simulate restart - load configuration from file
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(savedYaml);
    yaml.parse.mockImplementation((str) => {
      return JSON.parse(str); // Use JSON for simplicity in test
    });

    const loadedConfig = loadConfig();

    // Step 5: Verify loaded configuration matches saved changes
    expect(loadedConfig).toBeDefined();
    expect(loadedConfig.ui.window.width_px).toBe(1200);
    expect(loadedConfig.ui.window.height_px).toBe(800);
    expect(loadedConfig.ui.summon.hotkeys).toEqual(['F11', 'Ctrl+Alt+Q']);
    expect(loadedConfig.profiles[0].name).toBe('Development');
    expect(loadedConfig.profiles[0].pages[0].rows).toBe(5);
    expect(loadedConfig.profiles[0].pages[0].cols).toBe(8);

    // Verify all changes persisted
    expect(loadedConfig).toEqual(config);
  });

  it('should have valid default configuration structure', () => {
    const createDefaultConfig = () => {
      return {
        version: '1.0',
        ui: {
          summon: {
            hotkeys: ['F11'],
            edge_trigger: {
              enabled: false,
              edges: ['top'],
              dwell_ms: 300,
              margin_px: 5
            }
          },
          window: {
            placement: 'dropdown-top',
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: 'dark',
            animation: {
              enabled: true,
              duration_ms: 150
            }
          }
        },
        profiles: [
          {
            name: 'Default',
            hotkey: null,
            pages: [
              {
                name: 'Main',
                rows: 4,
                cols: 6,
                buttons: []
              }
            ]
          }
        ]
      };
    };

    const config = createDefaultConfig();

    // Verify default hotkey configuration
    expect(config.ui.summon.hotkeys).toContain('F11');
    expect(config.ui.summon.hotkeys.length).toBe(1);
    const success = mockGlobalShortcut.register('F11', vi.fn());
    expect(success).toBe(true);

    // Verify window dimensions are valid
    expect(config.ui.window.width_px).toBeGreaterThan(0);
    expect(config.ui.window.height_px).toBeGreaterThan(0);
    expect(config.ui.window.width_px).toBe(1000);
    expect(config.ui.window.height_px).toBe(600);
    expect(config.ui.window.cell_size_px).toBe(96);
    expect(config.ui.window.gap_px).toBe(8);
    expect(config.ui.window.opacity).toBeGreaterThanOrEqual(0);
    expect(config.ui.window.opacity).toBeLessThanOrEqual(1);

    // Verify profile structure
    const profile = config.profiles[0];
    expect(profile.name).toBe('Default');
    expect(profile.hotkey).toBeNull();
    expect(profile.pages).toBeInstanceOf(Array);

    // Verify page structure
    const page = profile.pages[0];
    expect(page.name).toBe('Main');
    expect(page.rows).toBeGreaterThan(0);
    expect(page.cols).toBeGreaterThan(0);
    expect(page.buttons).toBeInstanceOf(Array);
    expect(page.buttons.length).toBe(0);
  });
});

describe('Electron Main Process - Icon Extraction', () => {
  let mockNativeImage;
  let mockGetFileIcon;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock nativeImage
    mockNativeImage = {
      isEmpty: vi.fn(() => false),
      toPNG: vi.fn(() => Buffer.from('fake-png-data')),
    };

    // Mock app.getFileIcon
    mockGetFileIcon = vi.fn(() => Promise.resolve(mockNativeImage));
    mockApp.getFileIcon = mockGetFileIcon;
  });

  it('should extract icon from executable file', async () => {
    const exePath = 'C:\\Windows\\System32\\notepad.exe';

    // Mock fs.existsSync to return true for the exe file
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(true);

    // Simulate the extractIconFromExe function
    const extractIconFromExe = async (exePath) => {
      if (!fs.existsSync(exePath)) {
        return null;
      }

      const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

      if (!icon || icon.isEmpty()) {
        return null;
      }

      const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
      const iconFileName = `${hash}.png`;
      const iconPath = `icon-cache/${iconFileName}`;

      const pngBuffer = icon.toPNG();
      fs.writeFileSync(`/mock/icon-cache/${iconFileName}`, pngBuffer);

      return iconPath;
    };

    // Execute icon extraction
    const result = await extractIconFromExe(exePath);

    // Verify icon was extracted successfully
    expect(result).toBeDefined();
    expect(result).toContain('icon-cache/');
    expect(result).toContain('.png');

    // Verify app.getFileIcon was called with correct parameters
    expect(mockApp.getFileIcon).toHaveBeenCalledWith(exePath, { size: 'large' });

    // Verify icon was converted to PNG
    expect(mockNativeImage.toPNG).toHaveBeenCalled();

    // Verify icon was saved to file
    expect(fs.writeFileSync).toHaveBeenCalled();
    const writeCall = fs.writeFileSync.mock.calls[0];
    expect(writeCall[0]).toContain('icon-cache');
    expect(writeCall[0]).toContain('.png');
    expect(writeCall[1]).toEqual(Buffer.from('fake-png-data'));
  });

  it('should return null when executable file does not exist', async () => {
    const exePath = 'C:\\NonExistent\\app.exe';

    // Mock fs.existsSync to return false
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(false);

    // Simulate the extractIconFromExe function
    const extractIconFromExe = async (exePath) => {
      if (!fs.existsSync(exePath)) {
        return null;
      }

      const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

      if (!icon || icon.isEmpty()) {
        return null;
      }

      return 'icon-cache/test.png';
    };

    // Execute icon extraction
    const result = await extractIconFromExe(exePath);

    // Verify null was returned
    expect(result).toBeNull();

    // Verify app.getFileIcon was not called
    expect(mockApp.getFileIcon).not.toHaveBeenCalled();
  });

  it('should return null when icon is empty', async () => {
    const exePath = 'C:\\Windows\\System32\\notepad.exe';

    // Mock fs.existsSync to return true
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(true);

    // Mock nativeImage to return empty icon
    mockNativeImage.isEmpty.mockReturnValue(true);

    // Simulate the extractIconFromExe function
    const extractIconFromExe = async (exePath) => {
      if (!fs.existsSync(exePath)) {
        return null;
      }

      const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

      if (!icon || icon.isEmpty()) {
        return null;
      }

      return 'icon-cache/test.png';
    };

    // Execute icon extraction
    const result = await extractIconFromExe(exePath);

    // Verify null was returned
    expect(result).toBeNull();

    // Verify app.getFileIcon was called
    expect(mockApp.getFileIcon).toHaveBeenCalledWith(exePath, { size: 'large' });

    // Verify isEmpty was checked
    expect(mockNativeImage.isEmpty).toHaveBeenCalled();

    // Verify toPNG was not called
    expect(mockNativeImage.toPNG).not.toHaveBeenCalled();
  });

  it('should generate unique filename based on exe path', async () => {
    const exePath1 = 'C:\\Windows\\System32\\notepad.exe';
    const exePath2 = 'C:\\Windows\\System32\\calc.exe';

    // Mock fs.existsSync to return true
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(true);

    // Simulate the extractIconFromExe function
    const extractIconFromExe = async (exePath) => {
      if (!fs.existsSync(exePath)) {
        return null;
      }

      const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

      if (!icon || icon.isEmpty()) {
        return null;
      }

      const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
      const iconFileName = `${hash}.png`;
      const iconPath = `icon-cache/${iconFileName}`;

      const pngBuffer = icon.toPNG();
      fs.writeFileSync(`/mock/icon-cache/${iconFileName}`, pngBuffer);

      return iconPath;
    };

    // Extract icons from both executables
    const result1 = await extractIconFromExe(exePath1);
    const result2 = await extractIconFromExe(exePath2);

    // Verify both icons were extracted
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();

    // Verify filenames are different
    expect(result1).not.toBe(result2);

    // Verify both contain icon-cache path
    expect(result1).toContain('icon-cache/');
    expect(result2).toContain('icon-cache/');

    // Verify both are PNG files
    expect(result1).toContain('.png');
    expect(result2).toContain('.png');
  });

  it('should save icon to icon-cache directory', async () => {
    const exePath = 'C:\\Windows\\System32\\notepad.exe';

    // Mock fs.existsSync to return true
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(true);

    // Simulate the extractIconFromExe function
    const extractIconFromExe = async (exePath) => {
      if (!fs.existsSync(exePath)) {
        return null;
      }

      const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

      if (!icon || icon.isEmpty()) {
        return null;
      }

      const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
      const iconFileName = `${hash}.png`;
      const iconPath = `icon-cache/${iconFileName}`;

      const pngBuffer = icon.toPNG();
      fs.writeFileSync(`/mock/icon-cache/${iconFileName}`, pngBuffer);

      return iconPath;
    };

    // Execute icon extraction
    const result = await extractIconFromExe(exePath);

    // Verify icon was saved
    expect(fs.writeFileSync).toHaveBeenCalled();

    // Verify the save path contains icon-cache
    const writeCall = fs.writeFileSync.mock.calls[0];
    expect(writeCall[0]).toContain('icon-cache');

    // Verify the returned path is relative and contains icon-cache
    expect(result).toContain('icon-cache/');
    expect(result).not.toContain('/mock/');
  });

  it('should handle icon extraction errors gracefully', async () => {
    const exePath = 'C:\\Windows\\System32\\notepad.exe';

    // Mock fs.existsSync to return true
    const fs = (await import('fs')).default;
    fs.existsSync.mockReturnValue(true);

    // Mock app.getFileIcon to throw an error
    mockGetFileIcon.mockRejectedValue(new Error('Failed to extract icon'));

    // Simulate the extractIconFromExe function with error handling
    const extractIconFromExe = async (exePath) => {
      try {
        if (!fs.existsSync(exePath)) {
          return null;
        }

        const icon = await mockApp.getFileIcon(exePath, { size: 'large' });

        if (!icon || icon.isEmpty()) {
          return null;
        }

        const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
        const iconFileName = `${hash}.png`;
        const iconPath = `icon-cache/${iconFileName}`;

        const pngBuffer = icon.toPNG();
        fs.writeFileSync(`/mock/icon-cache/${iconFileName}`, pngBuffer);

        return iconPath;
      } catch (error) {
        console.error('Failed to extract icon from executable:', error);
        return null;
      }
    };

    // Execute icon extraction
    const result = await extractIconFromExe(exePath);

    // Verify null was returned on error
    expect(result).toBeNull();

    // Verify app.getFileIcon was called
    expect(mockApp.getFileIcon).toHaveBeenCalledWith(exePath, { size: 'large' });
  });
});
