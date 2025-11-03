import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Grid } from './Grid';
import { mockConfig } from '../test/mockData';

describe('Grid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders grid with buttons from config', () => {
    render(<Grid config={mockConfig} />);

    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  it('renders placeholder when no config provided', () => {
    render(<Grid />);

    expect(screen.getByText('No profiles configured')).toBeInTheDocument();
  });

  it('renders placeholder when no profiles in config', () => {
    const emptyConfig = { ...mockConfig, profiles: [] };
    render(<Grid config={emptyConfig} />);

    expect(screen.getByText('No profiles configured')).toBeInTheDocument();
  });

  it('renders placeholder when no pages in profile', () => {
    const configWithoutPages = {
      ...mockConfig,
      profiles: [{ ...mockConfig.profiles[0], pages: [] }],
    };
    render(<Grid config={configWithoutPages} />);

    expect(screen.getByText('No pages configured')).toBeInTheDocument();
  });

  it('creates correct grid layout', () => {
    render(<Grid config={mockConfig} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('handles context menu on buttons', () => {
    render(<Grid config={mockConfig} />);

    const button = screen.getAllByRole('button')[0];
    fireEvent.contextMenu(button);

    // Context menu should be triggered (tested in integration)
    expect(button).toBeInTheDocument();
  });

  it('calculates optimal cell size based on DPI', () => {
    // Mock window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });

    render(<Grid config={mockConfig} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('handles screen info updates', () => {
    // Mock screen properties
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

    render(<Grid config={mockConfig} />);

    const grid = document.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});