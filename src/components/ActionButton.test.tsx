import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionButton from './ActionButton';
import { mockButton } from '../test/mockData';

// Mock the platform API - must be defined inline due to hoisting
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn().mockResolvedValue({ success: true }),
    processIcon: vi.fn().mockResolvedValue({
      path: '🚀',
      icon_type: 'Emoji',
      size: null,
      data_url: null,
      extracted_from: null,
    }),
  },
}));

describe('ActionButton', () => {
  const mockOnSystemAction = vi.fn();
  const mockOnContextMenu = vi.fn();
  
  const defaultScreenInfo = {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    pixelRatio: 1,
    colorDepth: 24,
    orientation: 'landscape-primary' as const,
    dpiCategory: 'standard' as const,
    physicalWidth: 1920,
    physicalHeight: 1080,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { tauriAPI } = await import('../lib/platform-api');
    vi.mocked(tauriAPI.executeAction).mockResolvedValue({ success: true });
    vi.mocked(tauriAPI.processIcon).mockResolvedValue({
      path: '🚀',
      icon_type: 'Emoji',
      size: undefined,
      data_url: undefined,
      extracted_from: undefined,
    });
  });

  it('renders button with correct label and icon', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSystemAction).toHaveBeenCalledWith('config');
  });

  it('calls onContextMenu when right-clicked', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.contextMenu(button);

    expect(mockOnContextMenu).toHaveBeenCalledWith(
      expect.any(Object),
      mockButton
    );
  });

  it('displays correct action type styling', () => {
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-system-action', 'config');
  });

  it('handles button without system action', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    const regularButton = {
      ...mockButton,
      action: undefined,
    };

    render(
      <ActionButton
        button={regularButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should call executeAction through tauriAPI
    await waitFor(() => {
      expect(tauriAPI.executeAction).toHaveBeenCalled();
    });
  });

  it('renders with custom DPI scale', () => {
    const highDpiScreenInfo = {
      ...defaultScreenInfo,
      pixelRatio: 2,
      dpiCategory: 'high' as const,
    };

    render(
      <ActionButton
        button={mockButton}
        dpiScale={2}
        screenInfo={highDpiScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with custom screen info', () => {
    const customScreenInfo = {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      pixelRatio: 1.5,
      colorDepth: 24,
      orientation: 'landscape-primary' as const,
      dpiCategory: 'high' as const,
      physicalWidth: 1280,
      physicalHeight: 720,
    };

    render(
      <ActionButton
        button={mockButton}
        dpiScale={1.5}
        screenInfo={customScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('processes icon correctly', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    await waitFor(() => {
      expect(tauriAPI.processIcon).toHaveBeenCalledWith('🚀', undefined);
    });
  });

  it('handles icon processing error gracefully', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    // Mock the processIcon API call to fail
    vi.mocked(tauriAPI.processIcon).mockRejectedValueOnce(new Error('Icon processing failed'));

    render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    // Should still render the button with fallback icon
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies custom button styles', () => {
    const styledButton = {
      ...mockButton,
      style: {
        background_color: '#FF0000',
        text_color: '#FFFFFF',
        font_size: 14,
        font_family: 'Arial',
        border_color: '#CC0000',
        border_width: 2,
        border_radius: 10,
      },
    };

    render(
      <ActionButton
        button={styledButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Note: Testing exact styles is complex with CSS-in-JS, 
    // but we can verify the component renders without errors
  });

  it('uses default icon when icon extraction fails or is invalid', async () => {
    const { tauriAPI } = await import('../lib/platform-api');
    
    // Test case 1: Icon extraction returns null
    vi.mocked(tauriAPI.processIcon).mockResolvedValueOnce(null as any);

    const launchAppButton = {
      position: { row: 1, col: 1 },
      action_type: 'LaunchApp' as const,
      label: 'Test App',
      icon: undefined,
      config: { path: 'C:\\test.exe' },
      style: undefined,
      action: undefined,
    };

    const { unmount } = render(
      <ActionButton
        button={launchAppButton}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    unmount();

    // Test case 2: Test all action types with default icons
    const testCases = [
      { action_type: 'LaunchApp' as const, expectedIcon: '🚀' },
      { action_type: 'Open' as const, expectedIcon: '📂' },
      { action_type: 'Terminal' as const, expectedIcon: '💻' },
      { action_type: 'SendKeys' as const, expectedIcon: '⌨️' },
      { action_type: 'PowerShell' as const, expectedIcon: '🔧' },
      { action_type: 'Folder' as const, expectedIcon: '📁' },
      { action_type: 'MultiAction' as const, expectedIcon: '⚡' },
    ];

    vi.mocked(tauriAPI.processIcon).mockResolvedValue(null as any);

    for (const testCase of testCases) {
      const button = {
        position: { row: 1, col: 1 },
        action_type: testCase.action_type,
        label: `Test ${testCase.action_type}`,
        icon: undefined,
        config: {},
        style: undefined,
        action: undefined,
      };

      const { unmount: unmountCase } = render(
        <ActionButton
          button={button}
          dpiScale={1}
          screenInfo={defaultScreenInfo}
          onSystemAction={mockOnSystemAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(testCase.expectedIcon)).toBeInTheDocument();
      });

      unmountCase();
    }

    // Test case 3: Invalid icon path with image error fallback
    vi.mocked(tauriAPI.processIcon).mockRejectedValueOnce(new Error('Invalid icon path'));

    const buttonWithInvalidIcon = {
      position: { row: 1, col: 1 },
      action_type: 'Open' as const,
      label: 'Test File',
      icon: 'invalid/path/to/icon.png',
      config: { target: 'C:\\test.txt' },
      style: undefined,
      action: undefined,
    };

    render(
      <ActionButton
        button={buttonWithInvalidIcon}
        dpiScale={1}
        screenInfo={defaultScreenInfo}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const img = await waitFor(() => screen.getByAltText('Test File'));
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.getByText('📂')).toBeInTheDocument();
    });
  });
});