import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButton from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn().mockResolvedValue({ success: true, message: 'Opened successfully' }),
    processIcon: vi.fn().mockResolvedValue({
      path: '📂',
      icon_type: 'Emoji'
    })
  },
  ActionButton: {} as ActionButtonType
}));

// Get the mocked function for assertions
const { tauriAPI } = await import('../lib/platform-api');
const mockExecuteAction = tauriAPI.executeAction as ReturnType<typeof vi.fn>;

describe('Open Action Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Folder Opening', () => {
    it('should open folder in Explorer when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Documents',
        icon: '📁',
        config: {
          target: 'C:\\Users\\TestUser\\Documents'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Documents',
          target: 'C:\\Users\\TestUser\\Documents'
        });
      });
    });

    it('should open folder with environment variable', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'User Profile',
        icon: '👤',
        config: {
          target: '%USERPROFILE%'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'User Profile',
          target: '%USERPROFILE%'
        });
      });
    });

    it('should open Downloads folder', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Downloads',
        icon: '⬇️',
        config: {
          target: 'C:\\Users\\TestUser\\Downloads'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Downloads',
          target: 'C:\\Users\\TestUser\\Downloads'
        });
      });
    });
  });

  describe('File Opening', () => {
    it('should open file with associated application', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'README',
        icon: '📄',
        config: {
          target: 'C:\\Projects\\MyProject\\README.md'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'README',
          target: 'C:\\Projects\\MyProject\\README.md'
        });
      });
    });

    it('should open text file', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Notes',
        icon: '📝',
        config: {
          target: 'C:\\Users\\TestUser\\notes.txt'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Notes',
          target: 'C:\\Users\\TestUser\\notes.txt'
        });
      });
    });

    it('should open image file', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Photo',
        icon: '🖼️',
        config: {
          target: 'C:\\Pictures\\photo.jpg'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Photo',
          target: 'C:\\Pictures\\photo.jpg'
        });
      });
    });

    it('should open PDF file', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Manual',
        icon: '📕',
        config: {
          target: 'C:\\Documents\\manual.pdf'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Manual',
          target: 'C:\\Documents\\manual.pdf'
        });
      });
    });
  });

  describe('Action Type Handling', () => {
    it('should handle Open action type correctly', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Test Folder',
        icon: '📂',
        config: {
          target: 'C:\\Test'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('title', 'Test Folder (Open)');
      
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalled();
        const callArgs = mockExecuteAction.mock.calls[0][0];
        expect(callArgs.type).toBe('Open');
        expect(callArgs.target).toBe('C:\\Test');
      });
    });

    it('should display correct icon for Open buttons', () => {
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Folder',
        icon: '📁',
        config: {
          target: 'C:\\Folder'
        }
      };

      render(<ActionButton button={button} />);
      
      // Check that the emoji icon is displayed
      const iconElement = screen.getByText('📁');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('button-icon');
    });

    it('should use default folder icon when no icon is provided', () => {
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Folder',
        config: {
          target: 'C:\\Folder'
        }
      };

      render(<ActionButton button={button} />);
      
      // The default icon for Open is 📂
      const iconElement = screen.getByText('📂');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockExecuteAction.mockRejectedValue(new Error('Failed to open'));
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Invalid Path',
        icon: '❌',
        config: {
          target: 'C:\\NonExistent\\Path'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to execute action:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Special Paths', () => {
    it('should open system folder (Program Files)', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Program Files',
        icon: '💾',
        config: {
          target: 'C:\\Program Files'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Program Files',
          target: 'C:\\Program Files'
        });
      });
    });

    it('should open network path', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Network Share',
        icon: '🌐',
        config: {
          target: '\\\\server\\share'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Network Share',
          target: '\\\\server\\share'
        });
      });
    });

    it('should open relative path', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Open',
        label: 'Relative Folder',
        icon: '📂',
        config: {
          target: '.\\subfolder'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Open',
          label: 'Relative Folder',
          target: '.\\subfolder'
        });
      });
    });
  });
});
