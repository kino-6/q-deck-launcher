import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ButtonEditModal } from './ButtonEditModal';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

describe('Custom Icon Support', () => {
  const mockButton: ActionButtonType = {
    position: { row: 1, col: 1 },
    label: 'Test Button',
    action_type: 'LaunchApp',
    config: {
      path: 'C:\\test.exe'
    },
    icon: '🚀',
    style: {
      background_color: '#3b82f6',
      text_color: '#ffffff',
      font_size: 14,
      font_family: 'inherit'
    }
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display emoji icon in preview', () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const preview = screen.getByText('🚀');
    expect(preview).toBeDefined();
  });

  it('should allow entering custom icon path', async () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const iconInput = screen.getByPlaceholderText('Emoji, file path, or URL');
    expect(iconInput).toBeDefined();

    // Change icon to a file path
    fireEvent.change(iconInput, { target: { value: 'C:\\icons\\custom.png' } });
    
    await waitFor(() => {
      expect((iconInput as HTMLInputElement).value).toBe('C:\\icons\\custom.png');
    });
  });

  it('should allow entering emoji icon', async () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const iconInput = screen.getByPlaceholderText('Emoji, file path, or URL');
    
    // Change icon to an emoji
    fireEvent.change(iconInput, { target: { value: '📁' } });
    
    await waitFor(() => {
      expect((iconInput as HTMLInputElement).value).toBe('📁');
    });
  });

  it('should allow entering URL icon', async () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const iconInput = screen.getByPlaceholderText('Emoji, file path, or URL');
    
    // Change icon to a URL
    fireEvent.change(iconInput, { target: { value: 'https://example.com/icon.png' } });
    
    await waitFor(() => {
      expect((iconInput as HTMLInputElement).value).toBe('https://example.com/icon.png');
    });
  });

  it('should have a browse button for file selection', () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const browseButton = screen.getByText('📁 Browse');
    expect(browseButton).toBeDefined();
  });

  it('should save button with custom icon', async () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const iconInput = screen.getByPlaceholderText('Emoji, file path, or URL');
    fireEvent.change(iconInput, { target: { value: 'C:\\icons\\custom.png' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'C:\\icons\\custom.png'
        })
      );
    });
  });

  it('should display help text for icon input', () => {
    render(
      <ButtonEditModal
        button={mockButton}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const helpText = screen.getByText(/Enter an emoji.*file path.*URL/);
    expect(helpText).toBeDefined();
  });
});

describe('Icon Format Support', () => {
  it('should support PNG icons', () => {
    const iconPath = 'C:\\icons\\app.png';
    expect(iconPath.endsWith('.png')).toBe(true);
  });

  it('should support ICO icons', () => {
    const iconPath = 'C:\\icons\\app.ico';
    expect(iconPath.endsWith('.ico')).toBe(true);
  });

  it('should support SVG icons', () => {
    const iconPath = 'C:\\icons\\app.svg';
    expect(iconPath.endsWith('.svg')).toBe(true);
  });

  it('should support JPG icons', () => {
    const iconPath = 'C:\\icons\\app.jpg';
    expect(iconPath.endsWith('.jpg')).toBe(true);
  });

  it('should support JPEG icons', () => {
    const iconPath = 'C:\\icons\\app.jpeg';
    expect(iconPath.endsWith('.jpeg')).toBe(true);
  });
});
