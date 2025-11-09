import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Grid from './Grid';
import { mockConfig, mockProfile, mockPage } from '../test/mockData';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ActionButton component
vi.mock('./ActionButton', () => ({
  default: ({ button, onContextMenu }: any) => (
    <button 
      onContextMenu={(e) => onContextMenu?.(e, button)}
      data-testid={`action-button-${button.label}`}
    >
      {button.label}
    </button>
  ),
}));

// Mock ContextMenu component
vi.mock('./ContextMenu', () => ({
  default: ({ isVisible, onClose }: any) => 
    isVisible ? <div data-testid="context-menu" onClick={onClose}>Context Menu</div> : null,
}));

// Mock ThemeSelector component
vi.mock('./ThemeSelector', () => ({
  default: ({ isVisible, onClose }: any) => 
    isVisible ? <div data-testid="theme-selector" onClick={onClose}>Theme Selector</div> : null,
}));

// Mock GridDragDrop component
vi.mock('./GridDragDrop', () => ({
  default: ({ children }: any) => children({
    dragState: {
      isDragging: false,
      isProcessing: false,
      dragOverPosition: null,
    },
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
  }),
}));

describe('Grid', () => {
  const defaultProps = {
    config: mockConfig,
    currentProfile: mockProfile,
    currentPage: mockPage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window properties
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });
    
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
      },
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders grid with buttons from config', () => {
    render(<Grid {...defaultProps} />);

    expect(screen.getByTestId('action-button-Test App')).toBeInTheDocument();
    expect(screen.getByTestId('action-button-Test Folder')).toBeInTheDocument();
  });

  it('renders placeholder when no config provided', () => {
    render(<Grid />);

    expect(screen.getByText('No profiles configured')).toBeInTheDocument();
  });

  it('renders placeholder when no profiles in config', () => {
    const emptyConfig = { ...mockConfig, profiles: [] };
    render(<Grid config={emptyConfig} currentProfile={mockProfile} currentPage={mockPage} />);

    expect(screen.getByText('No profiles configured')).toBeInTheDocument();
  });

  it('renders placeholder when no pages in profile', () => {
    const configWithoutPages = {
      ...mockConfig,
      profiles: [{ ...mockConfig.profiles[0], pages: [] }],
    };
    render(<Grid config={configWithoutPages} currentProfile={mockProfile} currentPage={undefined} />);

    expect(screen.getByText('No pages configured')).toBeInTheDocument();
  });

  it('creates correct grid layout', () => {
    render(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    
    // Check grid cells are created
    const gridCells = document.querySelectorAll('.grid-cell');
    expect(gridCells.length).toBe(mockPage.rows * mockPage.cols);
  });

  it('handles context menu on buttons', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });
  });

  it('handles context menu on empty cells', async () => {
    render(<Grid {...defaultProps} />);

    const emptyCells = document.querySelectorAll('.empty-cell');
    if (emptyCells.length > 0) {
      fireEvent.contextMenu(emptyCells[0]);

      await waitFor(() => {
        expect(screen.getByTestId('context-menu')).toBeInTheDocument();
      });
    }
  });

  it('handles context menu on grid background', async () => {
    render(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    fireEvent.contextMenu(grid!);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });
  });

  it('closes context menu when clicked', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('context-menu'));

    await waitFor(() => {
      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });
  });

  it('calculates optimal cell size based on viewport', () => {
    render(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    
    // Check that CSS custom properties are set
    const style = grid?.getAttribute('style');
    expect(style).toContain('--cell-size');
    expect(style).toContain('--gap-size');
  });

  it('handles DPI scale changes', () => {
    // Mock high DPI
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });

    render(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    
    const style = grid?.getAttribute('style');
    expect(style).toContain('--dpi-scale');
  });

  it('handles screen orientation changes', () => {
    const { rerender } = render(<Grid {...defaultProps} />);

    // Simulate orientation change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1080,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    rerender(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders empty cells for positions without buttons', () => {
    render(<Grid {...defaultProps} />);

    const emptyCells = document.querySelectorAll('.empty-cell');
    expect(emptyCells.length).toBeGreaterThan(0);
  });

  it('applies correct grid styling', () => {
    render(<Grid {...defaultProps} />);

    const grid = document.querySelector('.grid');
    const style = grid?.getAttribute('style');
    
    expect(style).toContain(`--grid-rows: ${mockPage.rows}`);
    expect(style).toContain(`--grid-cols: ${mockPage.cols}`);
  });

  it('should render buttons correctly', async () => {
    render(<Grid {...defaultProps} />);

    // Wait for the grid to be rendered
    await waitFor(() => {
      expect(document.querySelector('.grid')).toBeInTheDocument();
    });

    // Verify that buttons are rendered with correct labels
    expect(screen.getByTestId('action-button-Test App')).toBeInTheDocument();
    expect(screen.getByTestId('action-button-Test Folder')).toBeInTheDocument();

    // Verify button count matches config
    const buttons = screen.getAllByRole('button');
    const actionButtons = buttons.filter(btn => 
      btn.getAttribute('data-testid')?.startsWith('action-button-')
    );
    expect(actionButtons.length).toBe(mockConfig.profiles[0].pages[0].buttons.length);

    // Verify buttons are in correct positions
    const testAppButton = screen.getByTestId('action-button-Test App');
    expect(testAppButton).toHaveTextContent('Test App');
    
    const testFolderButton = screen.getByTestId('action-button-Test Folder');
    expect(testFolderButton).toHaveTextContent('Test Folder');
  });
});