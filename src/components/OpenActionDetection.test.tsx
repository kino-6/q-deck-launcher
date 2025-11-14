/**
 * Tests for Open action detection and auto-close behavior
 * 
 * This test suite verifies that:
 * 1. Open actions trigger the auto-close event
 * 2. Other action types (LaunchApp, Terminal, System) do NOT trigger auto-close
 * 3. The overlay properly responds to the auto-close event
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButton from './ActionButton';
import type { ActionButton as ActionButtonType } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn(),
    processIcon: vi.fn().mockResolvedValue({
      path: '',
      icon_type: 'Emoji'
    }),
  },
  ActionButton: {} as any,
}));

describe('Open Action Detection and Auto-Close', () => {
  let eventListener: any;
  let mockExecuteAction: any;

  beforeEach(async () => {
    // Get the mocked function
    const platformApi = await import('../lib/platform-api');
    mockExecuteAction = platformApi.tauriAPI.executeAction as any;
    
    // Clear mocks
    vi.clearAllMocks();
    
    // Set up event listener spy
    eventListener = vi.fn();
    window.addEventListener('open-action-executed', eventListener);
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.removeEventListener('open-action-executed', eventListener);
  });

  it('should dispatch open-action-executed event when Open action succeeds', async () => {
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
      label: 'Test File',
      icon: '📄',
      config: {
        target: 'C:\\test.txt'
      }
    };

    render(<ActionButton button={button} />);
    
    const buttonElement = screen.getByRole('button', { name: /Test File/i });
    await userEvent.click(buttonElement);

    // Wait for the event to be dispatched
    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    // Verify event details
    const event = eventListener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.actionType).toBe('Open');
    expect(event.detail.label).toBe('Test File');
  });

  it('should NOT dispatch event when LaunchApp action executes', async () => {
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
    
    const buttonElement = screen.getByRole('button', { name: /Notepad/i });
    await userEvent.click(buttonElement);

    // Wait a bit to ensure no event is dispatched
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(eventListener).not.toHaveBeenCalled();
  });

  it('should NOT dispatch event when Terminal action executes', async () => {
    // Mock successful Terminal action execution
    mockExecuteAction.mockResolvedValue({
      success: true,
      message: 'Terminal opened',
      execution_time_ms: 80,
      actionType: 'Terminal'
    });

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'Terminal',
      label: 'PowerShell',
      icon: '💻',
      config: {
        terminal: 'PowerShell',
        workdir: 'C:\\Users'
      }
    };

    render(<ActionButton button={button} />);
    
    const buttonElement = screen.getByRole('button', { name: /PowerShell/i });
    await userEvent.click(buttonElement);

    // Wait a bit to ensure no event is dispatched
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(eventListener).not.toHaveBeenCalled();
  });

  it('should NOT dispatch event when System action executes', async () => {
    const onSystemAction = vi.fn();

    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      action_type: 'system',
      label: 'Settings',
      icon: '⚙️',
      config: {},
      action: {
        action_type: 'system',
        system_action: 'config'
      }
    };

    render(<ActionButton button={button} onSystemAction={onSystemAction} />);
    
    const buttonElement = screen.getByRole('button', { name: /Settings/i });
    await userEvent.click(buttonElement);

    // Wait a bit to ensure no event is dispatched
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(eventListener).not.toHaveBeenCalled();
    expect(onSystemAction).toHaveBeenCalledWith('config');
  });

  it('should NOT dispatch event when Open action fails', async () => {
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
    
    const buttonElement = screen.getByRole('button', { name: /Missing File/i });
    await userEvent.click(buttonElement);

    // Wait a bit to ensure no event is dispatched
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(eventListener).not.toHaveBeenCalled();
  });

  it('should handle multiple Open actions correctly', async () => {
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
    
    const button1Element = screen.getByRole('button', { name: /File 1/i });
    await userEvent.click(button1Element);

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    // Click second button
    rerender(<ActionButton button={button2} />);
    const button2Element = screen.getByRole('button', { name: /File 2/i });
    await userEvent.click(button2Element);

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledTimes(2);
    });
  });
});
