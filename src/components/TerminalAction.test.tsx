import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButton from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

// Mock the platform API
vi.mock('../lib/platform-api', () => ({
  tauriAPI: {
    executeAction: vi.fn().mockResolvedValue({ success: true, message: 'Terminal launched' }),
    processIcon: vi.fn().mockResolvedValue({
      path: '💻',
      icon_type: 'Emoji'
    })
  },
  ActionButton: {} as ActionButtonType
}));

// Get the mocked function for assertions
const { tauriAPI } = await import('../lib/platform-api');
const mockExecuteAction = tauriAPI.executeAction as ReturnType<typeof vi.fn>;

describe('Terminal Action Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PowerShell Launching', () => {
    it('should launch PowerShell when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'PowerShell',
        icon: '💻',
        config: {
          terminal: 'PowerShell'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'PowerShell',
          terminal: 'PowerShell'
        });
      });
    });

    it('should launch PowerShell with working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'PowerShell in Projects',
        icon: '💻',
        config: {
          terminal: 'PowerShell',
          workdir: 'C:\\Projects'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'PowerShell in Projects',
          terminal: 'PowerShell',
          workdir: 'C:\\Projects'
        });
      });
    });

    it('should launch PowerShell with command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Git Status',
        icon: '📊',
        config: {
          terminal: 'PowerShell',
          command: 'git status'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Git Status',
          terminal: 'PowerShell',
          command: 'git status'
        });
      });
    });

    it('should launch PowerShell with workdir and command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Project Status',
        icon: '📊',
        config: {
          terminal: 'PowerShell',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Project Status',
          terminal: 'PowerShell',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status'
        });
      });
    });
  });

  describe('Cmd Launching', () => {
    it('should launch Cmd when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Command Prompt',
        icon: '⌨️',
        config: {
          terminal: 'Cmd'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Command Prompt',
          terminal: 'Cmd'
        });
      });
    });

    it('should launch Cmd with working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Cmd in Projects',
        icon: '⌨️',
        config: {
          terminal: 'Cmd',
          workdir: 'C:\\Projects'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Cmd in Projects',
          terminal: 'Cmd',
          workdir: 'C:\\Projects'
        });
      });
    });

    it('should launch Cmd with command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Dir Listing',
        icon: '📋',
        config: {
          terminal: 'Cmd',
          command: 'dir'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Dir Listing',
          terminal: 'Cmd',
          command: 'dir'
        });
      });
    });

    it('should launch Cmd with workdir and command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Project Dir',
        icon: '📋',
        config: {
          terminal: 'Cmd',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'dir'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Project Dir',
          terminal: 'Cmd',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'dir'
        });
      });
    });
  });

  describe('Action Type Handling', () => {
    it('should handle Terminal action type correctly', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Test Terminal',
        icon: '💻',
        config: {
          terminal: 'PowerShell'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('title', 'Test Terminal (Terminal)');
      
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalled();
        const callArgs = mockExecuteAction.mock.calls[0][0];
        expect(callArgs.type).toBe('Terminal');
        expect(callArgs.terminal).toBe('PowerShell');
      });
    });

    it('should display correct icon for Terminal buttons', () => {
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Terminal',
        icon: '💻',
        config: {
          terminal: 'PowerShell'
        }
      };

      render(<ActionButton button={button} />);
      
      // Check that the emoji icon is displayed
      const iconElement = screen.getByText('💻');
      expect(iconElement).toBeInTheDocument();
      expect(iconElement).toHaveClass('button-icon');
    });

    it('should use default terminal icon when no icon is provided', () => {
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Terminal',
        config: {
          terminal: 'PowerShell'
        }
      };

      render(<ActionButton button={button} />);
      
      // The default icon for Terminal is 💻
      const iconElement = screen.getByText('💻');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Environment Variables Support', () => {
    it('should launch terminal with environment variables', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'PowerShell with Env',
        icon: '⚙️',
        config: {
          terminal: 'PowerShell',
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
          type: 'Terminal',
          label: 'PowerShell with Env',
          terminal: 'PowerShell',
          env: {
            MY_VAR: 'my_value',
            ANOTHER_VAR: 'another_value'
          }
        });
      });
    });

    it('should launch terminal with workdir, command, and env combined', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Full Config',
        icon: '🎯',
        config: {
          terminal: 'PowerShell',
          workdir: 'C:\\TestDir',
          command: 'Write-Host $env:TEST_VAR',
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
          type: 'Terminal',
          label: 'Full Config',
          terminal: 'PowerShell',
          workdir: 'C:\\TestDir',
          command: 'Write-Host $env:TEST_VAR',
          env: {
            TEST_VAR: 'Test Value'
          }
        });
      });
    });
  });

  describe('Windows Terminal Support', () => {
    it('should launch Windows Terminal when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Windows Terminal',
        icon: '🪟',
        config: {
          terminal: 'WindowsTerminal'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Windows Terminal',
          terminal: 'WindowsTerminal'
        });
      });
    });

    it('should launch Windows Terminal with profile', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WT PowerShell',
        icon: '🪟',
        config: {
          terminal: 'WindowsTerminal',
          profile: 'PowerShell'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WT PowerShell',
          terminal: 'WindowsTerminal',
          profile: 'PowerShell'
        });
      });
    });

    it('should launch Windows Terminal with working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WT in Projects',
        icon: '🪟',
        config: {
          terminal: 'WindowsTerminal',
          workdir: 'C:\\Projects'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WT in Projects',
          terminal: 'WindowsTerminal',
          workdir: 'C:\\Projects'
        });
      });
    });

    it('should launch Windows Terminal with command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WT Git Status',
        icon: '📊',
        config: {
          terminal: 'WindowsTerminal',
          command: 'git status'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WT Git Status',
          terminal: 'WindowsTerminal',
          command: 'git status'
        });
      });
    });

    it('should launch Windows Terminal with all options', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WT Full Config',
        icon: '🎯',
        config: {
          terminal: 'WindowsTerminal',
          profile: 'PowerShell',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status',
          env: {
            MY_VAR: 'value'
          }
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WT Full Config',
          terminal: 'WindowsTerminal',
          profile: 'PowerShell',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status',
          env: {
            MY_VAR: 'value'
          }
        });
      });
    });
  });

  describe('WSL Support', () => {
    it('should launch WSL when button is clicked', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WSL',
        icon: '🐧',
        config: {
          terminal: 'WSL'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WSL',
          terminal: 'WSL'
        });
      });
    });

    it('should launch WSL with distribution', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Ubuntu',
        icon: '🐧',
        config: {
          terminal: 'WSL',
          profile: 'Ubuntu'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'Ubuntu',
          terminal: 'WSL',
          profile: 'Ubuntu'
        });
      });
    });

    it('should launch WSL with working directory', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WSL in Projects',
        icon: '🐧',
        config: {
          terminal: 'WSL',
          workdir: 'C:\\Projects'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WSL in Projects',
          terminal: 'WSL',
          workdir: 'C:\\Projects'
        });
      });
    });

    it('should launch WSL with command', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WSL ls',
        icon: '📋',
        config: {
          terminal: 'WSL',
          command: 'ls -la'
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WSL ls',
          terminal: 'WSL',
          command: 'ls -la'
        });
      });
    });

    it('should launch WSL with all options', async () => {
      const user = userEvent.setup();
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'WSL Full Config',
        icon: '🎯',
        config: {
          terminal: 'WSL',
          profile: 'Ubuntu',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status',
          env: {
            MY_VAR: 'value'
          }
        }
      };

      render(<ActionButton button={button} />);
      
      const buttonElement = screen.getByRole('button');
      await user.click(buttonElement);

      await waitFor(() => {
        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'Terminal',
          label: 'WSL Full Config',
          terminal: 'WSL',
          profile: 'Ubuntu',
          workdir: 'C:\\Projects\\MyRepo',
          command: 'git status',
          env: {
            MY_VAR: 'value'
          }
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle execution errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockExecuteAction.mockRejectedValue(new Error('Failed to launch terminal'));
      
      const button: ActionButtonType = {
        position: { row: 1, col: 1 },
        action_type: 'Terminal',
        label: 'Failing Terminal',
        icon: '❌',
        config: {
          terminal: 'PowerShell'
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
