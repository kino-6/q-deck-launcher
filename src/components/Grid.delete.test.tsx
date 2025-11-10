import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Grid from './Grid';
import { mockConfig, mockProfile, mockPage } from '../test/mockData';
import type { QDeckConfig } from '../lib/platform-api';

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

// Mock ContextMenu component with delete functionality
vi.mock('./ContextMenu', () => ({
  default: ({ isVisible, onClose, onDelete, buttonLabel, menuType }: any) => 
    isVisible ? (
      <div data-testid="context-menu">
        <div data-testid="context-menu-label">{buttonLabel || ''}</div>
        <div data-testid="context-menu-type">{menuType || ''}</div>
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

describe('Grid - Button Deletion', () => {
  const defaultProps = {
    config: mockConfig,
    currentProfile: mockProfile,
    currentPage: mockPage,
  };

  let reloadSpy: any;
  let mockSaveConfig: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked saveConfig function
    const { tauriAPI } = await import('../lib/platform-api');
    mockSaveConfig = vi.mocked(tauriAPI.saveConfig);
    mockSaveConfig.mockResolvedValue(undefined);
    
    // Mock window.location.reload
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadSpy },
    });
    
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

    // Mock alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show context menu when right-clicking a button', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    expect(screen.getByTestId('context-menu-label')).toHaveTextContent('Test App');
  });

  it('should show delete button in context menu for button actions', async () => {
    render(<Grid {...defaultProps} />);

    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('delete-button')).toHaveTextContent('削除');
  });

  it('should delete button when delete menu item is clicked', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify saveConfig was called
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });
  });

  it('should save configuration after deleting a button', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify saveConfig was called with updated config
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledTimes(1);
    });

    const savedConfig = mockSaveConfig.mock.calls[0][0] as QDeckConfig;
    
    // Verify the button was removed from the config
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    const deletedButton = buttons.find(btn => 
      btn.label === 'Test App' && 
      btn.position.row === 1 && 
      btn.position.col === 1
    );
    
    expect(deletedButton).toBeUndefined();
  });

  it('should reload page after successful deletion', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Wait for save to complete
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });

    // Wait for reload to be called (with timeout)
    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should close context menu after deletion', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Context menu should close immediately
    expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
  });

  it('should handle deletion errors gracefully', async () => {
    // Get the mocked saveConfig function and make it fail
    const { tauriAPI } = await import('../lib/platform-api');
    const saveConfigMock = vi.mocked(tauriAPI.saveConfig);
    saveConfigMock.mockRejectedValueOnce(new Error('Save failed'));

    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Wait for error handling
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });

    // Verify alert was shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to save configuration'));
    });

    // Page should not reload on error
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('should preserve other buttons when deleting one button', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu for first button
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify saveConfig was called
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });

    const savedConfig = mockSaveConfig.mock.calls[0][0] as QDeckConfig;
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    
    // Verify other button still exists
    const otherButton = buttons.find(btn => btn.label === 'Test Folder');
    expect(otherButton).toBeDefined();
    
    // Verify deleted button is gone
    const deletedButton = buttons.find(btn => btn.label === 'Test App');
    expect(deletedButton).toBeUndefined();
  });

  it('should delete button from correct position', async () => {
    render(<Grid {...defaultProps} />);

    // Open context menu
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Verify saveConfig was called
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled();
    });

    const savedConfig = mockSaveConfig.mock.calls[0][0] as QDeckConfig;
    const buttons = savedConfig.profiles[0].pages[0].buttons;
    
    // Verify no button exists at position (1, 1)
    const buttonAtPosition = buttons.find(btn => 
      btn.position.row === 1 && btn.position.col === 1
    );
    expect(buttonAtPosition).toBeUndefined();
  });

  it('should update configuration file with correct structure after deletion', async () => {
    render(<Grid {...defaultProps} />);

    // Verify initial state - should have 2 buttons
    expect(mockConfig.profiles[0].pages[0].buttons).toHaveLength(2);

    // Open context menu for Test App button
    const button = screen.getByTestId('action-button-Test App');
    fireEvent.contextMenu(button);

    await waitFor(() => {
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByTestId('delete-button'));

    // Wait for saveConfig to be called
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledTimes(1);
    });

    // Get the saved configuration
    const savedConfig = mockSaveConfig.mock.calls[0][0] as QDeckConfig;

    // Verify the configuration structure is intact
    expect(savedConfig).toHaveProperty('version');
    expect(savedConfig).toHaveProperty('ui');
    expect(savedConfig).toHaveProperty('profiles');
    expect(savedConfig.profiles).toHaveLength(1);
    expect(savedConfig.profiles[0].pages).toHaveLength(1);

    // Verify the button array is updated correctly
    const updatedButtons = savedConfig.profiles[0].pages[0].buttons;
    expect(updatedButtons).toHaveLength(1); // Should have 1 button left (Test Folder)

    // Verify the deleted button (Test App at position 1,1) is not in the config
    const deletedButton = updatedButtons.find(btn => 
      btn.label === 'Test App' && 
      btn.position.row === 1 && 
      btn.position.col === 1
    );
    expect(deletedButton).toBeUndefined();

    // Verify the remaining button (Test Folder at position 1,2) is still present
    const remainingButton = updatedButtons.find(btn => 
      btn.label === 'Test Folder' && 
      btn.position.row === 1 && 
      btn.position.col === 2
    );
    expect(remainingButton).toBeDefined();
    expect(remainingButton?.action_type).toBe('Open');
    expect(remainingButton?.icon).toBe('📁');

    // Verify other configuration properties are preserved
    expect(savedConfig.ui.window.theme).toBe(mockConfig.ui.window.theme);
    expect(savedConfig.profiles[0].pages[0].rows).toBe(mockConfig.profiles[0].pages[0].rows);
    expect(savedConfig.profiles[0].pages[0].cols).toBe(mockConfig.profiles[0].pages[0].cols);
  });
});
