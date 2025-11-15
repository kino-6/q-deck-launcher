import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Grid from './Grid';
import { mockConfig, mockProfile, mockPage } from '../test/mockData';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ActionButton component
vi.mock('./ActionButton', () => ({
  default: ({ button, onContextMenu }: any) => (
    <button 
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, button);
      }}
      data-testid={`action-button-${button.label}`}
    >
      {button.label}
    </button>
  ),
}));

// Mock ContextMenu component
vi.mock('./ContextMenu', () => ({
  default: ({ isVisible, onClose, onDelete, buttonLabel, menuType, x, y }: any) => 
    isVisible ? (
      <div 
        data-testid="context-menu"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <div data-testid="context-menu-label">{buttonLabel || ''}</div>
        <div data-testid="context-menu-type">{menuType || ''}</div>
        <div data-testid="context-menu-position">{`${x},${y}`}</div>
        {onDelete && menuType === 'button' && (
          <button 
            data-testid="delete-button" 
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            削除
          </button>
        )}
        <button data-testid="close-button" onClick={onClose}>Close</button>
      </div>
    ) : null,
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

// Mock platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    saveConfig: vi.fn(),
    getConfig: vi.fn(),
    executeAction: vi.fn(),
    processIcon: vi.fn().mockResolvedValue({
      path: '🚀',
      icon_type: 'Emoji',
    }),
  },
}));

describe('Grid - Context Menu Display on Right Click', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display context menu when right-clicking a button', async () => {
    render(<Grid {...defaultProps} />);

    // Find the button
    const button = screen.getByTestId('action-button-Test App');
    expect(button).toBeInTheDocument();

    // Right-click the button
    fireEvent.contextMenu(button);

    // Verify context menu is displayed
    await waitFor(() => {
      const contextMenu = screen.getByTestId('context-menu');
      expect(contextMenu).toBeInTheDocument();
    });
  });

  it('should display context menu with correct button label', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu-label')).toHaveTextContent('Test App');
    });
  });

  it('should display context menu with button type', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu-type')).toHaveTextContent('button');
    });
  });

  it('should display context menu at cursor position', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    
    // Right-click at specific coordinates
    fireEvent.contextMenu(button, {
      clientX: 150,
      clientY: 250,
    });

    await waitFor(() => {
      const contextMenu = screen.getByTestId('context-menu');
      expect(contextMenu).toHaveStyle({
        left: '150px',
        top: '250px',
      });
    });
  });

  it('should display delete button in context menu for button actions', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  it('should close context menu when close button is clicked', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    // Click close button
    fireEvent.click(screen.getByTestId('close-button'));

    // Context menu should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });
  });

  it('should display context menu for different buttons', async () => {
    render(<Grid {...defaultProps} />);

    // Right-click first button
    const button1 = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button1);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu-label')).toHaveTextContent('Test App');
    });

    // Close the menu
    fireEvent.click(screen.getByTestId('close-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });

    // Right-click second button
    const button2 = screen.getByTestId('action-button-Test Folder');
    fireEvent.contextMenu(button2);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu-label')).toHaveTextContent('Test Folder');
    });
  });

  it('should only display one context menu at a time', async () => {
    render(<Grid {...defaultProps} />);

    // Right-click first button
    const button1 = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button1);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    // Right-click second button without closing first menu
    const button2 = screen.getByTestId('action-button-Test Folder');
    fireEvent.contextMenu(button2);

    // Should still only have one context menu
    await waitFor(() => {
      const menus = screen.getAllByTestId('context-menu');
      expect(menus).toHaveLength(1);
      expect(screen.getByTestId('context-menu-label')).toHaveTextContent('Test Folder');
    });
  });

  it('should prevent default context menu behavior', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    
    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100,
    });

    const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault');
    
    button.dispatchEvent(contextMenuEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should display context menu immediately on right-click', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    
    const startTime = Date.now();
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });
    
    const endTime = Date.now();
    const displayTime = endTime - startTime;

    // Context menu should appear within 100ms
    expect(displayTime).toBeLessThan(100);
  });
});
