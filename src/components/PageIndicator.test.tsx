import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PageIndicator from './PageIndicator';
import { tauriAPI, NavigationContext } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    getNavigationContext: vi.fn(),
    onProfileChanged: vi.fn(),
  },
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('PageIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not render when there is only one page', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 1,
      total_pages: 1,
      has_previous_page: false,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    const { container } = render(<PageIndicator />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should render page indicator when there are multiple pages', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 1,
      total_pages: 3,
      has_previous_page: false,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    render(<PageIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Main')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  it('should display correct number of page dots', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 1,
      total_pages: 4,
      has_previous_page: false,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    const { container } = render(<PageIndicator />);

    await waitFor(() => {
      const dots = container.querySelectorAll('.page-dot');
      expect(dots).toHaveLength(4);
    });
  });

  it('should highlight the active page dot', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Second Page',
      page_index: 1,
      total_profiles: 1,
      total_pages: 3,
      has_previous_page: true,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    const { container } = render(<PageIndicator />);

    await waitFor(() => {
      const dots = container.querySelectorAll('.page-dot');
      expect(dots[1]).toHaveClass('active');
      expect(dots[0]).not.toHaveClass('active');
      expect(dots[2]).not.toHaveClass('active');
    });
  });

  it('should show navigation hints when there are previous/next pages', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Middle Page',
      page_index: 1,
      total_profiles: 1,
      total_pages: 3,
      has_previous_page: true,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    render(<PageIndicator />);

    await waitFor(() => {
      expect(screen.getByText('← / PageUp')).toBeInTheDocument();
      expect(screen.getByText('→ / PageDown')).toBeInTheDocument();
    });
  });

  it('should only show next hint on first page', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'First Page',
      page_index: 0,
      total_profiles: 1,
      total_pages: 3,
      has_previous_page: false,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    render(<PageIndicator />);

    await waitFor(() => {
      expect(screen.queryByText('← / PageUp')).not.toBeInTheDocument();
      expect(screen.getByText('→ / PageDown')).toBeInTheDocument();
    });
  });

  it('should only show previous hint on last page', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Last Page',
      page_index: 2,
      total_profiles: 1,
      total_pages: 3,
      has_previous_page: true,
      has_next_page: false,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    render(<PageIndicator />);

    await waitFor(() => {
      expect(screen.getByText('← / PageUp')).toBeInTheDocument();
      expect(screen.queryByText('→ / PageDown')).not.toBeInTheDocument();
    });
  });

  it('should display correct page name and count', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Development',
      profile_index: 0,
      page_name: 'Git Tools',
      page_index: 2,
      total_profiles: 2,
      total_pages: 5,
      has_previous_page: true,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    render(<PageIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Git Tools')).toBeInTheDocument();
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(tauriAPI.getNavigationContext).mockRejectedValue(new Error('API Error'));
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    const { container } = render(<PageIndicator />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should apply custom className', async () => {
    const mockContext: NavigationContext = {
      profile_name: 'Test Profile',
      profile_index: 0,
      page_name: 'Main',
      page_index: 0,
      total_profiles: 1,
      total_pages: 2,
      has_previous_page: false,
      has_next_page: true,
    };

    vi.mocked(tauriAPI.getNavigationContext).mockResolvedValue(mockContext);
    vi.mocked(tauriAPI.onProfileChanged).mockImplementation(() => () => {});

    const { container } = render(<PageIndicator className="custom-class" />);

    await waitFor(() => {
      const indicator = container.querySelector('.page-indicator');
      expect(indicator).toHaveClass('custom-class');
    });
  });
});
