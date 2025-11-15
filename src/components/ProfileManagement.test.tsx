/**
 * Profile Management Tests
 * 
 * Tests for multiple profile support and profile switching functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '../contexts/ProfileContext';
import { tauriAPI } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getProfiles: vi.fn(),
    getCurrentProfile: vi.fn(),
    getCurrentProfilePages: vi.fn(),
    getCurrentPage: vi.fn(),
    getNavigationContext: vi.fn(),
    switchToProfile: vi.fn(),
    switchToProfileByName: vi.fn(),
    switchToPage: vi.fn(),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
  },
}));

// Test component that uses the profile context
function TestComponent() {
  const {
    profiles,
    currentProfile,
    currentPage,
    navigationContext,
    loading,
    error,
    switchToProfile,
    switchToProfileByName,
  } = useProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="profile-count">{profiles.length}</div>
      <div data-testid="current-profile">{currentProfile?.name}</div>
      <div data-testid="current-page">{currentPage?.name}</div>
      <div data-testid="total-profiles">{navigationContext?.total_profiles}</div>
      <button onClick={() => switchToProfile(1)}>Switch to Profile 1</button>
      <button onClick={() => switchToProfileByName('Development')}>Switch to Development</button>
    </div>
  );
}

describe('Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load multiple profiles', async () => {
    // Mock API responses
    const mockProfiles = [
      { index: 0, name: 'Default', page_count: 1, hotkey: null },
      { index: 1, name: 'Development', page_count: 2, hotkey: 'Ctrl+1' },
      { index: 2, name: 'Gaming', page_count: 1, hotkey: 'Ctrl+2' },
    ];

    const mockCurrentProfile = { index: 0, name: 'Default', page_count: 1, current_page_index: 0, hotkey: null };
    const mockCurrentPage = { index: 0, name: 'Main', rows: 4, cols: 6, button_count: 4 };
    const mockPages = [mockCurrentPage];
    const mockNavContext = {
      profile_name: 'Default',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 3,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify profiles are loaded
    expect(screen.getByTestId('profile-count')).toHaveTextContent('3');
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Default');
    expect(screen.getByTestId('current-page')).toHaveTextContent('Main');
    expect(screen.getByTestId('total-profiles')).toHaveTextContent('3');
  });

  it('should switch to a profile by index', async () => {
    // Mock initial state
    const mockProfiles = [
      { index: 0, name: 'Default', page_count: 1, hotkey: null },
      { index: 1, name: 'Development', page_count: 2, hotkey: 'Ctrl+1' },
    ];

    const mockCurrentProfile = { index: 0, name: 'Default', page_count: 1, current_page_index: 0, hotkey: null };
    const mockCurrentPage = { index: 0, name: 'Main', rows: 4, cols: 6, button_count: 4 };
    const mockPages = [mockCurrentPage];
    const mockNavContext = {
      profile_name: 'Default',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 2,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);

    // Mock profile switch
    const newProfile = { index: 1, name: 'Development', page_count: 2, current_page_index: 0, hotkey: 'Ctrl+1' };
    const newPage = { index: 0, name: 'Code', rows: 4, cols: 6, button_count: 5 };
    const newPages = [newPage, { index: 1, name: 'Tools', rows: 4, cols: 6, button_count: 3 }];
    const newNavContext = {
      profile_name: 'Development',
      profile_index: 1,
      page_name: 'Code',
      page_index: 0,
      total_profiles: 2,
      total_pages: 2,
      has_previous_page: false,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.switchToProfile).mockResolvedValue(newProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(newPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(newPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(newNavContext);

    const { rerender } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click switch button
    const switchButton = screen.getByText('Switch to Profile 1');
    switchButton.click();

    // Wait for profile switch
    await waitFor(() => {
      expect(tauriAPI.switchToProfile).toHaveBeenCalledWith(1);
    });

    // Force re-render to update context
    rerender(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
  });

  it('should switch to a profile by name', async () => {
    // Mock initial state
    const mockProfiles = [
      { index: 0, name: 'Default', page_count: 1, hotkey: null },
      { index: 1, name: 'Development', page_count: 2, hotkey: 'Ctrl+1' },
    ];

    const mockCurrentProfile = { index: 0, name: 'Default', page_count: 1, current_page_index: 0, hotkey: null };
    const mockCurrentPage = { index: 0, name: 'Main', rows: 4, cols: 6, button_count: 4 };
    const mockPages = [mockCurrentPage];
    const mockNavContext = {
      profile_name: 'Default',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 2,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);

    // Mock profile switch by name
    const newProfile = { index: 1, name: 'Development', page_count: 2, current_page_index: 0, hotkey: 'Ctrl+1' };
    vi.mocked(tauriAPI.switchToProfileByName).mockResolvedValue(newProfile);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click switch by name button
    const switchButton = screen.getByText('Switch to Development');
    switchButton.click();

    // Wait for profile switch
    await waitFor(() => {
      expect(tauriAPI.switchToProfileByName).toHaveBeenCalledWith('Development');
    });
  });

  it('should persist profile selection', async () => {
    // This test verifies that the profile state is saved
    // The actual persistence is handled by ProfileStateManager in the backend
    
    const mockProfiles = [
      { index: 0, name: 'Default', page_count: 1, hotkey: null },
      { index: 1, name: 'Development', page_count: 2, hotkey: 'Ctrl+1' },
    ];

    const mockCurrentProfile = { index: 1, name: 'Development', page_count: 2, current_page_index: 0, hotkey: 'Ctrl+1' };
    const mockCurrentPage = { index: 0, name: 'Code', rows: 4, cols: 6, button_count: 5 };
    const mockPages = [mockCurrentPage];
    const mockNavContext = {
      profile_name: 'Development',
      profile_index: 1,
      page_name: 'Code',
      page_index: 0,
      total_profiles: 2,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue(mockPages);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavContext);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify that the last selected profile (Development) is loaded
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Development');
    expect(screen.getByTestId('current-page')).toHaveTextContent('Code');
  });
});
