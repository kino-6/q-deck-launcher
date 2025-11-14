/**
 * Integration test for Open action auto-close behavior
 * 
 * This test verifies the complete flow:
 * 1. User clicks a button with Open action
 * 2. Action executes successfully
 * 3. Overlay automatically closes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButton from './ActionButton';
import type { ActionButton as ActionButtonType } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn(),
    processIcon: vi.fn().mockResolvedValue({
      path: '📄',
      icon_type: 'Emoji'
    }),
    hideOverlay: vi.fn().mockResolvedValue(undefined),
  },
  ActionButton: {} as any,
}));

describe('Open Action Auto-Close Integration Test', () => {
  let mockExecuteAction: any;
  let mockHideOverlay: any;
  let eventListener: any;

  beforeEach(async () => {
    // Get the mocked functions
    const platformApi = await import('../lib/platform-api');
    mockExecuteAction = platformApi.tauriAPI.executeAction as any;
    mockHideOverlay = platformApi.tauriAPI.hideOverlay as any;
    
    // Clear mocks
    vi.clearAllMocks();
    
    // Set up event listener to simulate Overlay component
    eventListener = vi.fn(async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Test: Open action event detected:', customEvent.detail);
      
      // Simulate Overlay's auto-close behavior
      setTimeout(async () => {
        await mockHideOverlay();
      }, 100);
    });
    
    window.addEventListener('open-action-executed', eventListener);
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.removeEventListener('open-action-executed', eventListener);
  });

  it('should close overlay when clicking button with Open action', async () => {
    // Mock successful Open action execution
    mockExecuteAction.mockResolvedValue({
      success: true,
      message: 'File opened successfully',
      execution_time_ms: 50,
      actionType: 'Open'
    });

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'Open',
      label: 'Test Document',
      icon: '📄',
      config: {
        target: 'C:\\Documents\\test.txt'
      }
    };

    render(<ActionButton button={button} />);
    
    // Find and click the button
    const buttonElement = screen.getByRole('button', { name: /Test Document/i });
    expect(buttonElement).toBeInTheDocument();
    
    // Click the button
    await act(async () => {
      await userEvent.click(buttonElement);
    });

    // Verify action was executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalledWith({
        type: 'Open',
        label: 'Test Document',
        target: 'C:\\Documents\\test.txt'
      });
    });

    // Verify event was dispatched
    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    // Verify event details
    const event = eventListener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.actionType).toBe('Open');
    expect(event.detail.label).toBe('Test Document');

    // Wait for the auto-close timeout (100ms) plus buffer
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Verify overlay was hidden
    expect(mockHideOverlay).toHaveBeenCalled();
  });

  it('should NOT close overlay when clicking button with LaunchApp action', async () => {
    // Mock successful LaunchApp action execution
    mockExecuteAction.mockResolvedValue({
      success: true,
      message: 'Application launched',
      execution_time_ms: 100,
      actionType: 'LaunchApp'
    });

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'LaunchApp',
      label: 'Notepad',
      icon: '📝',
      config: {
        path: 'notepad.exe'
      }
    };

    render(<ActionButton button={button} />);
    
    // Find and click the button
    const buttonElement = screen.getByRole('button', { name: /Notepad/i });
    
    // Click the button
    await act(async () => {
      await userEvent.click(buttonElement);
    });

    // Verify action was executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalled();
    });

    // Wait to ensure no event is dispatched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify NO event was dispatched
    expect(eventListener).not.toHaveBeenCalled();
    
    // Verify overlay was NOT hidden
    expect(mockHideOverlay).not.toHaveBeenCalled();
  });

  it('should NOT close overlay when Open action fails', async () => {
    // Mock failed Open action execution
    mockExecuteAction.mockResolvedValue({
      success: false,
      message: 'File not found',
      execution_time_ms: 10,
      actionType: 'Open'
    });

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'Open',
      label: 'Missing File',
      icon: '📄',
      config: {
        target: 'C:\\nonexistent.txt'
      }
    };

    render(<ActionButton button={button} />);
    
    // Find and click the button
    const buttonElement = screen.getByRole('button', { name: /Missing File/i });
    
    // Click the button
    await act(async () => {
      await userEvent.click(buttonElement);
    });

    // Verify action was executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalled();
    });

    // Wait to ensure no event is dispatched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify NO event was dispatched (because action failed)
    expect(eventListener).not.toHaveBeenCalled();
    
    // Verify overlay was NOT hidden
    expect(mockHideOverlay).not.toHaveBeenCalled();
  });

  it('should close overlay for multiple Open actions in sequence', async () => {
    // Mock successful Open action execution
    mockExecuteAction.mockResolvedValue({
      success: true,
      message: 'File opened successfully',
      execution_time_ms: 50,
      actionType: 'Open'
    });

    const button1: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'Open',
      label: 'File 1',
      icon: '📄',
      config: { target: 'C:\\file1.txt' }
    };

    const button2: ActionButtonType = {
      position: { row: 1, col: 2 },
      action_type: 'Open',
      label: 'File 2',
      icon: '📄',
      config: { target: 'C:\\file2.txt' }
    };

    const { rerender } = render(<ActionButton button={button1} />);
    
    // Click first button
    const button1Element = screen.getByRole('button', { name: /File 1/i });
    await act(async () => {
      await userEvent.click(button1Element);
    });

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    // Wait for auto-close
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(mockHideOverlay).toHaveBeenCalledTimes(1);

    // Clear mocks for second button
    vi.clearAllMocks();

    // Click second button
    rerender(<ActionButton button={button2} />);
    const button2Element = screen.getByRole('button', { name: /File 2/i });
    await act(async () => {
      await userEvent.click(button2Element);
    });

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    // Wait for auto-close
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(mockHideOverlay).toHaveBeenCalledTimes(1);
  });

  it('should NOT close overlay when clicking button with Terminal action', async () => {
    // Mock successful Terminal action execution
    mockExecuteAction.mockResolvedValue({
      success: true,
      message: 'Terminal launched',
      execution_time_ms: 100,
      actionType: 'Terminal'
    });

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'Terminal',
      label: 'PowerShell',
      icon: '💻',
      config: {
        terminal: 'PowerShell'
      }
    };

    render(<ActionButton button={button} />);
    
    // Find and click the button
    const buttonElement = screen.getByRole('button', { name: /PowerShell/i });
    
    // Click the button
    await act(async () => {
      await userEvent.click(buttonElement);
    });

    // Verify action was executed
    await waitFor(() => {
      expect(mockExecuteAction).toHaveBeenCalled();
    });

    // Wait to ensure no event is dispatched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify NO event was dispatched
    expect(eventListener).not.toHaveBeenCalled();
    
    // Verify overlay was NOT hidden
    expect(mockHideOverlay).not.toHaveBeenCalled();
  });

  it('should NOT close overlay when clicking button with system action (config)', async () => {
    // Mock system action handler
    const mockSystemActionHandler = vi.fn();

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'LaunchApp', // System actions still use a base action_type
      label: 'Settings',
      icon: '⚙️',
      config: {},
      action: {
        action_type: 'system',
        system_action: 'config'
      }
    };

    render(<ActionButton button={button} onSystemAction={mockSystemActionHandler} />);
    
    // Find and click the button
    const buttonElement = screen.getByRole('button', { name: /Settings/i });
    
    // Click the button
    await act(async () => {
      await userEvent.click(buttonElement);
    });

    // Verify system action handler was called
    await waitFor(() => {
      expect(mockSystemActionHandler).toHaveBeenCalledWith('config');
    });

    // Verify executeAction was NOT called (system actions don't execute through normal flow)
    expect(mockExecuteAction).not.toHaveBeenCalled();

    // Wait to ensure no event is dispatched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify NO event was dispatched
    expect(eventListener).not.toHaveBeenCalled();
    
    // Verify overlay was NOT hidden
    expect(mockHideOverlay).not.toHaveBeenCalled();
  });
});
