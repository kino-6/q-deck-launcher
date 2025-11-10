import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as platformAPI from './lib/platform-api';

// Create mock functions
const mockGetConfig = vi.fn();
const mockGetRegisteredHotkeys = vi.fn();

// Mock the platform API
vi.mock('./lib/platform-api', () => ({
  default: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    toggleOverlay: vi.fn(),
    executeAction: vi.fn(),
    getCurrentProfile: vi.fn(),
    getCurrentPage: vi.fn(),
    getNavigationContext: vi.fn(),
    onFileDrop: vi.fn(),
    getPlatform: vi.fn(() => 'win32'),
  },
  tauriAPI: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    toggleOverlay: vi.fn(),
    executeAction: vi.fn(),
    getCurrentProfile: vi.fn(),
    getCurrentPage: vi.fn(),
    getNavigationContext: vi.fn(),
    getProfiles: vi.fn(),
    getCurrentProfilePages: vi.fn(),
    switchToProfile: vi.fn(),
    switchToProfileByName: vi.fn(),
    switchToPage: vi.fn(),
    onFileDrop: vi.fn(),
    getPlatform: vi.fn(() => 'win32'),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    getMonitorInfo: vi.fn(),
    getCurrentMonitor: vi.fn(),
    getOptimalGridLayout: vi.fn(),
    calculateGridMetrics: vi.fn(),
    processIcon: vi.fn(),
    extractExecutableIcon: vi.fn(),
    getIconCacheStats: vi.fn(),
    clearIconCache: vi.fn(),
    registerHotkey: vi.fn(),
    unregisterHotkey: vi.fn(),
    registerMultipleHotkeys: vi.fn(),
    getRegisteredHotkeys: vi.fn(),
    isHotkeyAvailable: vi.fn(),
    analyzeDroppedFiles: vi.fn(),
    generateButtonsFromFiles: vi.fn(),
    addUndoOperation: vi.fn(),
    getLastUndoOperation: vi.fn(),
    undoLastOperation: vi.fn(),
    clearUndoHistory: vi.fn(),
    getUndoStats: vi.fn(),
    isOverlayVisible: vi.fn(),
    updateOverlayConfig: vi.fn(),
    positionOverlay: vi.fn(),
    getRecentLogs: vi.fn(),
  },
}));

// Mock ProfileContext
vi.mock('./contexts/ProfileContext', () => ({
  ProfileProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useProfile: () => ({
    currentProfile: null,
    currentPage: null,
    buttons: [],
    config: null,
    isLoading: false,
    error: null,
    refreshProfile: vi.fn(),
    switchProfile: vi.fn(),
    switchPage: vi.fn(),
  }),
}));

describe('React UI in Electron Window', () => {
  const mockConfig = {
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
            buttons: []
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the platform API responses
    vi.mocked(platformAPI.tauriAPI.getConfig).mockResolvedValue(mockConfig);
    vi.mocked(platformAPI.tauriAPI.getRegisteredHotkeys).mockResolvedValue([]);
  });

  it('should render React UI in Electron window', async () => {
    // Render the App component
    render(<App />);

    // Wait for the app to load
    await waitFor(() => {
      expect(screen.queryByText('Loading Q-Deck...')).not.toBeInTheDocument();
    });

    // Verify main UI elements are rendered
    expect(screen.getByText('Q-Deck Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your overlay launcher')).toBeInTheDocument();
  });

  it('should render all UI elements correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Q-Deck...')).not.toBeInTheDocument();
    });

    // Verify control buttons are rendered (using getAllByText to handle duplicates)
    const showOverlayElements = screen.getAllByText('Show Overlay');
    expect(showOverlayElements.length).toBeGreaterThan(0);
    expect(showOverlayElements[0]).toBeInTheDocument();
    
    const hideOverlayElements = screen.getAllByText('Hide Overlay');
    expect(hideOverlayElements.length).toBeGreaterThan(0);
    expect(hideOverlayElements[0]).toBeInTheDocument();
    
    const toggleOverlayElements = screen.getAllByText('Toggle Overlay');
    expect(toggleOverlayElements.length).toBeGreaterThan(0);
    expect(toggleOverlayElements[0]).toBeInTheDocument();

    // Verify configuration section is rendered
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Version:')).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    expect(screen.getByText('Profiles:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Theme:')).toBeInTheDocument();
    expect(screen.getByText('dark')).toBeInTheDocument();

    // Verify hotkey management section is rendered
    expect(screen.getByText('Hotkey Management')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Ctrl+Alt+F1')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Check Available')).toBeInTheDocument();

    // Verify default hotkeys are displayed
    expect(screen.getByText('Default Hotkeys:')).toBeInTheDocument();
    expect(screen.getByText('F11')).toBeInTheDocument();
  });
});
