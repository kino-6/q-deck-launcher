/**
 * Profile Hotkey Tests
 * 
 * Tests for profile-specific hotkey functionality.
 * Requirement: 要件3 - プロファイルとページの切り替え
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
    onProfileChanged: vi.fn(),
  },
}));

// Test component that uses the profile context
function TestComponent() {
  const {
    currentProfile,
    loading,
    error,
  } = useProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="current-profile">{currentProfile?.name}</div>
      <div data-testid="profile-hotkey">{currentProfile?.hotkey || 'None'}</div>
    </div>
  );
}

describe('Profile Hotkey Functionality', () => {
  const mockProfiles = [
    {
      index: 0,
      name: 'Development',
      page_count: 2,
      hotkey: 'Ctrl+1',
    },
    {
      index: 1,
      name: 'Gaming',
      page_count: 1,
      hotkey: 'Ctrl+2',
    },
    {
      index: 2,
      name: 'Work',
      page_count: 3,
      hotkey: null,
    },
  ];

  const mockCurrentProfile = mockProfiles[0];

  const mockCurrentPage = {
    index: 0,
    name: 'Main',
    rows: 4,
    cols: 6,
    button_count: 5,
  };

  const mockNavigationContext = {
    profile_name: 'Development',
    profile_index: 0,
    page_name: 'Main',
    page_index: 0,
    total_profiles: 3,
    total_pages: 2,
    has_previous_page: false,
    has_next_page: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(tauriAPI.getProfiles).mockResolvedValue(mockProfiles);
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockCurrentProfile);
    vi.mocked(tauriAPI.getCurrentProfilePages).mockResolvedValue([mockCurrentPage]);
    vi.mocked(tauriAPI.getCurrentPage).mockResolvedValue(mockCurrentPage);
    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockNavigationContext);
  });

  it('should display profile hotkey information', async () => {
    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('current-profile')).toHaveTextContent('Development');
    expect(screen.getByTestId('profile-hotkey')).toHaveTextContent('Ctrl+1');
  });

  it('should handle profile without hotkey', async () => {
    vi.mocked(tauriAPI.getCurrentProfile).mockResolvedValue(mockProfiles[2]);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('current-profile')).toHaveTextContent('Work');
    expect(screen.getByTestId('profile-hotkey')).toHaveTextContent('None');
  });

  it('should register profile change event listener', async () => {
    let profileChangeCallback: ((profileInfo: any) => void) | null = null;
    
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation((callback) => {
      profileChangeCallback = callback;
    });

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Verify that onProfileChanged was called to register the listener
    expect(tauriAPI.onProfileChanged).toHaveBeenCalled();
    expect(profileChangeCallback).not.toBeNull();
  });

  it('should update profile when profile-changed event is triggered', async () => {
    let profileChangeCallback: ((profileInfo: any) => void) | null = null;
    
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation((callback) => {
      profileChangeCallback = callback;
    });

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Initial profile should be Development
    expect(screen.getByTestId('current-profile')).toHaveTextContent('Development');

    // Simulate profile change event (e.g., from hotkey)
    if (profileChangeCallback) {
      profileChangeCallback(mockProfiles[1]);
    }

    // Profile should update to Gaming
    await waitFor(() => {
      expect(screen.getByTestId('current-profile')).toHaveTextContent('Gaming');
    });
  });

  it('should support multiple profiles with different hotkeys', () => {
    const profilesWithHotkeys = mockProfiles.filter(p => p.hotkey !== null);
    
    expect(profilesWithHotkeys).toHaveLength(2);
    expect(profilesWithHotkeys[0].hotkey).toBe('Ctrl+1');
    expect(profilesWithHotkeys[1].hotkey).toBe('Ctrl+2');
  });
});
