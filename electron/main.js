import { app, BrowserWindow, globalShortcut, ipcMain, screen, shell, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yaml from 'yaml';
import { spawn } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window objects
let mainWindow = null;
let overlayWindow = null;
let config = null;

// Config file path
const configPath = path.join(app.getPath('userData'), 'config.yaml');

// Icon cache directory
const iconCachePath = path.join(app.getPath('userData'), 'icon-cache');

// Ensure icon cache directory exists
if (!fs.existsSync(iconCachePath)) {
  fs.mkdirSync(iconCachePath, { recursive: true });
}

// Extract icon from executable file
async function extractIconFromExe(exePath) {
  try {
    console.log('Extracting icon from:', exePath);
    
    // Check if file exists
    if (!fs.existsSync(exePath)) {
      console.warn('Executable file not found:', exePath);
      return null;
    }

    // Use Electron's nativeImage to extract icon
    const icon = await app.getFileIcon(exePath, { size: 'large' });
    
    if (!icon || icon.isEmpty()) {
      console.warn('No icon found in executable:', exePath);
      return null;
    }

    // Generate a unique filename based on the exe path
    const hash = Buffer.from(exePath).toString('base64').replace(/[/+=]/g, '_');
    const iconFileName = `${hash}.png`;
    const iconPath = path.join(iconCachePath, iconFileName);

    // Save icon as PNG
    const pngBuffer = icon.toPNG();
    fs.writeFileSync(iconPath, pngBuffer);
    
    console.log('Icon extracted and saved to:', iconPath);
    
    // Return the relative path from userData
    return `icon-cache/${iconFileName}`;
  } catch (error) {
    console.error('Failed to extract icon from executable:', error);
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
      console.log('Configuration loaded:', config);
    } else {
      // Create default config
      config = createDefaultConfig();
      saveConfig();
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    config = createDefaultConfig();
  }
}

// Save configuration
function saveConfig() {
  try {
    const yamlStr = yaml.stringify(config);
    fs.writeFileSync(configPath, yamlStr, 'utf8');
    console.log('Configuration saved');
  } catch (error) {
    console.error('Failed to save config:', error);
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
    mainWindow.loadURL('http://localhost:1420');
    mainWindow.webContents.openDevTools();
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
  const { width, height } = primaryDisplay.workAreaSize;

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });
  
  console.log('Overlay window created with dimensions:', config.ui.window.width_px, 'x', config.ui.window.height_px);
  console.log('Overlay window position:', Math.floor((width - config.ui.window.width_px) / 2), ',', 50);

  // Enable drag and drop
  overlayWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // Load the overlay page
  console.log('Loading overlay URL...');
  if (process.env.NODE_ENV === 'development') {
    const overlayURL = 'http://localhost:1420/overlay';
    console.log('Overlay URL:', overlayURL);
    overlayWindow.loadURL(overlayURL);
    overlayWindow.webContents.openDevTools();
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/overlay'
    });
  }

  overlayWindow.webContents.on('did-finish-load', () => {
    console.log('Overlay page loaded successfully');
  });

  overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Overlay page failed to load:', errorCode, errorDescription);
  });

  overlayWindow.on('closed', () => {
    console.log('Overlay window closed');
    overlayWindow = null;
  });

  overlayWindow.on('blur', () => {
    // Hide overlay when it loses focus
    if (overlayWindow && overlayWindow.isVisible()) {
      overlayWindow.hide();
    }
  });
}

// Show overlay
function showOverlay() {
  console.log('showOverlay called');
  if (!overlayWindow) {
    console.log('Creating overlay window...');
    createOverlayWindow();
  }
  
  if (overlayWindow) {
    console.log('Showing overlay window...');
    overlayWindow.show();
    overlayWindow.focus();
    console.log('Overlay window shown and focused');
  } else {
    console.error('Failed to create overlay window');
  }
}

// Hide overlay
function hideOverlay() {
  if (overlayWindow && overlayWindow.isVisible()) {
    overlayWindow.hide();
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

  // Note: Escape key is handled in the overlay window itself, not as a global shortcut
  // This allows modals to handle Escape key first
}

// App ready
app.whenReady().then(() => {
  console.log('App is ready');
  
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

// IPC Handlers
ipcMain.handle('get-config', async () => {
  return config;
});

ipcMain.handle('save-config', async (event, newConfig) => {
  config = newConfig;
  saveConfig();
  
  // Re-register hotkeys with new config
  registerHotkeys();
  
  return { success: true };
});

ipcMain.handle('show-overlay', async () => {
  showOverlay();
  return { success: true };
});

ipcMain.handle('hide-overlay', async () => {
  hideOverlay();
  return { success: true };
});

ipcMain.handle('toggle-overlay', async () => {
  toggleOverlay();
  return { success: true };
});

ipcMain.handle('execute-action', async (event, actionConfig) => {
  console.log('Executing action:', actionConfig);
  
  try {
    if (actionConfig.type === 'LaunchApp') {
      const { path: appPath, args, workdir, env } = actionConfig;
      
      const options = {
        detached: true,
        stdio: 'ignore'
      };
      
      if (workdir) {
        options.cwd = workdir;
      }
      
      if (env) {
        options.env = { ...process.env, ...env };
      }
      
      const child = spawn(appPath, args || [], options);
      child.unref();
      
      return {
        success: true,
        message: `Launched ${appPath}`
      };
    } else if (actionConfig.type === 'Open') {
      await shell.openPath(actionConfig.target);
      
      return {
        success: true,
        message: `Opened ${actionConfig.target}`
      };
    } else if (actionConfig.type === 'Terminal') {
      // TODO: Implement terminal actions
      return {
        success: false,
        message: 'Terminal actions not yet implemented'
      };
    }
    
    return {
      success: false,
      message: 'Unknown action type'
    };
  } catch (error) {
    console.error('Action execution failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

// Profile management
ipcMain.handle('get-current-profile', async () => {
  if (config && config.profiles && config.profiles.length > 0) {
    return {
      index: 0,
      name: config.profiles[0].name
    };
  }
  return null;
});

ipcMain.handle('get-current-page', async () => {
  if (config && config.profiles && config.profiles.length > 0) {
    const profile = config.profiles[0];
    if (profile.pages && profile.pages.length > 0) {
      return {
        index: 0,
        name: profile.pages[0].name
      };
    }
  }
  return null;
});

ipcMain.handle('get-navigation-context', async () => {
  if (config && config.profiles && config.profiles.length > 0) {
    const profile = config.profiles[0];
    return {
      profile_index: 0,
      page_index: 0,
      total_pages: profile.pages ? profile.pages.length : 0,
      has_previous_page: false,
      has_next_page: profile.pages && profile.pages.length > 1
    };
  }
  return null;
});

// Icon extraction
ipcMain.handle('extract-icon', async (event, exePath) => {
  console.log('IPC: extract-icon called for:', exePath);
  
  try {
    const iconPath = await extractIconFromExe(exePath);
    
    if (iconPath) {
      return {
        success: true,
        iconPath: iconPath
      };
    } else {
      return {
        success: false,
        message: 'Failed to extract icon'
      };
    }
  } catch (error) {
    console.error('IPC: extract-icon failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

// Get icon cache path
ipcMain.handle('get-icon-path', async (event, relativePath) => {
  const fullPath = path.join(app.getPath('userData'), relativePath);
  return fullPath;
});

console.log('Electron main process started');
