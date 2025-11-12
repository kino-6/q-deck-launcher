/**
 * Profile State Manager
 * 
 * Manages the current profile and page state for the application.
 * Persists state to a separate file to remember user's last selection.
 */

import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log('[ProfileStateManager]', ...args);

export class ProfileStateManager {
  constructor() {
    this.currentProfileIndex = 0;
    this.currentPageIndex = 0;
    this.stateFilePath = this._getStateFilePath();
    this._loadState();
  }

  /**
   * Get the path to the state file
   * @private
   * @returns {string} Path to state file
   */
  _getStateFilePath() {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'profile-state.json');
  }

  /**
   * Load state from file
   * @private
   */
  _loadState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const stateData = fs.readFileSync(this.stateFilePath, 'utf8');
        const state = JSON.parse(stateData);
        
        this.currentProfileIndex = state.currentProfileIndex || 0;
        this.currentPageIndex = state.currentPageIndex || 0;
        
        log('State loaded:', { currentProfileIndex: this.currentProfileIndex, currentPageIndex: this.currentPageIndex });
      } else {
        log('No state file found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load profile state:', error);
      // Use defaults on error
      this.currentProfileIndex = 0;
      this.currentPageIndex = 0;
    }
  }

  /**
   * Save state to file
   * @private
   */
  _saveState() {
    try {
      const state = {
        currentProfileIndex: this.currentProfileIndex,
        currentPageIndex: this.currentPageIndex,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2), 'utf8');
      log('State saved:', state);
    } catch (error) {
      console.error('Failed to save profile state:', error);
    }
  }

  /**
   * Get current profile index
   * @returns {number} Current profile index
   */
  getCurrentProfileIndex() {
    return this.currentProfileIndex;
  }

  /**
   * Get current page index
   * @returns {number} Current page index
   */
  getCurrentPageIndex() {
    return this.currentPageIndex;
  }

  /**
   * Switch to a specific profile
   * @param {number} profileIndex - Profile index to switch to
   * @param {Object} config - Current configuration
   * @returns {Object|null} Profile info or null if invalid
   */
  switchToProfile(profileIndex, config) {
    if (!config || !config.profiles || profileIndex < 0 || profileIndex >= config.profiles.length) {
      log('Invalid profile index:', profileIndex);
      return null;
    }

    this.currentProfileIndex = profileIndex;
    this.currentPageIndex = 0; // Reset to first page when switching profiles
    this._saveState();

    const profile = config.profiles[profileIndex];
    log('Switched to profile:', { index: profileIndex, name: profile.name });

    return {
      index: profileIndex,
      name: profile.name,
      page_count: profile.pages ? profile.pages.length : 0,
      current_page_index: 0,
      hotkey: profile.hotkey || null
    };
  }

  /**
   * Switch to a profile by name
   * @param {string} profileName - Profile name to switch to
   * @param {Object} config - Current configuration
   * @returns {Object|null} Profile info or null if not found
   */
  switchToProfileByName(profileName, config) {
    if (!config || !config.profiles) {
      return null;
    }

    const profileIndex = config.profiles.findIndex(p => p.name === profileName);
    if (profileIndex === -1) {
      log('Profile not found:', profileName);
      return null;
    }

    return this.switchToProfile(profileIndex, config);
  }

  /**
   * Switch to a specific page
   * @param {number} pageIndex - Page index to switch to
   * @param {Object} config - Current configuration
   * @returns {Object|null} Page info or null if invalid
   */
  switchToPage(pageIndex, config) {
    if (!config || !config.profiles) {
      return null;
    }

    const profile = config.profiles[this.currentProfileIndex];
    if (!profile || !profile.pages || pageIndex < 0 || pageIndex >= profile.pages.length) {
      log('Invalid page index:', pageIndex);
      return null;
    }

    this.currentPageIndex = pageIndex;
    this._saveState();

    const page = profile.pages[pageIndex];
    log('Switched to page:', { index: pageIndex, name: page.name });

    return {
      index: pageIndex,
      name: page.name,
      rows: page.rows,
      cols: page.cols,
      button_count: page.buttons ? page.buttons.length : 0
    };
  }

  /**
   * Go to next page
   * @param {Object} config - Current configuration
   * @returns {Object|null} Page info or null if at last page
   */
  nextPage(config) {
    if (!config || !config.profiles) {
      return null;
    }

    const profile = config.profiles[this.currentProfileIndex];
    if (!profile || !profile.pages) {
      return null;
    }

    const nextIndex = this.currentPageIndex + 1;
    if (nextIndex >= profile.pages.length) {
      log('Already at last page');
      return null;
    }

    return this.switchToPage(nextIndex, config);
  }

  /**
   * Go to previous page
   * @param {Object} config - Current configuration
   * @returns {Object|null} Page info or null if at first page
   */
  previousPage(config) {
    if (!config || !config.profiles) {
      return null;
    }

    const prevIndex = this.currentPageIndex - 1;
    if (prevIndex < 0) {
      log('Already at first page');
      return null;
    }

    return this.switchToPage(prevIndex, config);
  }

  /**
   * Get current profile info
   * @param {Object} config - Current configuration
   * @returns {Object|null} Profile info or null if invalid
   */
  getCurrentProfile(config) {
    if (!config || !config.profiles || this.currentProfileIndex >= config.profiles.length) {
      return null;
    }

    const profile = config.profiles[this.currentProfileIndex];
    return {
      index: this.currentProfileIndex,
      name: profile.name,
      page_count: profile.pages ? profile.pages.length : 0,
      current_page_index: this.currentPageIndex,
      hotkey: profile.hotkey || null
    };
  }

  /**
   * Get current page info
   * @param {Object} config - Current configuration
   * @returns {Object|null} Page info or null if invalid
   */
  getCurrentPage(config) {
    if (!config || !config.profiles) {
      return null;
    }

    const profile = config.profiles[this.currentProfileIndex];
    if (!profile || !profile.pages || this.currentPageIndex >= profile.pages.length) {
      return null;
    }

    const page = profile.pages[this.currentPageIndex];
    return {
      index: this.currentPageIndex,
      name: page.name,
      rows: page.rows,
      cols: page.cols,
      button_count: page.buttons ? page.buttons.length : 0
    };
  }

  /**
   * Get navigation context
   * @param {Object} config - Current configuration
   * @returns {Object|null} Navigation context or null if invalid
   */
  getNavigationContext(config) {
    if (!config || !config.profiles) {
      return null;
    }

    const profile = config.profiles[this.currentProfileIndex];
    if (!profile) {
      return null;
    }

    const totalPages = profile.pages ? profile.pages.length : 0;

    return {
      profile_name: profile.name,
      profile_index: this.currentProfileIndex,
      page_name: profile.pages && profile.pages[this.currentPageIndex] ? profile.pages[this.currentPageIndex].name : '',
      page_index: this.currentPageIndex,
      total_profiles: config.profiles.length,
      total_pages: totalPages,
      has_previous_page: this.currentPageIndex > 0,
      has_next_page: this.currentPageIndex < totalPages - 1
    };
  }

  /**
   * Get all profiles
   * @param {Object} config - Current configuration
   * @returns {Array} Array of profile info objects
   */
  getAllProfiles(config) {
    if (!config || !config.profiles) {
      return [];
    }

    return config.profiles.map((profile, index) => ({
      index,
      name: profile.name,
      page_count: profile.pages ? profile.pages.length : 0,
      hotkey: profile.hotkey || null
    }));
  }

  /**
   * Get all pages for current profile
   * @param {Object} config - Current configuration
   * @returns {Array} Array of page info objects
   */
  getCurrentProfilePages(config) {
    if (!config || !config.profiles) {
      return [];
    }

    const profile = config.profiles[this.currentProfileIndex];
    if (!profile || !profile.pages) {
      return [];
    }

    return profile.pages.map((page, index) => ({
      index,
      name: page.name,
      rows: page.rows,
      cols: page.cols,
      button_count: page.buttons ? page.buttons.length : 0
    }));
  }
}

export default ProfileStateManager;
