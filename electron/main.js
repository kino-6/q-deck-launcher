import { app, BrowserWindow, globalShortcut, ipcMain, screen, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yaml from 'yaml';
import { ActionExecutor } from './actions/ActionExecutor.js';
import { registerAllHandlers } from './ipc/index.js';
import { ProfileStateManager } from './ProfileStateManager.js';

// Simple logger (only logs in development)
const isDev = process.env.NODE_ENV === 'development';
const noDevTools = process.env.NO_DEVTOOLS === 'true';
const log = (...args) => isDev && console.log(...args);
const warn = (...args) => console.warn(...args);
const error = (...args) => console.error(...args);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log('__dirname:', __dirname);
log('Preload script path:', path.join(__dirname, 'preload.cjs'));

// Keep a global reference of the window objects
let mainWindow = null;
let overlayWindow = null;
let config = null;

// Initialize action executor
const actionExecutor = new ActionExecutor();

// Initialize profile state manager
const profileStateManager = new ProfileStateManager();

// Determine config path (portable mode support)
// Portable mode: config.yaml in application directory
// Normal mode: config.yaml in userData directory
function getConfigPath() {
  const appDir = path.dirname(app.getPath('exe'));
  const portableConfigPath = path.join(appDir, 'config.yaml');
  
  // Check if portable config exists
  if (fs.existsSync(portableConfigPath)) {
    log('Portable mode detected: using config from application directory');
    return portableConfigPath;
  }
  
  // Use normal mode (AppData)
  return path.join(app.getPath('userData'), 'config.yaml');
}

// Config file path
const configPath = getConfigPath();

// Icon cache directory (always relative to config location)
const configDir = path.dirname(configPath);
const iconCachePath = path.join(configDir, 'icon-cache');

// Ensure icon cache directory exists
if (!fs.existsSync(iconCachePath)) {
  fs.mkdirSync(iconCachePath, { recursive: true });
}

// Extract icon from executable file
async function extractIconFromExe(exePath) {
  try {
    log('Extracting icon from:', exePath);
    
    // Check if file exists
    if (!fs.existsSync(exePath)) {
      warn('Executable file not found:', exePath);
      return null;
    }

    // Use Electron's nativeImage to extract icon
    const icon = await app.getFileIcon(exePath, { size: 'large' });
    
    if (!icon || icon.isEmpty()) {
      warn('No icon found in executable:', exePath);
      return null;
    }

    // Generate a unique filename based on the exe path
    const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
    const iconFileName = `${hash}.png`;
    const iconPath = path.join(iconCachePath, iconFileName);

    // Save icon as PNG
    const pngBuffer = icon.toPNG();
    fs.writeFileSync(iconPath, pngBuffer);
    
    log('Icon extracted and saved to:', iconPath);
    
    // Return the relative path from userData
    return `icon-cache/${iconFileName}`;
  } catch (iconErr) {
    error('Failed to extract icon from executable:', iconErr);
    return null;
  }
}

// Load configuration
function loadConfig(mode = 'normal') {
  try {
    // If init mode, always create default config without loading existing file
    if (mode === 'init') {
      config = createDefaultConfig();
      return;
    }

    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.parse(fileContents);
      log('Configuration loaded');
    } else {
      // Create default config
      config = createDefaultConfig();
      saveConfig();
    }
  } catch (err) {
    error('Failed to load config:', err);
    config = createDefaultConfig();
  }
}

// Save configuration
function saveConfig() {
  try {
    const yamlStr = yaml.stringify(config);
    fs.writeFileSync(configPath, yamlStr, 'utf8');
    log('Configuration saved');
  } catch (err) {
    error('Failed to save config:', err);
  }
}

// Create default configuration
function createDefaultConfig() {
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
            buttons: [
              {
                position: { row: 1, col: 1 },
                action_type: 'LaunchApp',
                label: 'Notepad',
                icon: '📝',
                config: {
                  path: 'notepad.exe'
                },
                action: {
                  action_type: 'app'
                }
              },
              {
                position: { row: 1, col: 2 },
                action_type: 'Open',
                label: 'Documents',
                icon: '📁',
                config: {
                  target: process.env.USERPROFILE + '\\Documents'
                },
                action: {
                  action_type: 'app'
                }
              },
              {
                position: { row: 1, col: 3 },
                action_type: 'LaunchApp',
                label: 'Calculator',
                icon: '🔢',
                config: {
                  path: 'calc.exe'
                },
                action: {
                  action_type: 'app'
                }
              },
              {
                position: { row: 2, col: 1 },
                action_type: 'system',
                label: 'Settings',
                icon: '⚙️',
                config: {},
                action: {
                  action_type: 'system',
                  system_action: 'config'
                }
              }
            ]
          }
        ]
      }
    ]
  };
}

// Create main window (settings window)
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.VITE_PORT || process.env.PORT || 1420;
    const mainURL = `http://localhost:${port}`;
    log('Main window URL:', mainURL);
    mainWindow.loadURL(mainURL);
    if (!noDevTools) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create overlay window
function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: config.ui.window.width_px,
    height: config.ui.window.height_px,
    x: Math.floor((width - config.ui.window.width_px) / 2),
    y: 50,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000', // Fully transparent background
    hasShadow: false, // Disable shadow for better performance
    paintWhenInitiallyHidden: false, // Don't paint when hidden
    roundedCorners: false, // Disable rounded corners on Windows 11
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
      enableRemoteModule: false,
      offscreen: false, // Ensure on-screen rendering
      backgroundThrottling: false, // Prevent throttling when hidden
      disableHardwareAcceleration: false // Keep hardware acceleration enabled
    }
  });
  
  log('Overlay window created with dimensions:', config.ui.window.width_px, 'x', config.ui.window.height_px);
  log('Overlay window position:', Math.floor((width - config.ui.window.width_px) / 2), ',', 50);

  // Load the overlay page
  log('Loading overlay URL...');
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.VITE_PORT || process.env.PORT || 1420;
    const overlayURL = `http://localhost:${port}/overlay`;
    log('Overlay URL:', overlayURL);
    overlayWindow.loadURL(overlayURL);
    if (!noDevTools) {
      overlayWindow.webContents.openDevTools();
    }
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/overlay'
    });
  }

  // Use ready-to-show event to prevent flicker
  overlayWindow.once('ready-to-show', () => {
    log('Overlay window ready to show');
    // Window is now ready but we don't show it automatically
    // It will be shown when showOverlay() is called
  });

  overlayWindow.webContents.on('did-finish-load', () => {
    log('Overlay page loaded successfully');
    
    // Note: File drop handling is done at the app level via 'web-contents-created'
    // The renderer will receive file paths via IPC ('file-drop-paths' channel)
    // No need to inject code here - the React app already listens for IPC messages
    
    console.log('✁EOverlay ready - file drop handling is active via IPC');
  });

  overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    error('Overlay page failed to load:', errorCode, errorDescription);
  });

  // Forward console messages from renderer to main process (Terminal)
  // Note: This helps debug drag and drop issues by showing renderer logs in terminal
  overlayWindow.webContents.on('console-message', (_event, level, message) => {
    const levelMap = {
      0: 'LOG',
      1: 'WARN',
      2: 'ERROR',
      3: 'DEBUG'
    };
    const levelName = levelMap[level] || 'LOG';
    
    // Filter out some noisy messages
    if (message.includes('DevTools') || 
        message.includes('Security Warning') || 
        message.includes('Autofill')) {
      return;
    }
    
    console.log(`[RENDERER ${levelName}] ${message}`);
  });

  overlayWindow.on('closed', () => {
    log('Overlay window closed');
    overlayWindow = null;
  });

  // Note: Removed blur event auto-close behavior
  // Overlay now stays visible until explicitly closed with F11 hotkey
  // This allows drag and drop from external applications without the overlay closing
}

// Show overlay
function showOverlay() {
  log('showOverlay called');
  if (!overlayWindow) {
    log('Creating overlay window...');
    createOverlayWindow();
  }
  
  if (overlayWindow) {
    log('Showing overlay window...');
    // Optimize show sequence to prevent flicker
    // 1. Ensure window is ready before showing
    if (overlayWindow.webContents.isLoading()) {
      log('Window still loading, waiting for ready-to-show...');
      overlayWindow.once('ready-to-show', () => {
        // Use setOpacity to fade in (reduces flicker on Windows)
        overlayWindow.setOpacity(0);
        overlayWindow.show();
        overlayWindow.setAlwaysOnTop(true, 'screen-saver');
        overlayWindow.focus();
        // Quick fade in
        setTimeout(() => {
          if (overlayWindow) overlayWindow.setOpacity(1);
        }, 16); // One frame at 60fps
      });
    } else {
      // Window is already loaded, show with quick fade
      overlayWindow.setOpacity(0);
      overlayWindow.show();
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      overlayWindow.focus();
      // Quick fade in
      setTimeout(() => {
        if (overlayWindow) overlayWindow.setOpacity(1);
      }, 16); // One frame at 60fps
    }
    log('Overlay window shown and focused');
  } else {
    error('Failed to create overlay window');
  }
}

// Hide overlay
function hideOverlay() {
  if (overlayWindow && overlayWindow.isVisible()) {
    // Quick fade out before hiding (reduces flicker)
    overlayWindow.setOpacity(0);
    setTimeout(() => {
      if (overlayWindow && overlayWindow.isVisible()) {
        overlayWindow.hide();
        // Reset opacity for next show
        overlayWindow.setOpacity(1);
      }
    }, 16); // One frame at 60fps
  }
}

// Toggle overlay
function toggleOverlay() {
  if (overlayWindow && overlayWindow.isVisible()) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// Register global shortcuts
function registerHotkeys() {
  // Unregister all shortcuts first
  globalShortcut.unregisterAll();

  // Register summon hotkeys
  if (config && config.ui && config.ui.summon && config.ui.summon.hotkeys) {
    config.ui.summon.hotkeys.forEach(hotkey => {
      const success = globalShortcut.register(hotkey, () => {
        console.log(`Hotkey ${hotkey} pressed`);
        toggleOverlay();
      });

      if (success) {
        console.log(`Hotkey ${hotkey} registered successfully`);
      } else {
        console.error(`Failed to register hotkey ${hotkey}`);
      }
    });
  }

  // Register profile-specific hotkeys
  if (config && config.profiles) {
    config.profiles.forEach((profile, index) => {
      if (profile.hotkey) {
        const success = globalShortcut.register(profile.hotkey, () => {
          console.log(`Profile hotkey ${profile.hotkey} pressed for profile: ${profile.name}`);
          
          // Switch to the profile
          const result = profileStateManager.switchToProfile(index, config);
          
          if (result) {
            console.log(`Switched to profile: ${profile.name} (index: ${index})`);
            
            // Show overlay if it's not visible
            if (!overlayWindow || !overlayWindow.isVisible()) {
              showOverlay();
            }
            
            // Notify the overlay window about the profile change
            if (overlayWindow && overlayWindow.webContents) {
              overlayWindow.webContents.send('profile-changed', result);
            }
          } else {
            console.error(`Failed to switch to profile: ${profile.name}`);
          }
        });

        if (success) {
          console.log(`Profile hotkey ${profile.hotkey} registered for profile: ${profile.name}`);
        } else {
          console.error(`Failed to register profile hotkey ${profile.hotkey} for profile: ${profile.name}`);
        }
      }
    });
  }

  // Note: Escape key is handled in the overlay window itself, not as a global shortcut
  // This allows modals to handle Escape key first
}

// Enable file path access for drag and drop
// This intercepts file drops at the webContents level and sends full paths via IPC
app.on('web-contents-created', (_event, contents) => {
  console.log('🔧 Setting up file drop interception for webContents');
  
  // Prevent default file navigation
  contents.on('will-navigate', (navEvent, navigationUrl) => {
    console.log('🔍 will-navigate event:', navigationUrl);
    
    // Check if this is a file drop (file:// URL)
    if (navigationUrl.startsWith('file://')) {
      navEvent.preventDefault();
      const filePath = decodeURIComponent(navigationUrl.replace(/^file:\/\/\//, ''));
      console.log('📁 File dropped (intercepted via will-navigate):', filePath);
      
      // Send file path to renderer via IPC
      contents.send('file-drop-paths', [filePath]);
    }
  });
  
  // Intercept window.open calls (alternative file drop method)
  contents.setWindowOpenHandler(({ url }) => {
    console.log('🔍 setWindowOpenHandler:', url);
    
    if (url.startsWith('file://')) {
      const filePath = decodeURIComponent(url.replace(/^file:\/\/\//, ''));
      console.log('📁 File dropped (intercepted via setWindowOpenHandler):', filePath);
      
      // Send file path to renderer via IPC
      contents.send('file-drop-paths', [filePath]);
      
      return { action: 'deny' };
    }
    
    return { action: 'allow' };
  });
});

// App ready
app.whenReady().then(() => {
  log('App is ready');
  
  // Load configuration
  loadConfig();
  
  // Create windows
  createMainWindow();
  createOverlayWindow();
  
  // Register hotkeys
  registerHotkeys();
  
  // Show main window in development
  if (process.env.NODE_ENV === 'development') {
    // mainWindow.show();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Unregister all shortcuts before quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC Handlers - Register all handlers using modular approach
registerAllHandlers(ipcMain, {
  actionExecutor,
  configManager: {
    getConfig: () => config,
    saveConfig: (newConfig) => {
      config = newConfig;
      saveConfig();
    },
    registerHotkeys
  },
  overlayManager: {
    showOverlay,
    hideOverlay,
    toggleOverlay
  },
  utilityManager: {
    extractIcon: extractIconFromExe,
    getIconPath: (relativePath) => path.join(app.getPath('userData'), relativePath)
  },
  profileStateManager
});

log('Electron main process started');

