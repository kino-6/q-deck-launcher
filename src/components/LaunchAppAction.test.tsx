import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButton from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn().mockResolvedValue({ success: true, message: 'Application launched' }),
    processIcon: vi.fn().mockResolvedValue({
      path: '📝',
      icon_type: 'Emoji'
    })
  },
  ActionButton: {} as ActionButtonType
}));

// Get the mocked function for assertions
const { tauriAPI } = await import('../lib/platform-api');
const mockExecuteAction = tauriAPI.executeAction as ReturnType<typeof vi.fn>;

describe('LaunchApp Action Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Application Launching', () => {
    it('should launch notepad.exe when button is clicked', async () => {
      const user = userEvent.setup();
      
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
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Notepad',
          path: 'notepad.exe'
        });
      });
    });

    it('should launch calc.exe when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Calculator',
        icon: '🔢',
        config: {
          path: 'calc.exe'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Calculator',
          path: 'calc.exe'
        });
      });
    });

    it('should pass full path for applications', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'VS Code',
        icon: '💻',
        config: {
          path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'VS Code',
          path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe'
        });
      });
    });

    it('should handle LaunchApp action type correctly', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Test App',
        icon: '🚀',
        config: {
          path: 'test.exe'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('title', 'Test App (LaunchApp)');
      
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalled();
        const callArgs = mockExecuteAction.mock.calls[0][0];
        expect(callArgs.type).toBe('LaunchApp');
        expect(callArgs.path).toBe('test.exe');
      });
    });

    it('should display correct icon for LaunchApp buttons', () => {
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
      
      // Check that the emoji icon is displayed
      const iconElement = screen.getByText('📝');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('button-icon');
    });

    it('should use default rocket icon when no icon is provided', () => {
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'App',
        config: {
          path: 'app.exe'
        }
      };

      render(<ActionButton button={button} />);
      
      // The default icon for LaunchApp is 🚀
      const iconElement = screen.getByText('🚀');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Action Configuration', () => {
    it('should include all config properties in executeAction call', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Complex App',
        icon: '⚙️',
        config: {
          path: 'app.exe',
          args: ['--flag', 'value'],
          workdir: 'C:\\workspace',
          env: { VAR: 'value' }
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Complex App',
          path: 'app.exe',
          args: ['--flag', 'value'],
          workdir: 'C:\\workspace',
          env: { VAR: 'value' }
        });
      });
    });
  });

  describe('Arguments Support', () => {
    it('should launch application with arguments', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Notepad with File',
        icon: '📝',
        config: {
          path: 'notepad.exe',
          args: ['C:\\test\\file.txt']
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Notepad with File',
          path: 'notepad.exe',
          args: ['C:\\test\\file.txt']
        });
      });
    });

    it('should launch application with multiple arguments', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'App with Args',
        icon: '🚀',
        config: {
          path: 'app.exe',
          args: ['--flag1', 'value1', '--flag2', 'value2']
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'App with Args',
          path: 'app.exe',
          args: ['--flag1', 'value1', '--flag2', 'value2']
        });
      });
    });
  });

  describe('Working Directory Support', () => {
    it('should launch application with working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'PowerShell in Dir',
        icon: '💻',
        config: {
          path: 'powershell.exe',
          workdir: 'C:\\Projects\\MyProject'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'PowerShell in Dir',
          path: 'powershell.exe',
          workdir: 'C:\\Projects\\MyProject'
        });
      });
    });

    it('should launch application with arguments and working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Git Status',
        icon: '📊',
        config: {
          path: 'powershell.exe',
          args: ['-NoExit', '-Command', 'git status'],
          workdir: 'C:\\Projects\\MyRepo'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Git Status',
          path: 'powershell.exe',
          args: ['-NoExit', '-Command', 'git status'],
          workdir: 'C:\\Projects\\MyRepo'
        });
      });
    });
  });

  describe('Environment Variables Support', () => {
    it('should launch application with environment variables', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'App with Env',
        icon: '⚙️',
        config: {
          path: 'app.exe',
          env: {
            MY_VAR: 'my_value',
            ANOTHER_VAR: 'another_value'
          }
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'App with Env',
          path: 'app.exe',
          env: {
            MY_VAR: 'my_value',
            ANOTHER_VAR: 'another_value'
          }
        });
      });
    });

    it('should launch application with args, workdir, and env combined', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Full Config',
        icon: '🎯',
        config: {
          path: 'powershell.exe',
          args: ['-NoExit', '-Command', 'Write-Host $env:TEST_VAR'],
          workdir: 'C:\\TestDir',
          env: {
            TEST_VAR: 'Test Value'
          }
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'LaunchApp',
          label: 'Full Config',
          path: 'powershell.exe',
          args: ['-NoExit', '-Command', 'Write-Host $env:TEST_VAR'],
          workdir: 'C:\\TestDir',
          env: {
            TEST_VAR: 'Test Value'
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockExecuteAction.mockRejectedValue(new Error('Failed to launch'));
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'LaunchApp',
        label: 'Failing App',
        icon: '❌',
        config: {
          path: 'nonexistent.exe'
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
});
