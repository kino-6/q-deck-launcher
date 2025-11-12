/**
 * Profile and Page IPC Handlers
 * 
 * Handles IPC communication for profile and page management.
 */

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log('[ProfileHandlers]', ...args);

/**
 * Create get-current-profile handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createGetCurrentProfileHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    return profileStateManager.getCurrentProfile(config);
  };
}

/**
 * Create get-current-page handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createGetCurrentPageHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    return profileStateManager.getCurrentPage(config);
  };
}

/**
 * Create get-navigation-context handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createGetNavigationContextHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    return profileStateManager.getNavigationContext(config);
  };
}

/**
 * Create get-all-profiles handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createGetAllProfilesHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    return profileStateManager.getAllProfiles(config);
  };
}

/**
 * Create get-current-profile-pages handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createGetCurrentProfilePagesHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    return profileStateManager.getCurrentProfilePages(config);
  };
}

/**
 * Create switch-to-profile handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createSwitchToProfileHandler(getConfig, profileStateManager) {
  return async (event, profileIndex) => {
    const config = getConfig();
    const result = profileStateManager.switchToProfile(profileIndex, config);
    
    if (result) {
      log('Switched to profile:', result);
    }
    
    return result;
  };
}

/**
 * Create switch-to-profile-by-name handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createSwitchToProfileByNameHandler(getConfig, profileStateManager) {
  return async (event, profileName) => {
    const config = getConfig();
    const result = profileStateManager.switchToProfileByName(profileName, config);
    
    if (result) {
      log('Switched to profile by name:', result);
    }
    
    return result;
  };
}

/**
 * Create switch-to-page handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createSwitchToPageHandler(getConfig, profileStateManager) {
  return async (event, pageIndex) => {
    const config = getConfig();
    const result = profileStateManager.switchToPage(pageIndex, config);
    
    if (result) {
      log('Switched to page:', result);
    }
    
    return result;
  };
}

/**
 * Create next-page handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createNextPageHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    const result = profileStateManager.nextPage(config);
    
    if (result) {
      log('Moved to next page:', result);
    }
    
    return result;
  };
}

/**
 * Create previous-page handler
 * 
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 * @returns {Function} IPC handler function
 */
export function createPreviousPageHandler(getConfig, profileStateManager) {
  return async () => {
    const config = getConfig();
    const result = profileStateManager.previousPage(config);
    
    if (result) {
      log('Moved to previous page:', result);
    }
    
    return result;
  };
}

/**
 * Register all profile-related IPC handlers
 * 
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Function} getConfig - Function to get current config
 * @param {Object} profileStateManager - Profile state manager instance
 */
export function registerProfileHandlers(ipcMain, getConfig, profileStateManager) {
  ipcMain.handle('get-current-profile', createGetCurrentProfileHandler(getConfig, profileStateManager));
  ipcMain.handle('get-current-page', createGetCurrentPageHandler(getConfig, profileStateManager));
  ipcMain.handle('get-navigation-context', createGetNavigationContextHandler(getConfig, profileStateManager));
  ipcMain.handle('get-all-profiles', createGetAllProfilesHandler(getConfig, profileStateManager));
  ipcMain.handle('get-current-profile-pages', createGetCurrentProfilePagesHandler(getConfig, profileStateManager));
  ipcMain.handle('switch-to-profile', createSwitchToProfileHandler(getConfig, profileStateManager));
  ipcMain.handle('switch-to-profile-by-name', createSwitchToProfileByNameHandler(getConfig, profileStateManager));
  ipcMain.handle('switch-to-page', createSwitchToPageHandler(getConfig, profileStateManager));
  ipcMain.handle('next-page', createNextPageHandler(getConfig, profileStateManager));
  ipcMain.handle('previous-page', createPreviousPageHandler(getConfig, profileStateManager));
  
  log('Profile IPC handlers registered');
}
