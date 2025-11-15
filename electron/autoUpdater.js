/**
 * Auto-update module for Q-Deck Launcher
 * Handles automatic updates via GitHub Releases using electron-updater
 */

import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { dialog, app } from 'electron';
import logger from './logger.js';

class AutoUpdateManager {
  constructor() {
    this.updateCheckInterval = null;
    this.isCheckingForUpdates = false;
    this.config = {
      autoDownload: false, // User control: manual download
      autoInstallOnAppQuit: true,
      checkInterval: 7 * 24 * 60 * 60 * 1000, // Weekly check (7 days in ms)
    };

    // Configure autoUpdater
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;

    // Set up event handlers
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
      this.isCheckingForUpdates = true;
    });

    autoUpdater.on('update-available', (info) => {
      logger.info('Update available', { version: info.version });
      this.isCheckingForUpdates = false;
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      logger.info('Update not available', { currentVersion: info.version });
      this.isCheckingForUpdates = false;
    });

    autoUpdater.on('error', (err) => {
      logger.error('Error in auto-updater', { error: err.message, stack: err.stack });
      this.isCheckingForUpdates = false;
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      logger.info('Update download progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      logger.info('Update downloaded', { version: info.version });
      this.showUpdateDownloadedDialog(info);
    });
  }

  /**
   * Show dialog when update is available
   */
  showUpdateAvailableDialog(info) {
    const dialogOpts = {
      type: 'info',
      buttons: ['Download Update', 'Later'],
      title: 'Update Available',
      message: `Version ${info.version} is available`,
      detail: `A new version of Q-Deck Launcher is available. Would you like to download it now?\n\nCurrent version: ${app.getVersion()}\nNew version: ${info.version}`,
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // User clicked "Download Update"
        logger.info('User initiated update download');
        autoUpdater.downloadUpdate();
      } else {
        logger.info('User postponed update');
      }
    });
  }

  /**
   * Show dialog when update is downloaded and ready to install
   */
  showUpdateDownloadedDialog(info) {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart Now', 'Later'],
      title: 'Update Ready',
      message: 'Update downloaded',
      detail: `Version ${info.version} has been downloaded. The application will restart to install the update.`,
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // User clicked "Restart Now"
        logger.info('User initiated app restart for update');
        setImmediate(() => autoUpdater.quitAndInstall());
      } else {
        logger.info('User postponed update installation');
      }
    });
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates() {
    if (this.isCheckingForUpdates) {
      logger.warn('Update check already in progress');
      return;
    }

    try {
      logger.info('Manual update check initiated');
      await autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('Failed to check for updates', { error: error.message });
      throw error;
    }
  }

  /**
   * Start automatic update checks
   */
  startAutoUpdateChecks() {
    // Check immediately on startup (after a short delay)
    setTimeout(() => {
      this.checkForUpdates().catch((err) => {
        logger.error('Initial update check failed', { error: err.message });
      });
    }, 10000); // 10 seconds after startup

    // Set up periodic checks
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates().catch((err) => {
        logger.error('Periodic update check failed', { error: err.message });
      });
    }, this.config.checkInterval);

    logger.info('Auto-update checks started', { interval: this.config.checkInterval });
  }

  /**
   * Stop automatic update checks
   */
  stopAutoUpdateChecks() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      logger.info('Auto-update checks stopped');
    }
  }

  /**
   * Get current update configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    
    // Restart update checks if interval changed
    if (newConfig.checkInterval && this.updateCheckInterval) {
      this.stopAutoUpdateChecks();
      this.startAutoUpdateChecks();
    }

    logger.info('Auto-update configuration updated', this.config);
  }
}

// Export class for testing
export { AutoUpdateManager };

// Export singleton instance
const autoUpdateManager = new AutoUpdateManager();

export default autoUpdateManager;
