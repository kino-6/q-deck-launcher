import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import Overlay from '../pages/Overlay';
import { tauriAPI } from '../lib/platform-api';
import type { QDeckConfig } from '../lib/platform-api';

/**
 * Integration test for F11 → number key workflow
 * Tests the complete keyboard-only operation flow
 */
describe('F11 → Number Key Workflow (Keyboard-Only Operation)', () => {
  const mockConfig: QDeckConfig = {
    version: '1.0',
    ui: {
      summon: {
        hotkeys: ['F11'],
        edge_trigger: {
          enabled: false,
          edges: [],
          dwell_ms: 300,
          margin_px: 5,
        },
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
          duration_ms: 150,
        },
      },
    },
    profiles: [
      {
        name: 'Test Profile',
        hotkey: null,
        pages: [
          {
            name: 'Main Page',
            rows: 3,
            cols: 4,
            buttons: [
              {
                position: { row: 1, col: 1 },
                action_type: 'LaunchApp',
                label: 'VS Code',
                icon: '💻',
                config: { path: 'code.exe' },
              },
              {
                position: { row: 1, col: 2 },
                action_type: 'LaunchApp',
                label: 'Chrome',
                icon: '🌐',
                config: { path: 'chrome.exe' },
              },
              {
                position: { row: 1, col: 3 },
                action_type: 'Open',
                label: 'Documents',
                icon: '📁',
                config: { path: 'C:\\Users\\Documents' },
              },
              {
                position: { row: 2, col: 1 },
                action_type: 'Terminal',
                label: 'PowerShell',
                icon: '⚡',
                config: { terminal: 'PowerShell' },
              },
              {
                position: { row: 2, col: 2 },
                action_type: 'LaunchApp',
                label: 'Notepad',
                icon: '📝',
                config: { path: 'notepad.exe' },
              },
            ],
          },
        ],
      },
    ],
  };

  let mockGetConfig: ReturnType<typeof vi.fn>;
  let mockExecuteAction: ReturnType<typeof vi.fn>;
  let mockHideOverlay: ReturnType<typeof vi.fn>;
  let mockGetCurrentProfile: ReturnType<typeof vi.fn>;
  let mockGetCurrentPage: ReturnType<typeof vi.fn>;
  let mockGetNavigationContext: ReturnType<typeof vi.fn>;
  let mockGetProfiles: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock all tauriAPI functions
    mockGetConfig = vi.fn().mockResolvedValue(mockConfig);
    mockExecuteAction = vi.fn().mockResolvedValue({ success: true });
    mockHideOverlay = vi.fn().mockResolvedValue(undefined);
    mockGetCurrentProfile = vi.fn().mockResolvedValue({
      index: 0,
      name: 'Test Profile',
      hotkey: null,
    });
    mockGetCurrentPage = vi.fn().mockResolvedValue({
      index: 0,
      name: 'Main Page',
      rows: 3,
      cols: 4,
    });
    mockGetNavigationContext = vi.fn().mockResolvedValue({
      profile_index: 0,
      page_index: 0,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    });
    mockGetProfiles = vi.fn().mockResolvedValue([
      {
        index: 0,
        name: 'Test Profile',
        hotkey: null,
      },
    ]);

    // Replace tauriAPI methods
    vi.spyOn(tauriAPI, 'getConfig').mockImplementation(mockGetConfig);
    vi.spyOn(tauriAPI, 'executeAction').mockImplementation(mockExecuteAction);
    vi.spyOn(tauriAPI, 'hideOverlay').mockImplementation(mockHideOverlay);
    vi.spyOn(tauriAPI, 'getCurrentProfile').mockImplementation(mockGetCurrentProfile);
    vi.spyOn(tauriAPI, 'getCurrentPage').mockImplementation(mockGetCurrentPage);
    vi.spyOn(tauriAPI, 'getNavigationContext').mockImplementation(mockGetNavigationContext);
    vi.spyOn(tauriAPI, 'getProfiles').mockImplementation(mockGetProfiles);

    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should execute first button action when pressing "1" key', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Simulate pressing "1" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait for action to be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LaunchApp',
          label: 'VS Code',
          path: 'code.exe',
        })
      );
    });
  });

  it('should execute second button action when pressing "2" key', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('Chrome')).toBeInTheDocument();
    });

    // Simulate pressing "2" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '2',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait for action to be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LaunchApp',
          label: 'Chrome',
          path: 'chrome.exe',
        })
      );
    });
  });

  it('should execute third button action when pressing "3" key', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    // Simulate pressing "3" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '3',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait for action to be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Open',
          label: 'Documents',
          path: 'C:\\Users\\Documents',
        })
      );
    });
  });

  it('should execute fourth button action when pressing "4" key', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('PowerShell')).toBeInTheDocument();
    });

    // Simulate pressing "4" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '4',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait for action to be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Terminal',
          label: 'PowerShell',
          terminal: 'PowerShell',
        })
      );
    });
  });

  it('should execute fifth button action when pressing "5" key', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('Notepad')).toBeInTheDocument();
    });

    // Simulate pressing "5" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '5',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait for action to be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LaunchApp',
          label: 'Notepad',
          path: 'notepad.exe',
        })
      );
    });
  });

  it('should complete full F11 → 1 workflow smoothly', async () => {
    // This test simulates the complete user workflow:
    // 1. User presses F11 (overlay appears - simulated by rendering Overlay)
    // 2. User presses "1" (first button executes)
    // 3. Action completes successfully

    render(<Overlay />);

    // Step 1: Overlay loads (simulating F11 press)
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Verify overlay is visible with buttons
    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
      expect(screen.getByText('Chrome')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    // Step 2: User presses "1" key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '1',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Step 3: Action executes successfully
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledTimes(1);
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LaunchApp',
          label: 'VS Code',
          path: 'code.exe',
        })
      );
    });

    // Verify the workflow completed without errors
    expect(mockExecuteAction).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid key presses smoothly', async () => {
    // Test that multiple rapid key presses are handled correctly
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Simulate rapid key presses: 1, 2, 3
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    });

    // All three actions should be executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledTimes(3);
    });

    // Verify correct actions were called
    expect(mockExecuteAction).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ label: 'VS Code' })
    );
    expect(mockExecuteAction).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ label: 'Chrome' })
    );
    expect(mockExecuteAction).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ label: 'Documents' })
    );
  });

  it('should not execute action for non-existent button', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Wait for buttons to render
    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Simulate pressing "9" key (no 9th button exists)
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: '9',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Wait a bit to ensure no action is executed
    await new Promise(resolve => setTimeout(resolve, 100));

    // No action should be executed
    expect(mockExecuteAction).not.toHaveBeenCalled();
  });

  it('should handle Escape key to close overlay', async () => {
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    // Simulate pressing Escape key
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(keyEvent);
    });

    // Verify hideOverlay was called
    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalled();
    });
  });

  it('should complete F11 → 1 → Escape workflow smoothly', async () => {
    // This test simulates a complete workflow:
    // 1. User presses F11 (overlay appears)
    // 2. User presses "1" (first button executes)
    // 3. User presses Escape (overlay closes)

    render(<Overlay />);

    // Step 1: Overlay loads
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Step 2: User presses "1" key
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'VS Code' })
      );
    });

    // Step 3: User presses Escape key
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalled();
    });

    // Verify complete workflow executed correctly
    expect(mockExecuteAction).toHaveBeenCalledTimes(1);
    expect(mockHideOverlay).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard shortcuts without mouse interaction', async () => {
    // This test verifies that the entire workflow can be completed
    // using only the keyboard, without any mouse clicks

    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Execute multiple actions using only keyboard
    act(() => {
      // Press "1" to execute first button
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'VS Code' })
      );
    });

    act(() => {
      // Press "2" to execute second button
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Chrome' })
      );
    });

    act(() => {
      // Press Escape to close
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockHideOverlay).toHaveBeenCalled();
    });

    // Verify all keyboard operations completed successfully
    expect(mockExecuteAction).toHaveBeenCalledTimes(2);
    expect(mockHideOverlay).toHaveBeenCalledTimes(1);
  });

  it('should respond quickly to keyboard input (< 100ms)', async () => {
    // This test verifies that keyboard shortcuts are responsive
    render(<Overlay />);

    // Wait for overlay to load
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('VS Code')).toBeInTheDocument();
    });

    // Measure response time
    const startTime = performance.now();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    });

    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // Response should be quick (< 100ms in test environment)
    // Note: In real environment, this would be even faster
    expect(responseTime).toBeLessThan(100);
  });
});
