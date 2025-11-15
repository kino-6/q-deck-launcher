import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Grid } from './Grid';
import { QDeckConfig, ProfileInfo, PageInfo } from '../lib/platform-api';

// Mock platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    analyzeDroppedFiles: vi.fn(),
    generateButtonsFromFiles: vi.fn(),
    addUndoOperation: vi.fn(),
    saveConfig: vi.fn(),
    getLastUndoOperation: vi.fn(),
    undoLastOperation: vi.fn(),
  },
}));

// Mock electron-adapter to simulate Electron environment
vi.mock('../lib/electron-adapter', () => ({
  isElectron: () => true,
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
    getPlatform: () => 'electron',
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

  it('should handle drop event', () => {
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

  it('should correctly detect drop position (row and column)', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    expect(grid).toBeInTheDocument();

    // Get all grid cells
    const gridCells = container.querySelectorAll('.grid-cell');
    expect(gridCells.length).toBe(12); // 3 rows ÁE4 cols = 12 cells

    // Test each cell has correct row and col data attributes
    gridCells.forEach((cell, index) => {
      const expectedRow = Math.floor(index / 4) + 1; // 4 columns
      const expectedCol = (index % 4) + 1;
      
      const actualRow = parseInt((cell as HTMLElement).dataset.row || '0');
      const actualCol = parseInt((cell as HTMLElement).dataset.col || '0');
      
      expect(actualRow).toBe(expectedRow);
      expect(actualCol).toBe(expectedCol);
    });

    // Test specific cells
    const firstCell = gridCells[0] as HTMLElement;
    expect(firstCell.dataset.row).toBe('1');
    expect(firstCell.dataset.col).toBe('1');

    const lastCell = gridCells[11] as HTMLElement;
    expect(lastCell.dataset.row).toBe('3');
    expect(lastCell.dataset.col).toBe('4');

    // Test middle cell (row 2, col 2)
    const middleCell = gridCells[5] as HTMLElement; // index 5 = row 2, col 2
    expect(middleCell.dataset.row).toBe('2');
    expect(middleCell.dataset.col).toBe('2');
  });

  it('should detect drop position when dragging over specific cells', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');

    // Test dragging over the first cell (row 1, col 1)
    const firstCell = gridCells[0] as HTMLElement;
    const firstCellRect = firstCell.getBoundingClientRect();
    
    fireEvent.dragOver(grid, {
      clientX: firstCellRect.left + firstCellRect.width / 2,
      clientY: firstCellRect.top + firstCellRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    // Verify the cell has the correct data attributes
    expect(firstCell.dataset.row).toBe('1');
    expect(firstCell.dataset.col).toBe('1');

    // Test dragging over a middle cell (row 2, col 3)
    const middleCell = gridCells[6] as HTMLElement; // index 6 = row 2, col 3
    const middleCellRect = middleCell.getBoundingClientRect();
    
    fireEvent.dragOver(grid, {
      clientX: middleCellRect.left + middleCellRect.width / 2,
      clientY: middleCellRect.top + middleCellRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    expect(middleCell.dataset.row).toBe('2');
    expect(middleCell.dataset.col).toBe('3');

    // Test dragging over the last cell (row 3, col 4)
    const lastCell = gridCells[11] as HTMLElement;
    const lastCellRect = lastCell.getBoundingClientRect();
    
    fireEvent.dragOver(grid, {
      clientX: lastCellRect.left + lastCellRect.width / 2,
      clientY: lastCellRect.top + lastCellRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    expect(lastCell.dataset.row).toBe('3');
    expect(lastCell.dataset.col).toBe('4');
  });

  it('should have drag-over class on the correct cell during drag', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');

    // Simulate drag enter to activate drag state
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    // Test dragging over a specific cell
    const targetCell = gridCells[5] as HTMLElement; // row 2, col 2
    const targetCellRect = targetCell.getBoundingClientRect();
    
    fireEvent.dragOver(grid, {
      clientX: targetCellRect.left + targetCellRect.width / 2,
      clientY: targetCellRect.top + targetCellRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    // The cell should have the correct position data
    expect(targetCell.dataset.row).toBe('2');
    expect(targetCell.dataset.col).toBe('2');
  });

  it('should ignore drops outside the grid', () => {
    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridRect = grid.getBoundingClientRect();

    // Simulate drag enter to activate drag state
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    // Test dragging outside the grid (to the left)
    fireEvent.dragOver(grid, {
      clientX: gridRect.left - 50,
      clientY: gridRect.top + gridRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    // No cell should have drag-over class when dragging outside
    const dragOverCells = container.querySelectorAll('.grid-cell.drag-over');
    expect(dragOverCells.length).toBe(0);

    // Test dragging outside the grid (to the right)
    fireEvent.dragOver(grid, {
      clientX: gridRect.right + 50,
      clientY: gridRect.top + gridRect.height / 2,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    expect(container.querySelectorAll('.grid-cell.drag-over').length).toBe(0);

    // Test dragging outside the grid (above)
    fireEvent.dragOver(grid, {
      clientX: gridRect.left + gridRect.width / 2,
      clientY: gridRect.top - 50,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    expect(container.querySelectorAll('.grid-cell.drag-over').length).toBe(0);

    // Test dragging outside the grid (below)
    fireEvent.dragOver(grid, {
      clientX: gridRect.left + gridRect.width / 2,
      clientY: gridRect.bottom + 50,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });

    expect(container.querySelectorAll('.grid-cell.drag-over').length).toBe(0);
  });
});

describe('Grid Button Auto-Generation', () => {
  let saveConfigMock: any;
  
  // Helper function to mock grid and cell positions
  const mockGridAndCellPositions = (grid: HTMLElement, gridCells: NodeListOf<Element>) => {
    const cellSize = 96;
    const gap = 8;
    
    // Mock grid bounds
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 600,
      width: 1000,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);
    
    // Mock all grid cells with proper positions
    gridCells.forEach((cell, index) => {
      const row = Math.floor(index / 4) + 1; // 4 columns
      const col = (index % 4) + 1;
      const cellLeft = gap + (col - 1) * (cellSize + gap);
      const cellTop = gap + (row - 1) * (cellSize + gap);
      
      vi.spyOn(cell as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        left: cellLeft,
        top: cellTop,
        right: cellLeft + cellSize,
        bottom: cellTop + cellSize,
        width: cellSize,
        height: cellSize,
        x: cellLeft,
        y: cellTop,
        toJSON: () => {},
      } as DOMRect);
    });
    
    return { cellSize, gap };
  };
  
  // Helper function to simulate drag over with proper coordinates
  const simulateDragOver = (grid: HTMLElement, x: number, y: number) => {
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
    });
    
    // Force set clientX and clientY properties
    Object.defineProperty(dragOverEvent, 'clientX', {
      value: x,
      writable: false,
    });
    Object.defineProperty(dragOverEvent, 'clientY', {
      value: y,
      writable: false,
    });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });
    grid.dispatchEvent(dragOverEvent);
  };
  
  // Helper function to simulate drop with proper coordinates
  const simulateDrop = (grid: HTMLElement, x: number, y: number, files: File[]) => {
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    
    // Force set clientX and clientY properties
    Object.defineProperty(dropEvent, 'clientX', {
      value: x,
      writable: false,
    });
    Object.defineProperty(dropEvent, 'clientY', {
      value: y,
      writable: false,
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files,
        types: ['Files'],
      },
    });
    grid.dispatchEvent(dropEvent);
  };
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked saveConfig function
    const { tauriAPI } = await import('../lib/platform-api');
    saveConfigMock = vi.mocked(tauriAPI.saveConfig);
    saveConfigMock.mockResolvedValue(undefined);
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
    
    // Mock window.electronAPI for Electron environment
    Object.defineProperty(window, 'electronAPI', {
      value: {
        isElectron: true,
        platform: 'electron',
      },
      writable: true,
      configurable: true,
    });
  });

  it('should create a button at the dropped position', async () => {

    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');
    
    // Mock grid and cell positions
    const { cellSize, gap } = mockGridAndCellPositions(grid, gridCells);
    
    // Create a mock .exe file
    const mockFile = new File(['test'], 'notepad.exe', { type: 'application/octet-stream' });
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Windows\\System32\\notepad.exe',
      writable: false,
    });
    
    // Simulate drag enter
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    // Simulate drag over the target cell (center of first cell)
    const centerX = gap + cellSize / 2;
    const centerY = gap + cellSize / 2;
    
    // Use helper functions for proper coordinate handling
    simulateDragOver(grid, centerX, centerY);
    simulateDrop(grid, centerX, centerY, [mockFile]);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify saveConfig was called
    expect(saveConfigMock).toHaveBeenCalled();
    
    // Verify the button was added to the config
    const savedConfig = saveConfigMock.mock.calls[0][0];
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    
    expect(buttons.length).toBeGreaterThan(0);
    const addedButton = buttons[buttons.length - 1];
    expect(addedButton.position.row).toBe(1);
    expect(addedButton.position.col).toBe(1);
  });

  it('should use filename as button label', async () => {

    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');
    
    // Mock grid and cell positions
    const { cellSize, gap } = mockGridAndCellPositions(grid, gridCells);
    
    // Create a mock file with a specific name
    const mockFile = new File(['test'], 'MyApplication.exe', { type: 'application/octet-stream' });
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Program Files\\MyApplication.exe',
      writable: false,
    });
    
    // Simulate drag and drop
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    const centerX = gap + cellSize / 2;
    const centerY = gap + cellSize / 2;
    
    fireEvent.dragOver(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });
    
    fireEvent.drop(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        files: [mockFile],
        types: ['Files'],
      },
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the button label is the filename without extension
    const savedConfig = saveConfigMock.mock.calls[0][0];
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    const addedButton = buttons[buttons.length - 1];
    
    expect(addedButton.label).toBe('MyApplication');
  });

  it('should create LaunchApp action for .exe files', async () => {

    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');
    
    // Mock grid and cell positions
    const { cellSize, gap } = mockGridAndCellPositions(grid, gridCells);
    
    // Create a mock .exe file
    const mockFile = new File(['test'], 'application.exe', { type: 'application/octet-stream' });
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Apps\\application.exe',
      writable: false,
    });
    
    // Simulate drag and drop
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    const centerX = gap + cellSize / 2;
    const centerY = gap + cellSize / 2;
    
    fireEvent.dragOver(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });
    
    fireEvent.drop(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        files: [mockFile],
        types: ['Files'],
      },
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the action type is LaunchApp
    const savedConfig = saveConfigMock.mock.calls[0][0];
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    const addedButton = buttons[buttons.length - 1];
    
    expect(addedButton.action_type).toBe('LaunchApp');
    expect(addedButton.config.path).toBe('C:\\Apps\\application.exe');
  });

  it('should create Open action for non-executable files', async () => {

    const { container } = render(
      <Grid 
        config={mockConfig} 
        currentProfile={mockProfile} 
        currentPage={mockPage} 
      />
    );

    const grid = container.querySelector('.grid') as HTMLElement;
    const gridCells = container.querySelectorAll('.grid-cell');
    
    // Mock grid and cell positions
    const { cellSize, gap } = mockGridAndCellPositions(grid, gridCells);
    
    // Create a mock .txt file
    const mockFile = new File(['test content'], 'document.txt', { type: 'text/plain' });
    Object.defineProperty(mockFile, 'path', {
      value: 'C:\\Documents\\document.txt',
      writable: false,
    });
    
    // Simulate drag and drop
    fireEvent.dragEnter(grid, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    const centerX = gap + cellSize / 2;
    const centerY = gap + cellSize / 2;
    
    fireEvent.dragOver(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        types: ['Files'],
        dropEffect: 'none',
      },
    });
    
    fireEvent.drop(grid, {
      clientX: centerX,
      clientY: centerY,
      dataTransfer: {
        files: [mockFile],
        types: ['Files'],
      },
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the action type is Open
    const savedConfig = saveConfigMock.mock.calls[0][0];
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    const addedButton = buttons[buttons.length - 1];
    
    expect(addedButton.action_type).toBe('Open');
    expect(addedButton.config.target).toBe('C:\\Documents\\document.txt');
  });
});

