import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Grid } from './Grid';
import { QDeckConfig, ProfileInfo, PageInfo } from '../lib/platform-api';

// Mock Tauri API
vi.mock('../lib/tauri', () => ({
  tauriAPI: {
    analyzeDroppedFiles: vi.fn(),
    generateButtonsFromFiles: vi.fn(),
    addUndoOperation: vi.fn(),
    saveConfig: vi.fn(),
    getLastUndoOperation: vi.fn(),
    undoLastOperation: vi.fn(),
  },
}));

const mockConfig: QDeckConfig = {
  version: '1.0',
  ui: {
    summon: {
      hotkeys: ['F11'],
      edge_trigger: {
        enabled: false,
        edges: ['top'],
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
      hotkey: undefined,
      pages: [
        {
          name: 'Test Page',
          rows: 3,
          cols: 4,
          buttons: [],
        },
      ],
    },
  ],
};

const mockProfile: ProfileInfo = {
  name: 'Test Profile',
  index: 0,
  page_count: 1,
  current_page_index: 0,
  hotkey: undefined,
};

const mockPage: PageInfo = {
  name: 'Test Page',
  index: 0,
  rows: 3,
  cols: 4,
  button_count: 0,
};

describe('Grid Drag and Drop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render grid with drag and drop capabilities', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid');
  });

  it('should handle drag enter event', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    
    // Simulate drag enter
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });
    
    // Grid should still be present and functional
    expect(grid).toBeInTheDocument();
  });

  it('should handle drag over event', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    
    // Simulate drag over
    fireEvent.dragOver(grid, {
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });
    
    // Grid should handle the event
    expect(grid).toBeInTheDocument();
  });

  it('should handle drag leave event', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    
    // Simulate drag leave
    fireEvent.dragLeave(grid);
    
    // Grid should still be functional
    expect(grid).toBeInTheDocument();
  });

  it('should have empty cells that can receive drops', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const emptyCells = container.querySelectorAll('.empty-cell');
    expect(emptyCells.length).toBeGreaterThan(0);
    
    // Each empty cell should be present
    emptyCells.forEach(cell => {
      expect(cell).toBeInTheDocument();
    });
  });

  it('should handle drop event', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    // Mock successful API responses
    (tauriAPI.analyzeDroppedFiles as any).mockResolvedValue([]);
    (tauriAPI.generateButtonsFromFiles as any).mockResolvedValue({
      generated_buttons: [],
      placement_positions: [],
      conflicts: [],
      errors: [],
    });

    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    
    // Create a mock file
    const mockFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
    
    // Simulate drop event
    fireEvent.drop(grid, {
      dataTransfer: {
        files: [mockFile],
        types: ['Files'],
      },
    });
    
    // Grid should handle the drop
    expect(grid).toBeInTheDocument();
  });
});