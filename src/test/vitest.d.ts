import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }

  var mockTauriAPI: {
    getConfig: ReturnType<typeof vi.fn>;
    saveConfig: ReturnType<typeof vi.fn>;
    showOverlay: ReturnType<typeof vi.fn>;
    hideOverlay: ReturnType<typeof vi.fn>;
    toggleOverlay: ReturnType<typeof vi.fn>;
    isOverlayVisible: ReturnType<typeof vi.fn>;
    updateOverlayConfig: ReturnType<typeof vi.fn>;
    positionOverlay: ReturnType<typeof vi.fn>;
    executeAction: ReturnType<typeof vi.fn>;
    getRecentLogs: ReturnType<typeof vi.fn>;
    registerHotkey: ReturnType<typeof vi.fn>;
    unregisterHotkey: ReturnType<typeof vi.fn>;
    registerMultipleHotkeys: ReturnType<typeof vi.fn>;
    getRegisteredHotkeys: ReturnType<typeof vi.fn>;
    isHotkeyAvailable: ReturnType<typeof vi.fn>;
  };
}