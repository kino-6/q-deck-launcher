import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePageNavigation } from './usePageNavigation';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    nextPage: vi.fn(),
    previousPage: vi.fn(),
    switchToPage: vi.fn(),
  },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

describe('usePageNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate to next page on ArrowRight key', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to previous page on ArrowLeft key', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    mockPreviousPage.mockResolvedValue({ index: 0, name: 'Page 1' });

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate ArrowLeft key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to next page on PageDown key', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate PageDown key press
    const event = new KeyboardEvent('keydown', { key: 'PageDown' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should navigate to previous page on PageUp key', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    mockPreviousPage.mockResolvedValue({ index: 0, name: 'Page 1' });

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate PageUp key press
    const event = new KeyboardEvent('keydown', { key: 'PageUp' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);
    });
  });

  it('should not navigate when disabled', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    renderHook(() => usePageNavigation({ enabled: false }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    // Wait a bit to ensure no call is made
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNextPage).not.toHaveBeenCalled();
  });

  it('should not navigate when input is focused', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2' });

    renderHook(() => usePageNavigation({ enabled: true }));

    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    // Wait a bit to ensure no call is made
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNextPage).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it('should call onPageChange callback when page changes', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    const pageInfo = { index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 };
    mockNextPage.mockResolvedValue(pageInfo);
    const onPageChange = vi.fn();

    renderHook(() => usePageNavigation({ enabled: true, onPageChange }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith(pageInfo);
    });
  });

  it('should handle navigation errors gracefully', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockRejectedValue(new Error('Navigation failed'));

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });

    // Should not throw error
  });

  it('should handle null response when at page boundary', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue(null);

    renderHook(() => usePageNavigation({ enabled: true }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(mockNextPage).toHaveBeenCalledTimes(1);
    });

    // Should handle null gracefully
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => usePageNavigation({ enabled: true }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should navigate to specific page using goToPage', async () => {
    const mockSwitchToPage = vi.mocked(tauriAPI.switchToPage);
    const pageInfo = { index: 2, name: 'Page 3', rows: 4, cols: 6, button_count: 5 };
    mockSwitchToPage.mockResolvedValue(pageInfo);

    const { result } = renderHook(() => usePageNavigation({ enabled: true }));

    // Navigate to specific page
    let navResult;
    await act(async () => {
      navResult = await result.current.goToPage(2);
    });

    expect(mockSwitchToPage).toHaveBeenCalledWith(2);
    expect(navResult).toEqual(pageInfo);
  });

  it('should track navigation state', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 }), 100)));

    const { result } = renderHook(() => usePageNavigation({ enabled: true }));

    // Initially not navigating
    expect(result.current.isNavigating).toBe(false);

    // Start navigation
    act(() => {
      result.current.handleNextPage();
    });

    // Should be navigating
    await waitFor(() => {
      expect(result.current.isNavigating).toBe(true);
    });

    // Wait for navigation to complete
    await waitFor(() => {
      expect(result.current.isNavigating).toBe(false);
    }, { timeout: 200 });
  });

  it('should prevent concurrent navigation', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 }), 100)));

    const { result } = renderHook(() => usePageNavigation({ enabled: true }));

    // Start first navigation
    act(() => {
      result.current.handleNextPage();
    });

    // Try to start second navigation while first is in progress
    await act(async () => {
      const secondResult = await result.current.handleNextPage();
      expect(secondResult).toBeNull();
    });

    // Wait for first navigation to complete
    await waitFor(() => {
      expect(result.current.isNavigating).toBe(false);
    }, { timeout: 200 });

    // Should only have been called once
    expect(mockNextPage).toHaveBeenCalledTimes(1);
  });

  it('should disable keyboard shortcuts when enableKeyboardShortcuts is false', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    mockNextPage.mockResolvedValue({ index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 });

    renderHook(() => usePageNavigation({ enabled: true, enableKeyboardShortcuts: false }));

    // Simulate ArrowRight key press
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    act(() => {
      window.dispatchEvent(event);
    });

    // Wait a bit to ensure no call is made
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockNextPage).not.toHaveBeenCalled();
  });

  it('should call onError callback when navigation fails', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    const error = new Error('Navigation failed');
    mockNextPage.mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() => usePageNavigation({ enabled: true, onError }));

    // Navigate
    await act(async () => {
      await result.current.handleNextPage();
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
      expect(result.current.error).toContain('Navigation failed');
    });
  });

  it('should programmatically navigate using handleNextPage', async () => {
    const mockNextPage = vi.mocked(tauriAPI.nextPage);
    const pageInfo = { index: 1, name: 'Page 2', rows: 4, cols: 6, button_count: 3 };
    mockNextPage.mockResolvedValue(pageInfo);

    const { result } = renderHook(() => usePageNavigation({ enabled: true }));

    // Navigate programmatically
    let navResult;
    await act(async () => {
      navResult = await result.current.handleNextPage();
    });

    expect(mockNextPage).toHaveBeenCalled();
    expect(navResult).toEqual(pageInfo);
  });

  it('should programmatically navigate using handlePreviousPage', async () => {
    const mockPreviousPage = vi.mocked(tauriAPI.previousPage);
    const pageInfo = { index: 0, name: 'Page 1', rows: 4, cols: 6, button_count: 4 };
    mockPreviousPage.mockResolvedValue(pageInfo);

    const { result } = renderHook(() => usePageNavigation({ enabled: true }));

    // Navigate programmatically
    let navResult;
    await act(async () => {
      navResult = await result.current.handlePreviousPage();
    });

    expect(mockPreviousPage).toHaveBeenCalled();
    expect(navResult).toEqual(pageInfo);
  });
});
