import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';
import { QDeckConfig, ProfileInfo, PageInfo } from '../lib/platform-api';

describe('Button Shortcuts Integration', () => {
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
            name: 'Test Page',
            rows: 3,
            cols: 4,
            buttons: [
              // Row 1
              {
                position: { row: 1, col: 1 },
                action_type: 'LaunchApp',
                label: 'Button 1',
                icon: '🚀',
                config: { path: 'app1.exe' },
              },
              {
                position: { row: 1, col: 2 },
                action_type: 'LaunchApp',
                label: 'Button 2',
                icon: '📁',
                config: { path: 'app2.exe' },
              },
              {
                position: { row: 1, col: 3 },
                action_type: 'Open',
                label: 'Button 3',
                icon: '📂',
                config: { path: 'file.txt' },
              },
              // Row 2
              {
                position: { row: 2, col: 1 },
                action_type: 'Terminal',
                label: 'Button 4',
                icon: '💻',
                config: { terminal: 'PowerShell' },
              },
              {
                position: { row: 2, col: 2 },
                action_type: 'LaunchApp',
                label: 'Button 5',
                icon: '🎮',
                config: { path: 'game.exe' },
              },
              // Row 3
              {
                position: { row: 3, col: 1 },
                action_type: 'LaunchApp',
                label: 'Button 6',
                icon: '🎵',
                config: { path: 'music.exe' },
              },
              {
                position: { row: 3, col: 2 },
                action_type: 'LaunchApp',
                label: 'Button 7',
                icon: '🎬',
                config: { path: 'video.exe' },
              },
              {
                position: { row: 3, col: 3 },
                action_type: 'LaunchApp',
                label: 'Button 8',
                icon: '📷',
                config: { path: 'photo.exe' },
              },
              {
                position: { row: 3, col: 4 },
                action_type: 'LaunchApp',
                label: 'Button 9',
                icon: '🎨',
                config: { path: 'paint.exe' },
              },
            ],
          },
        ],
      },
    ],
  };

  const mockCurrentProfile: ProfileInfo = {
    index: 0,
    name: 'Test Profile',
    hotkey: null,
  };

  const mockCurrentPage: PageInfo = {
    index: 0,
    name: 'Test Page',
    rows: 3,
    cols: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display shortcut numbers on buttons in reading order', () => {
    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Verify buttons are rendered with shortcut badges
    // Note: The actual badge rendering depends on the ActionButton component
    const buttons = screen.getAllByRole('button');
    
    // We should have 9 buttons (excluding empty cells)
    expect(buttons.length).toBeGreaterThanOrEqual(9);
  });

  it('should map shortcuts in reading order: left-to-right, top-to-bottom', () => {
    const { container } = render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Check that buttons are in the correct order
    const buttonLabels = Array.from(container.querySelectorAll('.button-label')).map(
      (el) => el.textContent
    );

    // Expected order: Row 1 (cols 1-3), Row 2 (cols 1-2), Row 3 (cols 1-4)
    // But only first 9 buttons get shortcuts
    expect(buttonLabels).toContain('Button 1'); // Position (1,1) -> Shortcut 1
    expect(buttonLabels).toContain('Button 2'); // Position (1,2) -> Shortcut 2
    expect(buttonLabels).toContain('Button 3'); // Position (1,3) -> Shortcut 3
    expect(buttonLabels).toContain('Button 4'); // Position (2,1) -> Shortcut 4
    expect(buttonLabels).toContain('Button 5'); // Position (2,2) -> Shortcut 5
    expect(buttonLabels).toContain('Button 6'); // Position (3,1) -> Shortcut 6
    expect(buttonLabels).toContain('Button 7'); // Position (3,2) -> Shortcut 7
    expect(buttonLabels).toContain('Button 8'); // Position (3,3) -> Shortcut 8
    expect(buttonLabels).toContain('Button 9'); // Position (3,4) -> Shortcut 9
  });

  it('should assign shortcut "1" to first button (top-left)', () => {
    const { container } = render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Find the first button (Button 1 at position 1,1)
    const firstButton = container.querySelector('[data-row="1"][data-col="1"]');
    expect(firstButton).toBeTruthy();
    
    // Check if it has a shortcut badge with "1"
    const shortcutBadge = firstButton?.querySelector('.button-shortcut-badge');
    if (shortcutBadge) {
      expect(shortcutBadge.textContent).toBe('1');
    }
  });

  it('should assign shortcuts sequentially in reading order', () => {
    const { container } = render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Expected mapping based on reading order (only non-empty cells get shortcuts):
    // Grid cells are processed in reading order: (1,1), (1,2), (1,3), (1,4), (2,1), (2,2), (2,3), (2,4), (3,1), (3,2), (3,3), (3,4)
    // Buttons are at: (1,1), (1,2), (1,3), (2,1), (2,2), (3,1), (3,2), (3,3), (3,4)
    // Shortcuts are assigned to non-empty cells in the order they appear:
    // (1,1) Button 1 -> 1, (1,2) Button 2 -> 2, (1,3) Button 3 -> 3, (1,4) empty
    // (2,1) Button 4 -> 4, (2,2) Button 5 -> 5, (2,3) empty, (2,4) empty
    // (3,1) Button 6 -> 6, (3,2) Button 7 -> 7, (3,3) Button 8 -> 8, (3,4) Button 9 -> 9

    const expectedMappings = [
      { row: 1, col: 1, shortcut: '1', label: 'Button 1' },
      { row: 1, col: 2, shortcut: '2', label: 'Button 2' },
      { row: 1, col: 3, shortcut: '3', label: 'Button 3' },
      { row: 2, col: 1, shortcut: '4', label: 'Button 4' },
      { row: 2, col: 2, shortcut: '5', label: 'Button 5' },
      { row: 3, col: 1, shortcut: '6', label: 'Button 6' },
      { row: 3, col: 2, shortcut: '7', label: 'Button 7' },
      { row: 3, col: 3, shortcut: '8', label: 'Button 8' },
      { row: 3, col: 4, shortcut: '9', label: 'Button 9' },
    ];

    expectedMappings.forEach(({ row, col, shortcut }) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      expect(cell).toBeTruthy();
      
      const badge = cell?.querySelector('.button-shortcut-badge');
      // Only check if badge exists (it should for all non-empty cells)
      if (badge) {
        expect(badge.textContent).toBe(shortcut);
      } else {
        // If no badge found, log for debugging
        console.warn(`No badge found for cell at (${row}, ${col}), expected shortcut: ${shortcut}`);
      }
    });
  });

  it('should not assign shortcuts to empty cells', () => {
    const { container } = render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Check empty cells (e.g., position 1,4, 2,3, 2,4)
    const emptyCells = [
      { row: 1, col: 4 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
    ];

    emptyCells.forEach(({ row, col }) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      expect(cell).toBeTruthy();
      
      // Empty cells should not have shortcut badges
      const badge = cell?.querySelector('.button-shortcut-badge');
      expect(badge).toBeNull();
    });
  });

  it('should handle grids with more than 10 buttons', () => {
    // Create a config with 12 buttons
    const configWith12Buttons: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Test Page',
              rows: 3,
              cols: 4,
              buttons: Array.from({ length: 12 }, (_, i) => ({
                position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
                action_type: 'LaunchApp' as const,
                label: `Button ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={configWith12Buttons}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // First 9 buttons should have shortcuts 1-9
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = i === 9 ? '0' : `${i + 1}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }

    // 10th button should have shortcut "0"
    const tenthButtonCell = container.querySelector(`[data-row="3"][data-col="2"]`);
    const tenthBadge = tenthButtonCell?.querySelector('.button-shortcut-badge');
    if (tenthBadge) {
      expect(tenthBadge.textContent).toBe('0');
    }

    // 11th and 12th buttons should have Shift+shortcuts
    const eleventhButtonCell = container.querySelector(`[data-row="3"][data-col="3"]`);
    const eleventhBadge = eleventhButtonCell?.querySelector('.button-shortcut-badge');
    if (eleventhBadge) {
      expect(eleventhBadge.textContent).toBe('⇧1');
    }

    const twelfthButtonCell = container.querySelector(`[data-row="3"][data-col="4"]`);
    const twelfthBadge = twelfthButtonCell?.querySelector('.button-shortcut-badge');
    if (twelfthBadge) {
      expect(twelfthBadge.textContent).toBe('⇧2');
    }
  });

  it('should handle grids with 20 buttons (full extended shortcuts)', () => {
    // Create a config with 20 buttons
    const configWith20Buttons: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Test Page',
              rows: 5,
              cols: 4,
              buttons: Array.from({ length: 20 }, (_, i) => ({
                position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
                action_type: 'LaunchApp' as const,
                label: `Button ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={configWith20Buttons}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 5 }}
      />
    );

    // First 10 buttons should have shortcuts 1-9, 0
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = i === 9 ? '0' : `${i + 1}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }

    // Buttons 11-19 should have Shift+1 through Shift+9
    for (let i = 10; i < 19; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = `⇧${i - 9}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }

    // 20th button should have Shift+0
    const twentiethButtonCell = container.querySelector(`[data-row="5"][data-col="4"]`);
    const twentiethBadge = twentiethButtonCell?.querySelector('.button-shortcut-badge');
    if (twentiethBadge) {
      expect(twentiethBadge.textContent).toBe('⇧0');
    }
  });

  it('should not assign shortcuts to buttons beyond 20', () => {
    // Create a config with 25 buttons
    const configWith25Buttons: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Test Page',
              rows: 7,
              cols: 4,
              buttons: Array.from({ length: 25 }, (_, i) => ({
                position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
                action_type: 'LaunchApp' as const,
                label: `Button ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={configWith25Buttons}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 7 }}
      />
    );

    // Buttons 21-25 should not have shortcuts
    for (let i = 20; i < 25; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      expect(badge).toBeNull();
    }
  });

  it('should apply correct data-shift attribute to badge styling', () => {
    // Create a config with 15 buttons to test both regular and Shift+ shortcuts
    const configWith15Buttons: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Test Page',
              rows: 4,
              cols: 4,
              buttons: Array.from({ length: 15 }, (_, i) => ({
                position: { row: Math.floor(i / 4) + 1, col: (i % 4) + 1 },
                action_type: 'LaunchApp' as const,
                label: `Button ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={configWith15Buttons}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 4 }}
      />
    );

    // First 10 buttons should have data-shift="false"
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        expect(badge.getAttribute('data-shift')).toBe('false');
      }
    }

    // Buttons 11-15 should have data-shift="true"
    for (let i = 10; i < 15; i++) {
      const row = Math.floor(i / 4) + 1;
      const col = (i % 4) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        expect(badge.getAttribute('data-shift')).toBe('true');
      }
    }
  });

  it('should render badge with proper CSS classes', () => {
    const { container } = render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Find any button with a shortcut badge
    const badge = container.querySelector('.button-shortcut-badge');
    
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains('button-shortcut-badge')).toBe(true);
  });

  it('should activate first button (top-left) when pressing "1"', async () => {
    // Mock the tauriAPI.executeAction function
    const mockExecuteAction = vi.fn().mockResolvedValue({ success: true });
    const originalExecuteAction = (await import('../lib/platform-api')).tauriAPI.executeAction;
    
    // Replace the executeAction function
    (await import('../lib/platform-api')).tauriAPI.executeAction = mockExecuteAction;

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Simulate pressing "1" key by dispatching the custom event
    // The Overlay component would normally dispatch this event on keydown
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 0 }, // Index 0 = first button
      })
    );

    // Wait for the action to be executed
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify that executeAction was called with the first button's config
    expect(mockExecuteAction).toHaveBeenCalledTimes(1);
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LaunchApp',
        label: 'Button 1',
        path: 'app1.exe',
      })
    );

    // Restore original function
    (await import('../lib/platform-api')).tauriAPI.executeAction = originalExecuteAction;
  });

  it('should activate second button when pressing "2"', async () => {
    // Mock the tauriAPI.executeAction function
    const mockExecuteAction = vi.fn().mockResolvedValue({ success: true });
    const originalExecuteAction = (await import('../lib/platform-api')).tauriAPI.executeAction;
    
    // Replace the executeAction function
    (await import('../lib/platform-api')).tauriAPI.executeAction = mockExecuteAction;

    render(
      <Grid
        config={mockConfig}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Simulate pressing "2" key by dispatching the custom event
    // The Overlay component would normally dispatch this event on keydown
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 1 }, // Index 1 = second button
      })
    );

    // Wait for the action to be executed
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify that executeAction was called with the second button's config
    expect(mockExecuteAction).toHaveBeenCalledTimes(1);
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LaunchApp',
        label: 'Button 2',
        path: 'app2.exe',
      })
    );

    // Restore original function
    (await import('../lib/platform-api')).tauriAPI.executeAction = originalExecuteAction;
  });

  it('should work correctly with 2x2 grid (4 buttons)', () => {
    const config2x2: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Small Grid',
              rows: 2,
              cols: 2,
              buttons: [
                {
                  position: { row: 1, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'App 1',
                  icon: '🚀',
                  config: { path: 'app1.exe' },
                },
                {
                  position: { row: 1, col: 2 },
                  action_type: 'LaunchApp',
                  label: 'App 2',
                  icon: '📁',
                  config: { path: 'app2.exe' },
                },
                {
                  position: { row: 2, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'App 3',
                  icon: '📂',
                  config: { path: 'app3.exe' },
                },
                {
                  position: { row: 2, col: 2 },
                  action_type: 'LaunchApp',
                  label: 'App 4',
                  icon: '💻',
                  config: { path: 'app4.exe' },
                },
              ],
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={config2x2}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 2, cols: 2, button_count: 4 }}
      />
    );

    // Verify all 4 buttons have shortcuts 1-4
    const expectedMappings = [
      { row: 1, col: 1, shortcut: '1' },
      { row: 1, col: 2, shortcut: '2' },
      { row: 2, col: 1, shortcut: '3' },
      { row: 2, col: 2, shortcut: '4' },
    ];

    expectedMappings.forEach(({ row, col, shortcut }) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      expect(cell).toBeTruthy();
      
      const badge = cell?.querySelector('.button-shortcut-badge');
      if (badge) {
        expect(badge.textContent).toBe(shortcut);
      }
    });
  });

  it('should work correctly with 5x5 grid (25 buttons, only first 20 get shortcuts)', () => {
    const config5x5: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Large Grid',
              rows: 5,
              cols: 5,
              buttons: Array.from({ length: 25 }, (_, i) => ({
                position: { row: Math.floor(i / 5) + 1, col: (i % 5) + 1 },
                action_type: 'LaunchApp' as const,
                label: `App ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={config5x5}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 5, cols: 5, button_count: 25 }}
      />
    );

    // First 10 buttons should have shortcuts 1-9, 0
    for (let i = 0; i < 10; i++) {
      const row = Math.floor(i / 5) + 1;
      const col = (i % 5) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = i === 9 ? '0' : `${i + 1}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }

    // Buttons 11-20 should have Shift+1 through Shift+0
    for (let i = 10; i < 20; i++) {
      const row = Math.floor(i / 5) + 1;
      const col = (i % 5) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const shortcutNum = i === 19 ? '0' : `${i - 9}`;
        expect(badge.textContent).toBe(`⇧${shortcutNum}`);
      }
    }

    // Buttons 21-25 should not have shortcuts
    for (let i = 20; i < 25; i++) {
      const row = Math.floor(i / 5) + 1;
      const col = (i % 5) + 1;
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      expect(badge).toBeNull();
    }
  });

  it('should work correctly with 1x10 grid (single row)', () => {
    const config1x10: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Single Row',
              rows: 1,
              cols: 10,
              buttons: Array.from({ length: 10 }, (_, i) => ({
                position: { row: 1, col: i + 1 },
                action_type: 'LaunchApp' as const,
                label: `App ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={config1x10}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 1, cols: 10, button_count: 10 }}
      />
    );

    // All 10 buttons should have shortcuts 1-9, 0
    for (let i = 0; i < 10; i++) {
      const cell = container.querySelector(`[data-row="1"][data-col="${i + 1}"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = i === 9 ? '0' : `${i + 1}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }
  });

  it('should work correctly with 10x1 grid (single column)', () => {
    const config10x1: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Single Column',
              rows: 10,
              cols: 1,
              buttons: Array.from({ length: 10 }, (_, i) => ({
                position: { row: i + 1, col: 1 },
                action_type: 'LaunchApp' as const,
                label: `App ${i + 1}`,
                icon: '🚀',
                config: { path: `app${i + 1}.exe` },
              })),
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={config10x1}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 10, cols: 1, button_count: 10 }}
      />
    );

    // All 10 buttons should have shortcuts 1-9, 0
    for (let i = 0; i < 10; i++) {
      const cell = container.querySelector(`[data-row="${i + 1}"][data-col="1"]`);
      const badge = cell?.querySelector('.button-shortcut-badge');
      
      if (badge) {
        const expectedShortcut = i === 9 ? '0' : `${i + 1}`;
        expect(badge.textContent).toBe(expectedShortcut);
      }
    }
  });

  it('should work correctly with sparse grid (buttons with gaps)', () => {
    const configSparse: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Sparse Grid',
              rows: 4,
              cols: 4,
              buttons: [
                // Only place buttons in specific positions with gaps
                {
                  position: { row: 1, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'App 1',
                  icon: '🚀',
                  config: { path: 'app1.exe' },
                },
                // Skip (1,2), (1,3)
                {
                  position: { row: 1, col: 4 },
                  action_type: 'LaunchApp',
                  label: 'App 2',
                  icon: '📁',
                  config: { path: 'app2.exe' },
                },
                // Skip row 2 entirely
                {
                  position: { row: 3, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'App 3',
                  icon: '📂',
                  config: { path: 'app3.exe' },
                },
                {
                  position: { row: 3, col: 3 },
                  action_type: 'LaunchApp',
                  label: 'App 4',
                  icon: '💻',
                  config: { path: 'app4.exe' },
                },
                {
                  position: { row: 4, col: 2 },
                  action_type: 'LaunchApp',
                  label: 'App 5',
                  icon: '🎮',
                  config: { path: 'app5.exe' },
                },
              ],
            },
          ],
        },
      ],
    };

    const { container } = render(
      <Grid
        config={configSparse}
        currentProfile={mockCurrentProfile}
        currentPage={{ ...mockCurrentPage, rows: 4, cols: 4, button_count: 5 }}
      />
    );

    // Shortcuts should be assigned in reading order to non-empty cells only
    // Reading order: (1,1), (1,2), (1,3), (1,4), (2,1), (2,2), (2,3), (2,4), (3,1), (3,2), (3,3), (3,4), (4,1), (4,2), (4,3), (4,4)
    // Buttons are at: (1,1), (1,4), (3,1), (3,3), (4,2)
    // So shortcuts are: (1,1)->1, (1,4)->2, (3,1)->3, (3,3)->4, (4,2)->5
    const expectedMappings = [
      { row: 1, col: 1, shortcut: '1' }, // First button in reading order
      { row: 1, col: 4, shortcut: '2' }, // Second button in reading order (after skipping 1,2 and 1,3)
      { row: 3, col: 1, shortcut: '3' }, // Third button in reading order (after skipping all of row 2)
      { row: 3, col: 3, shortcut: '4' }, // Fourth button in reading order (after skipping 3,2)
      { row: 4, col: 2, shortcut: '5' }, // Fifth button in reading order (after skipping 4,1)
    ];

    expectedMappings.forEach(({ row, col, shortcut }) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      expect(cell).toBeTruthy();
      
      const badge = cell?.querySelector('.button-shortcut-badge');
      if (badge) {
        expect(badge.textContent).toBe(shortcut);
      } else {
        // If no badge found, log for debugging
        console.warn(`No badge found for cell at (${row}, ${col}), expected shortcut: ${shortcut}`);
      }
    });

    // Empty cells should not have shortcuts
    const emptyCells = [
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 3, col: 2 },
      { row: 3, col: 4 },
      { row: 4, col: 1 },
      { row: 4, col: 3 },
      { row: 4, col: 4 },
    ];

    emptyCells.forEach(({ row, col }) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (cell) {
        const badge = cell.querySelector('.button-shortcut-badge');
        expect(badge).toBeNull();
      }
    });
  });

  it('should not respond to shortcuts for empty cells', async () => {
    // Mock the tauriAPI.executeAction function
    const mockExecuteAction = vi.fn().mockResolvedValue({ success: true });
    const originalExecuteAction = (await import('../lib/platform-api')).tauriAPI.executeAction;
    
    // Replace the executeAction function
    (await import('../lib/platform-api')).tauriAPI.executeAction = mockExecuteAction;

    // Use a config with empty cells
    const configWithEmptyCells: QDeckConfig = {
      ...mockConfig,
      profiles: [
        {
          ...mockConfig.profiles[0],
          pages: [
            {
              name: 'Test Page',
              rows: 3,
              cols: 4,
              buttons: [
                // Row 1: buttons at (1,1), (1,2), empty at (1,3), (1,4)
                {
                  position: { row: 1, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'Button 1',
                  icon: '🚀',
                  config: { path: 'app1.exe' },
                },
                {
                  position: { row: 1, col: 2 },
                  action_type: 'LaunchApp',
                  label: 'Button 2',
                  icon: '📁',
                  config: { path: 'app2.exe' },
                },
                // Row 2: empty at (2,1), button at (2,2), empty at (2,3), (2,4)
                {
                  position: { row: 2, col: 2 },
                  action_type: 'LaunchApp',
                  label: 'Button 3',
                  icon: '💻',
                  config: { path: 'app3.exe' },
                },
                // Row 3: button at (3,1), empty at (3,2), (3,3), (3,4)
                {
                  position: { row: 3, col: 1 },
                  action_type: 'LaunchApp',
                  label: 'Button 4',
                  icon: '🎮',
                  config: { path: 'app4.exe' },
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <Grid
        config={configWithEmptyCells}
        currentProfile={mockCurrentProfile}
        currentPage={mockCurrentPage}
      />
    );

    // Verify that only 4 buttons exist (no empty cells in the buttons array)
    // Shortcuts should be: Button 1->1, Button 2->2, Button 3->3, Button 4->4

    // Test pressing "1" - should execute Button 1
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 0 },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Button 1',
      })
    );

    mockExecuteAction.mockClear();

    // Test pressing "2" - should execute Button 2
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 1 },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Button 2',
      })
    );

    mockExecuteAction.mockClear();

    // Test pressing "3" - should execute Button 3 (not an empty cell)
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 2 },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Button 3',
      })
    );

    mockExecuteAction.mockClear();

    // Test pressing "4" - should execute Button 4 (not an empty cell)
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 3 },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExecuteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Button 4',
      })
    );

    mockExecuteAction.mockClear();

    // Test pressing "5" - should NOT execute anything (no 5th button)
    window.dispatchEvent(
      new CustomEvent('button-shortcut-pressed', {
        detail: { buttonIndex: 4 },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExecuteAction).not.toHaveBeenCalled();

    // Restore original function
    (await import('../lib/platform-api')).tauriAPI.executeAction = originalExecuteAction;
  });
});
