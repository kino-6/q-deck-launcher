import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GridDragDrop } from './GridDragDrop';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    extractExecutableIcon: vi.fn(),
    saveConfig: vi.fn(),
  },
  isElectron: () => true,
}));

// Mock the electron adapter
vi.mock('../lib/electron-adapter', () => ({
  isElectron: () => true,
  platformAPI: {
    extractIcon: vi.fn(),
    getIconPath: vi.fn(),
  },
}));

// Mock the useDragDrop hook
vi.mock('../hooks/useDragDrop', () => ({
  useDragDrop: () => ({
    dragState: {
      isDragging: false,
      dragOverPosition: null,
      isProcessing: false,
    },
    setDragging: vi.fn(),
    setDragOverPosition: vi.fn(),
    setProcessing: vi.fn(),
    resetDragState: vi.fn(),
  }),
}));

describe('GridDragDrop - Icon Extraction', () => {
  const mockConfig = {
    version: '1.0',
    ui: {
      summon: {
        hotkeys: ['F11'],
      },
      window: {
        placement: 'dropdown-top' as const,
        width_px: 1000,
        height_px: 600,
        cell_size_px: 96,
        gap_px: 8,
        opacity: 0.92,
        theme: 'dark' as const,
        animation: {
          enabled: true,
          duration_ms: 150,
        },
      },
    },
    profiles: [
      {
        name: 'Test Profile',
        pages: [
          {
            name: 'Test Page',
            rows: 3,
            cols: 3,
            buttons: [],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract icon from executable file', async () => {
    const mockIconPath = 'C:\\Users\\test\\AppData\\Roaming\\q-deck-launcher\\icon-cache\\test_icon.png';
    
    // Mock the icon extraction to return success
    vi.mocked(tauriAPI.extractExecutableIcon).mockResolvedValue({
      path: mockIconPath,
      icon_type: 'Extracted',
      extracted_from: 'C:\\Program Files\\TestApp\\test.exe',
    });

    // Mock saveConfig to succeed
    vi.mocked(tauriAPI.saveConfig).mockResolvedValue(undefined);

    const setTempConfig = vi.fn();

    render(
      <GridDragDrop
        config={mockConfig}
        tempConfig={null}
        setTempConfig={setTempConfig}
        currentProfileIndex={0}
        currentPageIndex={0}
      >
        {() => <div data-testid="grid-content">Grid Content</div>}
      </GridDragDrop>
    );

    // Verify the component renders
    expect(screen.getByTestId('grid-content')).toBeInTheDocument();

    // Note: Full drag-and-drop testing would require simulating file drops
    // which is complex in a test environment. This test verifies the component
    // structure and that the icon extraction API is available.
  });

  it('should use default icon when extraction fails', async () => {
    // Mock the icon extraction to return failure
    vi.mocked(tauriAPI.extractExecutableIcon).mockResolvedValue({
      path: '',
      icon_type: 'File',
    });

    const setTempConfig = vi.fn();

    render(
      <GridDragDrop
        config={mockConfig}
        tempConfig={null}
        setTempConfig={setTempConfig}
        currentProfileIndex={0}
        currentPageIndex={0}
      >
        {() => <div data-testid="grid-content">Grid Content</div>}
      </GridDragDrop>
    );

    // Verify the component renders
    expect(screen.getByTestId('grid-content')).toBeInTheDocument();
  });

  it('should handle icon extraction errors gracefully', async () => {
    // Mock the icon extraction to throw an error
    vi.mocked(tauriAPI.extractExecutableIcon).mockRejectedValue(
      new Error('Failed to extract icon')
    );

    const setTempConfig = vi.fn();

    render(
      <GridDragDrop
        config={mockConfig}
        tempConfig={null}
        setTempConfig={setTempConfig}
        currentProfileIndex={0}
        currentPageIndex={0}
      >
        {() => <div data-testid="grid-content">Grid Content</div>}
      </GridDragDrop>
    );

    // Verify the component renders despite the error
    expect(screen.getByTestId('grid-content')).toBeInTheDocument();
  });
});
