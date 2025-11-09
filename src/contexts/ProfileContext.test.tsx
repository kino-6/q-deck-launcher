import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from './ProfileContext';
import { ProfileInfo, PageInfo, NavigationContext } from '../lib/platform-api';

// Mock the tauri API
const mockTauriAPI = {
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
};

vi.mock('../lib/tauri', () => ({
  tauriAPI: mockTauriAPI,
}));

// Mock the listen function from Tauri
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

// Test component that uses the ProfileContext
const TestComponent = () => {
  const {
    profiles,
    currentProfile,
    currentPages,
    currentPage,
    navigationContext,
    loading,
    error,
    switchToProfile,
    switchToPage,
    nextPage,
    previousPage,
  } = useProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="profiles-count">{profiles.length}</div>
      <div data-testid="current-profile">{currentProfile?.name || 'None'}</div>
      <div data-testid="current-page">{currentPage?.name || 'None'}</div>
      <div data-testid="pages-count">{currentPages.length}</div>
      <div data-testid="nav-context">{navigationContext?.profile_name || 'None'}</div>
      <button onClick={() => switchToProfile(1)}>Switch Profile</button>
      <button onClick={() => switchToPage(1)}>Switch Page</button>
      <button onClick={nextPage}>Next Page</button>
      <button onClick={previousPage}>Previous Page</button>
    </div>
  );
};

describe('ProfileContext', () => {
  const mockProfiles: ProfileInfo[] = [
    {
      name: 'Profile 1',
      index: 0,
      page_count: 2,
      current_page_index: 0,
      hotkey: 'Ctrl+1',
    },
    {
      name: 'Profile 2',
      index: 1,
      page_count: 3,
      current_page_index: 1,
      hotkey: 'Ctrl+2',
    },
  ];

  const mockCurrentProfile: ProfileInfo = mockProfiles[0];

  const mockPages: PageInfo[] = [
    {
      name: 'Page 1',
      index: 0,
      rows: 3,
      cols: 4,
      button_count: 5,
    },
    {
      name: 'Page 2',
      index: 1,
      rows: 4,
      cols: 5,
      button_count: 8,
    },
  ];

  const mockCurrentPage: PageInfo = mockPages[0];

  const mockNavigationContext: NavigationContext = {
    profile_name: 'Profile 1',
    profile_index: 0,
    page_name: 'Page 1',
    page_index: 0,
    total_profiles: 2,
    total_pages: 2,
    has_previous_page: false,
    has_next_page: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockTauriAPI.getProfiles.mockResolvedValue(mockProfiles);
    mockTauriAPI.getCurrentProfile.mockResolvedValue(mockCurrentProfile);
    mockTauriAPI.getCurrentProfilePages.mockResolvedValue(mockPages);
    mockTauriAPI.getCurrentPage.mockResolvedValue(mockCurrentPage);
    mockTauriAPI.getNavigationContext.mockResolvedValue(mockNavigationContext);
  });

  it('provides profile data to children', async () => {
    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('profiles-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('current-profile')).toHaveTextContent('Profile 1');
    expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');
    expect(screen.getByTestId('pages-count')).toHaveTextContent('2');
    expect(screen.getByTestId('nav-context')).toHaveTextContent('Profile 1');
  });

  it('handles profile switching', async () => {
    const mockNewProfile: ProfileInfo = {
      name: 'Profile 2',
      index: 1,
      page_count: 3,
      current_page_index: 0,
      hotkey: 'Ctrl+2',
    };

    mockTauriAPI.switchToProfile.mockResolvedValue(mockNewProfile);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-profile')).toHaveTextContent('Profile 1');
    });

    // Click switch profile button
    const switchButton = screen.getByText('Switch Profile');
    switchButton.click();

    await waitFor(() => {
      expect(mockTauriAPI.switchToProfile).toHaveBeenCalledWith(1);
    });
  });

  it('handles page switching', async () => {
    const mockNewPage: PageInfo = {
      name: 'Page 2',
      index: 1,
      rows: 4,
      cols: 5,
      button_count: 8,
    };

    mockTauriAPI.switchToPage.mockResolvedValue(mockNewPage);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');
    });

    // Click switch page button
    const switchButton = screen.getByText('Switch Page');
    switchButton.click();

    await waitFor(() => {
      expect(mockTauriAPI.switchToPage).toHaveBeenCalledWith(1);
    });
  });

  it('handles next page navigation', async () => {
    const mockNextPage: PageInfo = {
      name: 'Page 2',
      index: 1,
      rows: 4,
      cols: 5,
      button_count: 8,
    };

    mockTauriAPI.nextPage.mockResolvedValue(mockNextPage);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');
    });

    // Click next page button
    const nextButton = screen.getByText('Next Page');
    nextButton.click();

    await waitFor(() => {
      expect(mockTauriAPI.nextPage).toHaveBeenCalled();
    });
  });

  it('handles previous page navigation', async () => {
    const mockPrevPage: PageInfo = {
      name: 'Page 1',
      index: 0,
      rows: 3,
      cols: 4,
      button_count: 5,
    };

    mockTauriAPI.previousPage.mockResolvedValue(mockPrevPage);

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');
    });

    // Click previous page button
    const prevButton = screen.getByText('Previous Page');
    prevButton.click();

    await waitFor(() => {
      expect(mockTauriAPI.previousPage).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    mockTauriAPI.getProfiles.mockRejectedValue(new Error('API Error'));

    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useProfile must be used within a ProfileProvider');

    consoleSpy.mockRestore();
  });
});