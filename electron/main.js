import { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yaml from 'yaml';
import { StartupTimer, LazyModuleLoader, ConfigCache, DeferredInitializer } from './startupOptimization.js';
import { MemoryOptimizer } from './memoryOptimization.js';
import logger from './logger.js';
import autoUpdateManager from './autoUpdater.js';

// Initialize startup timer
const startupTimer = new StartupTimer();

// Initialize lazy module loader
const lazyLoader = new LazyModuleLoader();

// Initialize config cache
const configCache = new ConfigCache();

// Initialize deferred initializer
const deferredInit = new DeferredInitializer();

// Initialize memory optimizer (will be configured after config is loaded)
let memoryOptimizer = null;

// Register lazy-loaded modules
lazyLoader.register('ActionExecutor', async () => {
  const { ActionExecutor } = await import('./actions/ActionExecutor.js');
  return ActionExecutor;
});

lazyLoader.register('ProfileStateManager', async () => {
  const { ProfileStateManager } = await import('./ProfileStateManager.js');
  return ProfileStateManager;
});

lazyLoader.register('IpcHandlers', async () => {
  const { registerAllHandlers } = await import('./ipc/index.js');
  return registerAllHandlers;
});

// Simple logger (only logs in development)
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const noDevTools = process.env.NO_DEVTOOLS === 'true' || isProduction;
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
let tray = null;

// Lazy-initialized modules
let actionExecutor = null;
let profileStateManager = null;

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
    
    // Record icon access for memory optimization
    if (memoryOptimizer) {
      memoryOptimizer.recordIconAccess(iconFileName);
    }
    
    // Return the relative path from userData
    return `icon-cache/${iconFileName}`;
  } catch (iconErr) {
    error('Failed to extract icon from executable:', iconErr);
    return null;
  }
}

// Load configuration with caching
function loadConfig(mode = 'normal') {
  startupTimer.mark('config-load-start');
  
  try {
    // Check cache first
    const cachedConfig = configCache.get();
    if (cachedConfig && mode === 'normal') {
      config = cachedConfig;
      log('Configuration loaded from cache');
      startupTimer.mark('config-load-end');
      startupTimer.measure('config-load', 'config-load-start', 'config-load-end');
      return;
    }

    // If init mode, always create default config without loading existing file
    if (mode === 'init') {
      config = createDefaultConfig();
      configCache.set(config);
      startupTimer.mark('config-load-end');
      startupTimer.measure('config-load', 'config-load-start', 'config-load-end');
      return;
    }

    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8');
      config = yaml.parse(fileContents);
      configCache.set(config);
      log('Configuration loaded');
    } else {
      // Create default config
      config = createDefaultConfig();
      configCache.set(config);
      saveConfig();
    }
  } catch (err) {
    error('Failed to load config:', err);
    config = createDefaultConfig();
    configCache.set(config);
  }
  
  startupTimer.mark('config-load-end');
  startupTimer.measure('config-load', 'config-load-start', 'config-load-end');
}

// Save configuration
function saveConfig() {
  try {
    const yamlStr = yaml.stringify(config);
    fs.writeFileSync(configPath, yamlStr, 'utf8');
    configCache.set(config); // Update cache
    log('Configuration saved');
    logger.logConfigSave(true);
  } catch (err) {
    error('Failed to save config:', err);
    logger.logConfigSave(false, { error: err.message });
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
        },
        auto_close_on_open: true
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

// Create main window (settings window) - deferred
function createMainWindow() {
  startupTimer.mark('main-window-start');
  
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
  
  startupTimer.mark('main-window-end');
  startupTimer.measure('main-window-create', 'main-window-start', 'main-window-end');
}

// Create overlay window - optimized for fast display
function createOverlayWindow() {
  startupTimer.mark('overlay-window-start');
  
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
    
    startupTimer.mark('overlay-window-end');
    startupTimer.measure('overlay-window-create', 'overlay-window-start', 'overlay-window-end');
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

// Show overlay with smooth dropdown animation
function showOverlay() {
  log('showOverlay called');
  if (!overlayWindow) {
    log('Creating overlay window...');
    createOverlayWindow();
  }
  
  if (overlayWindow) {
    log('Showing overlay window with dropdown animation...');
    
    const performDropdownAnimation = () => {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width } = primaryDisplay.workAreaSize;
      const windowWidth = config.ui.window.width_px;
      const windowHeight = config.ui.window.height_px;
      const finalX = Math.floor((width - windowWidth) / 2);
      const finalY = 50;
      
      // Get animation settings from config
      const animationEnabled = config.ui.window.animation?.enabled !== false;
      const animationDuration = config.ui.window.animation?.duration_ms || 150;
      
      if (!animationEnabled) {
        // No animation - just show at final position
        overlayWindow.setPosition(finalX, finalY);
        overlayWindow.setOpacity(1);
        overlayWindow.show();
        overlayWindow.setAlwaysOnTop(true, 'screen-saver');
        overlayWindow.focus();
        return;
      }
      
      // Start position: above the screen (hidden)
      const startY = -windowHeight - 20;
      
      // Set initial position and opacity
      overlayWindow.setPosition(finalX, startY);
      overlayWindow.setOpacity(1);
      overlayWindow.show();
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      overlayWindow.focus();
      
      // Animate dropdown using easing function
      const startTime = Date.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = easeOutCubic(progress);
        
        // Calculate current Y position
        const currentY = Math.round(startY + (finalY - startY) * easedProgress);
        
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.setPosition(finalX, currentY);
          
          if (progress < 1) {
            // Continue animation
            setTimeout(animate, 16); // ~60fps
          } else {
            log('Dropdown animation complete');
          }
        }
      };
      
      // Start animation
      animate();
    };
    
    // Ensure window is ready before animating
    if (overlayWindow.webContents.isLoading()) {
      log('Window still loading, waiting for ready-to-show...');
      overlayWindow.once('ready-to-show', performDropdownAnimation);
    } else {
      performDropdownAnimation();
    }
    
    log('Overlay window animation started');
  } else {
    error('Failed to create overlay window');
  }
}

// Hide overlay with smooth slide-up animation
function hideOverlay() {
  if (overlayWindow && overlayWindow.isVisible()) {
    log('Hiding overlay with slide-up animation...');
    
    // Get animation settings from config
    const animationEnabled = config.ui.window.animation?.enabled !== false;
    const animationDuration = config.ui.window.animation?.duration_ms || 150;
    
    if (!animationEnabled) {
      // No animation - just hide immediately
      overlayWindow.hide();
      return;
    }
    
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;
    const windowWidth = config.ui.window.width_px;
    const windowHeight = config.ui.window.height_px;
    const finalX = Math.floor((width - windowWidth) / 2);
    
    // Get current position
    const [currentX, currentY] = overlayWindow.getPosition();
    
    // End position: above the screen (hidden)
    const endY = -windowHeight - 20;
    
    // Animate slide-up using easing function
    const startTime = Date.now();
    const easeInCubic = (t) => t * t * t;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeInCubic(progress);
      
      // Calculate current Y position
      const newY = Math.round(currentY + (endY - currentY) * easedProgress);
      
      if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible()) {
        overlayWindow.setPosition(finalX, newY);
        
        if (progress < 1) {
          // Continue animation
          setTimeout(animate, 16); // ~60fps
        } else {
          // Animation complete - hide window
          if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
            log('Slide-up animation complete');
          }
        }
      }
    };
    
    // Start animation
    animate();
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

// Update tray tooltip with current profile name
function updateTrayTooltip() {
  if (!tray) {
    return;
  }
  
  try {
    let tooltipText = 'Q-Deck Launcher';
    
    // Add current profile name if available
    if (config && profileStateManager) {
      const currentProfile = profileStateManager.getCurrentProfile(config);
      if (currentProfile && currentProfile.name) {
        tooltipText += ` - ${currentProfile.name}`;
      }
    }
    
    tray.setToolTip(tooltipText);
    log('Tray tooltip updated:', tooltipText);
  } catch (err) {
    error('Failed to update tray tooltip:', err);
  }
}

// Create system tray icon
function createTray() {
  try {
    // Use the existing 32x32 icon from src-tauri/icons
    const iconPath = path.join(__dirname, '../src-tauri/icons/32x32.png');
    
    // Check if icon exists
    if (!fs.existsSync(iconPath)) {
      error('Tray icon not found at:', iconPath);
      return;
    }
    
    // Create native image from icon
    const icon = nativeImage.createFromPath(iconPath);
    
    // Create tray
    tray = new Tray(icon);
    
    // Set initial tooltip (will be updated with profile name later)
    updateTrayTooltip();
    
    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Overlay',
        click: () => {
          log('Tray menu: Toggle overlay');
          toggleOverlay();
        }
      },
      {
        label: 'Settings',
        click: () => {
          log('Tray menu: Open settings');
          if (!mainWindow) {
            createMainWindow();
          }
          mainWindow.show();
          mainWindow.focus();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          log('Tray menu: Quit application');
          app.quit();
        }
      }
    ]);
    
    // Set context menu (right-click)
    tray.setContextMenu(contextMenu);
    
    // Handle left-click to toggle overlay
    tray.on('click', () => {
      log('Tray icon clicked: Toggle overlay');
      toggleOverlay();
    });
    
    log('System tray icon created successfully');
    logger.info('System tray icon created');
  } catch (err) {
    error('Failed to create system tray icon:', err);
    logger.error('Failed to create system tray icon', { error: err.message });
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
        logger.logHotkeyRegistration(hotkey, true);
      } else {
        console.error(`Failed to register hotkey ${hotkey}`);
        logger.logHotkeyRegistration(hotkey, false);
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
            logger.logProfileSwitch(profile.name, index);
            
            // Update tray tooltip with new profile name
            updateTrayTooltip();
            
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
            logger.error('Failed to switch profile', { profile_name: profile.name, profile_index: index });
          }
        });

        if (success) {
          console.log(`Profile hotkey ${profile.hotkey} registered for profile: ${profile.name}`);
          logger.logHotkeyRegistration(profile.hotkey, true, { profile_name: profile.name });
        } else {
          console.error(`Failed to register profile hotkey ${profile.hotkey} for profile: ${profile.name}`);
          logger.logHotkeyRegistration(profile.hotkey, false, { profile_name: profile.name });
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

// App ready - optimized startup sequence
app.whenReady().then(async () => {
  startupTimer.mark('app-ready');
  log('App is ready');
  
  // Initialize logger for production
  logger.initialize();
  
  // Critical path: Load configuration (fast with caching)
  startupTimer.mark('critical-start');
  loadConfig();
  startupTimer.mark('critical-config-done');
  
  // Critical path: Load lazy modules (needed for IPC handlers)
  startupTimer.mark('lazy-modules-start');
  const ActionExecutorClass = await lazyLoader.load('ActionExecutor');
  actionExecutor = new ActionExecutorClass();
  
  const ProfileStateManagerClass = await lazyLoader.load('ProfileStateManager');
  profileStateManager = new ProfileStateManagerClass();
  startupTimer.mark('lazy-modules-end');
  startupTimer.measure('lazy-modules-load', 'lazy-modules-start', 'lazy-modules-end');
  
  // Critical path: Register IPC handlers (must be ready before overlay window loads)
  startupTimer.mark('ipc-handlers-start');
  const registerAllHandlers = await lazyLoader.load('IpcHandlers');
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
    profileStateManager,
    app,
    autoUpdateManager: isProduction ? autoUpdateManager : null
  });
  log('IPC handlers registered');
  startupTimer.mark('ipc-handlers-end');
  startupTimer.measure('ipc-handlers-register', 'ipc-handlers-start', 'ipc-handlers-end');
  
  // Update tray tooltip with current profile name
  updateTrayTooltip();
  
  // Critical path: Create overlay window (needed for hotkey)
  createOverlayWindow();
  startupTimer.mark('critical-overlay-done');
  
  // Critical path: Register hotkeys (must be ready immediately)
  registerHotkeys();
  startupTimer.mark('critical-hotkeys-done');
  startupTimer.measure('critical-path', 'critical-start', 'critical-hotkeys-done');
  
  // Create system tray icon
  createTray();
  
  // Defer non-critical initialization
  deferredInit.defer('main-window', () => {
    createMainWindow();
    if (process.env.NODE_ENV === 'development') {
      // mainWindow.show();
    }
  }, 100); // Delay 100ms
  
  // Execute all deferred tasks
  await deferredInit.executeAll();
  
  // Initialize memory optimizer after config is loaded
  deferredInit.defer('memory-optimizer', () => {
    memoryOptimizer = new MemoryOptimizer(iconCachePath);
    memoryOptimizer.start();
    log('Memory optimizer initialized');
  }, 500); // Delay 500ms to not impact startup
  
  // Initialize auto-updater (only in production)
  if (isProduction) {
    deferredInit.defer('auto-updater', () => {
      autoUpdateManager.startAutoUpdateChecks();
      log('Auto-updater initialized');
    }, 10000); // Delay 10s to not impact startup
  }
  
  startupTimer.mark('app-ready-complete');
  startupTimer.measure('total-startup', 'app-start', 'app-ready-complete');
  
  // Report startup performance
  const report = startupTimer.report();
  
  // Log startup performance
  logger.logStartup(report.totalTime, {
    critical_path_ms: report.measures['critical-path'] || 0,
    config_load_ms: report.measures['config-load'] || 0
  });
  
  // Warn if startup is too slow
  if (report.totalTime > 1000) {
    warn(`⚠️ Startup time (${report.totalTime}ms) exceeds target of 1000ms`);
    logger.warn('Startup time exceeds target', { startup_time_ms: report.totalTime, target_ms: 1000 });
  } else {
    log(`✅ Startup time: ${report.totalTime}ms (target: <1000ms)`);
  }
});

// Don't quit when all windows are closed - keep running in system tray
// The app will only quit when user selects "Quit" from tray menu
app.on('window-all-closed', () => {
  // On macOS, keep the app running in the dock
  // On Windows/Linux, keep the app running in the system tray
  // Do nothing - app continues running
  log('All windows closed, but app continues running in system tray');
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Unregister all shortcuts before quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  
  // Stop memory optimizer
  if (memoryOptimizer) {
    memoryOptimizer.stop();
  }
  
  // Shutdown logger (flush remaining logs)
  logger.shutdown();
});

// IPC Handlers are now registered lazily in app.whenReady()

// Memory statistics IPC handler
ipcMain.handle('get-memory-stats', async () => {
  if (!memoryOptimizer) {
    return null;
  }
  
  return memoryOptimizer.getStats();
});

// Manual memory optimization IPC handler
ipcMain.handle('optimize-memory', async () => {
  if (!memoryOptimizer) {
    return null;
  }
  
  return memoryOptimizer.optimize();
});

// Global error handlers for production logging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logger.logUnhandledError(error, { type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.logUnhandledError(
    reason instanceof Error ? reason : new Error(String(reason)),
    { type: 'unhandledRejection' }
  );
});

log('Electron main process started');

