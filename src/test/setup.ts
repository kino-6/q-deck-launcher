import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Tauri API
const mockTauriAPI = {
  getConfig: vi.fn(),
  saveConfig: vi.fn(),
  showOverlay: vi.fn(),
  hideOverlay: vi.fn(),
  toggleOverlay: vi.fn(),
  isOverlayVisible: vi.fn(),
  updateOverlayConfig: vi.fn(),
  positionOverlay: vi.fn(),
  executeAction: vi.fn(),
  getRecentLogs: vi.fn(),
  getLogStats: vi.fn(),
  rotateLog: vi.fn(),
  cleanupLogsBySize: vi.fn(),
  registerHotkey: vi.fn(),
  unregisterHotkey: vi.fn(),
  registerMultipleHotkeys: vi.fn(),
  getRegisteredHotkeys: vi.fn(),
  isHotkeyAvailable: vi.fn(),
  // New icon processing APIs
  processIcon: vi.fn(),
  extractExecutableIcon: vi.fn(),
  getIconCacheStats: vi.fn(),
  clearIconCache: vi.fn(),
  // New multi-monitor APIs
  getMonitorInfo: vi.fn(),
  getCurrentMonitor: vi.fn(),
  getOptimalGridLayout: vi.fn(),
  calculateGridMetrics: vi.fn(),
};

vi.mock('../lib/tauri', () => ({
  tauriAPI: mockTauriAPI,
  ActionButton: {},
  QDeckConfig: {},
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Global test utilities
(globalThis as any).mockTauriAPI = mockTauriAPI;