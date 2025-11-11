import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Grid } from './Grid';
import { QDeckConfig } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', async () => {
  const actual = await vi.importActual('../lib/platform-api');
  return {
    ...actual,
    tauriAPI: {
      saveConfig: vi.fn().mockResolvedValue(undefined),
      getLastUndoOperation: vi.fn().mockResolvedValue(null),
      undoLastOperation: vi.fn().mockResolvedValue(undefined),
      executeAction: vi.fn().mockResolvedValue({ success: true }),
      extractIcon: vi.fn().mockResolvedValue({ type: 'emoji', content: '🚀' }),
    },
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Button Edit and Delete Functionality', () => {
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
        hotkey: 'Ctrl+1',
        pages: [
          {
            name: 'Test Page',
            rows: 3,
            cols: 3,
            buttons: [
              {
                position: { row: 1, col: 1 },
                action_type: 'LaunchApp',
                label: 'Test Button',
                icon: '🚀',
                config: {
                  path: 'notepad.exe',
                },
                style: {
                  background_color: '#3b82f6',
                  text_color: '#ffffff',
                },
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display context menu on right-click', async () => {
    render(
      <Grid
        config={mockConfig}
        currentProfile={{ index: 0, name: 'Test Profile' }}
        currentPage={{ index: 0, name: 'Test Page' }}
      />
    );

    // Find the button
    const button = screen.getByText('Test Button');
    expect(button).toBeDefined();

    // Right-click the button
    fireEvent.contextMenu(button);

    // Wait for context menu to appear
    await waitFor(() => {
      const editButton = screen.queryByText('編集');
      expect(editButton).toBeDefined();
    });

    // Verify context menu items
    expect(screen.queryByText('編集')).toBeDefined();
    expect(screen.queryByText('削除')).toBeDefined();
  });

  it('should delete button when delete menu item is clicked', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    render(
      <Grid
        config={mockConfig}
        currentProfile={{ index: 0, name: 'Test Profile' }}
        currentPage={{ index: 0, name: 'Test Page' }}
      />
    );

    // Find the button
    const button = screen.getByText('Test Button');
    
    // Right-click the button
    fireEvent.contextMenu(button);

    // Wait for context menu
    await waitFor(() => {
      expect(screen.queryByText('削除')).toBeDefined();
    });

    // Click delete
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // Verify saveConfig was called
    await waitFor(() => {
      expect(tauriAPI.saveConfig).toHaveBeenCalled();
    });

    // Verify the button was removed from config
    const savedConfig = (tauriAPI.saveConfig as any).mock.calls[0][0];
    expect(savedConfig.profiles[0].pages[0].buttons.length).toBe(0);
  });
});
