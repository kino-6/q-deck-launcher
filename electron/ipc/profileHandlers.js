/**
 * Profile and Page IPC Handlers
 * 
 * Handles IPC communication for profile and page management.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);

/**
 * Create get-current-profile handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @returns {Function} IPC handler function
 */
export function createGetCurrentProfileHandler(getConfig) {
  return async () => {
    const config = getConfig();
    if (config && config.profiles && config.profiles.length > 0) {
      return {
        index: 0,
        name: config.profiles[0].name
      };
    }
    return null;
  };
}

/**
 * Create get-current-page handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @returns {Function} IPC handler function
 */
export function createGetCurrentPageHandler(getConfig) {
  return async () => {
    const config = getConfig();
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
  };
}

/**
 * Create get-navigation-context handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @returns {Function} IPC handler function
 */
export function createGetNavigationContextHandler(getConfig) {
  return async () => {
    const config = getConfig();
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
  };
}

/**
 * Register all profile-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Function} getConfig - Function to get current config
 */
export function registerProfileHandlers(ipcMain, getConfig) {
  ipcMain.handle('get-current-profile', createGetCurrentProfileHandler(getConfig));
  ipcMain.handle('get-current-page', createGetCurrentPageHandler(getConfig));
  ipcMain.handle('get-navigation-context', createGetNavigationContextHandler(getConfig));
  
  log('Profile IPC handlers registered');
}
