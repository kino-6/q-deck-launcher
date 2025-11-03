declare global {
  var mockTauriAPI: {
    getConfig: any;
    saveConfig: any;
    showOverlay: any;
    hideOverlay: any;
    toggleOverlay: any;
    isOverlayVisible: any;
    updateOverlayConfig: any;
    positionOverlay: any;
    executeAction: any;
    getRecentLogs: any;
    getLogStats: any;
    rotateLog: any;
    cleanupLogsBySize: any;
    registerHotkey: any;
    unregisterHotkey: any;
    registerMultipleHotkeys: any;
    getRegisteredHotkeys: any;
    isHotkeyAvailable: any;
    processIcon: any;
    extractExecutableIcon: any;
    getIconCacheStats: any;
    clearIconCache: any;
    getMonitorInfo: any;
    getCurrentMonitor: any;
    getOptimalGridLayout: any;
    calculateGridMetrics: any;
  };
}

export {};