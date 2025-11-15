import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ActionButton } from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

describe('Icon Integration with ActionButton', () => {
  const mockOnSystemAction = vi.fn();
  const mockOnContextMenu = vi.fn();

  it('should render button with emoji icon', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' },
      icon: '🚀'
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    expect(iconElement?.textContent).toBe('🚀');
  });

  it('should render button with PNG icon path', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' },
      icon: 'C:\\icons\\app.png'
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    
    // Should contain an img element for file paths
    const imgElement = iconElement?.querySelector('img');
    expect(imgElement).toBeDefined();
  });

  it('should render button with SVG icon path', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' },
      icon: 'C:\\icons\\app.svg'
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    
    const imgElement = iconElement?.querySelector('img');
    expect(imgElement).toBeDefined();
  });

  it('should render button with URL icon', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' },
      icon: 'https://example.com/icon.png'
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    
    const imgElement = iconElement?.querySelector('img');
    expect(imgElement).toBeDefined();
  });

  it('should render button with ICO icon path', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' },
      icon: 'C:\\icons\\app.ico'
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    
    const imgElement = iconElement?.querySelector('img');
    expect(imgElement).toBeDefined();
  });

  it('should use default icon when no icon is specified', () => {
    const button: ActionButtonType = {
      position: { row: 1, col: 1 },
      label: 'Test',
      action_type: 'LaunchApp',
      config: { path: 'test.exe' }
    };

    const { container } = render(
      <ActionButton
        button={button}
        onSystemAction={mockOnSystemAction}
        onContextMenu={mockOnContextMenu}
      />
    );

    const iconElement = container.querySelector('.button-icon');
    expect(iconElement).toBeDefined();
    // LaunchApp default icon is 🚀
    expect(iconElement?.textContent).toBe('🚀');
  });
});
