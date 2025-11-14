import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useButtonShortcuts } from './useButtonShortcuts';
import { ActionButton } from '../lib/platform-api';

describe('useButtonShortcuts', () => {
  const mockButtons: ActionButton[] = [
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
  ];

  let mockOnButtonClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnButtonClick = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct shortcut numbers for first 10 buttons', () => {
    const { result } = renderHook(() =>
      useButtonShortcuts({
        buttons: mockButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Test shortcut mapping: index 0->1, 1->2, 2->3
    expect(result.current.getButtonShortcut(mockButtons[0])).toBe('1');
    expect(result.current.getButtonShortcut(mockButtons[1])).toBe('2');
    expect(result.current.getButtonShortcut(mockButtons[2])).toBe('3');
  });

  it('should return "0" for the 10th button (index 9)', () => {
    const tenButtons = Array.from({ length: 10 }, (_, i) => ({
      position: { row: 1, col: i + 1 },
      action_type: 'LaunchApp' as const,
      label: `Button ${i + 1}`,
      icon: '🚀',
      config: { path: `app${i + 1}.exe` },
    }));

    const { result } = renderHook(() =>
      useButtonShortcuts({
        buttons: tenButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // The 10th button (index 9) should map to "0"
    expect(result.current.getButtonShortcut(tenButtons[9])).toBe('0');
  });

  it('should return Shift+number shortcuts for buttons 11-20', () => {
    const twentyButtons = Array.from({ length: 20 }, (_, i) => ({
      position: { row: 1, col: i + 1 },
      action_type: 'LaunchApp' as const,
      label: `Button ${i + 1}`,
      icon: '🚀',
      config: { path: `app${i + 1}.exe` },
    }));

    const { result } = renderHook(() =>
      useButtonShortcuts({
        buttons: twentyButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Buttons 11-19 (indices 10-18) should map to Shift+1 through Shift+9
    expect(result.current.getButtonShortcut(twentyButtons[10])).toBe('⇧1');
    expect(result.current.getButtonShortcut(twentyButtons[11])).toBe('⇧2');
    expect(result.current.getButtonShortcut(twentyButtons[18])).toBe('⇧9');
    
    // The 20th button (index 19) should map to Shift+0
    expect(result.current.getButtonShortcut(twentyButtons[19])).toBe('⇧0');
  });

  it('should return null for buttons beyond the first 20', () => {
    const twentyOneButtons = Array.from({ length: 21 }, (_, i) => ({
      position: { row: 1, col: i + 1 },
      action_type: 'LaunchApp' as const,
      label: `Button ${i + 1}`,
      icon: '🚀',
      config: { path: `app${i + 1}.exe` },
    }));

    const { result } = renderHook(() =>
      useButtonShortcuts({
        buttons: twentyOneButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // The 21st button (index 20) should not have a shortcut
    expect(result.current.getButtonShortcut(twentyOneButtons[20])).toBeNull();
  });

  it('should call onButtonClick when button-shortcut-pressed event is dispatched', () => {
    renderHook(() =>
      useButtonShortcuts({
        buttons: mockButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Simulate pressing key "1" (button index 0)
    act(() => {
      window.dispatchEvent(
        new CustomEvent('button-shortcut-pressed', {
          detail: { buttonIndex: 0 },
        })
      );
    });

    expect(mockOnButtonClick).toHaveBeenCalledWith(mockButtons[0]);
  });

  it('should not call onButtonClick when disabled', () => {
    renderHook(() =>
      useButtonShortcuts({
        buttons: mockButtons,
        onButtonClick: mockOnButtonClick,
        enabled: false,
      })
    );

    // Simulate pressing key "1" (button index 0)
    act(() => {
      window.dispatchEvent(
        new CustomEvent('button-shortcut-pressed', {
          detail: { buttonIndex: 0 },
        })
      );
    });

    expect(mockOnButtonClick).not.toHaveBeenCalled();
  });

  it('should handle invalid button indices gracefully', () => {
    renderHook(() =>
      useButtonShortcuts({
        buttons: mockButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Simulate pressing a key for a non-existent button
    act(() => {
      window.dispatchEvent(
        new CustomEvent('button-shortcut-pressed', {
          detail: { buttonIndex: 99 },
        })
      );
    });

    expect(mockOnButtonClick).not.toHaveBeenCalled();
  });

  it('should return null for buttons not in the list', () => {
    const { result } = renderHook(() =>
      useButtonShortcuts({
        buttons: mockButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    const unknownButton: ActionButton = {
      position: { row: 5, col: 5 },
      action_type: 'LaunchApp',
      label: 'Unknown Button',
      icon: '❓',
      config: { path: 'unknown.exe' },
    };

    expect(result.current.getButtonShortcut(unknownButton)).toBeNull();
  });

  it('should call onButtonClick for Shift+number shortcuts (buttons 11-20)', () => {
    const twentyButtons = Array.from({ length: 20 }, (_, i) => ({
      position: { row: 1, col: i + 1 },
      action_type: 'LaunchApp' as const,
      label: `Button ${i + 1}`,
      icon: '🚀',
      config: { path: `app${i + 1}.exe` },
    }));

    renderHook(() =>
      useButtonShortcuts({
        buttons: twentyButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Simulate pressing Shift+1 (button index 10)
    act(() => {
      window.dispatchEvent(
        new CustomEvent('button-shortcut-pressed', {
          detail: { buttonIndex: 10 },
        })
      );
    });

    expect(mockOnButtonClick).toHaveBeenCalledWith(twentyButtons[10]);
  });

  it('should call onButtonClick for Shift+0 (button 20)', () => {
    const twentyButtons = Array.from({ length: 20 }, (_, i) => ({
      position: { row: 1, col: i + 1 },
      action_type: 'LaunchApp' as const,
      label: `Button ${i + 1}`,
      icon: '🚀',
      config: { path: `app${i + 1}.exe` },
    }));

    renderHook(() =>
      useButtonShortcuts({
        buttons: twentyButtons,
        onButtonClick: mockOnButtonClick,
        enabled: true,
      })
    );

    // Simulate pressing Shift+0 (button index 19)
    act(() => {
      window.dispatchEvent(
        new CustomEvent('button-shortcut-pressed', {
          detail: { buttonIndex: 19 },
        })
      );
    });

    expect(mockOnButtonClick).toHaveBeenCalledWith(twentyButtons[19]);
  });
});
