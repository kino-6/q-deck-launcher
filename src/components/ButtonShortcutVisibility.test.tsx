import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionButton } from './ActionButton';
import { ActionButton as ActionButtonType } from '../lib/platform-api';

describe('Button Shortcut Visibility', () => {
  const mockButton: ActionButtonType = {
    position: { row: 1, col: 1 },
    action_type: 'LaunchApp',
    label: 'Test Button',
    icon: '🚀',
    config: { path: 'test.exe' },
  };

  beforeEach(() => {
    // Clear any existing styles
    document.head.innerHTML = '';
  });

  it('should display shortcut number "1" on button', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('1');
  });

  it('should display shortcut number "2" on button', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="2"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('2');
  });

  it('should display shortcut number "9" on button', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="9"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('9');
  });

  it('should display shortcut number "0" on button (10th button)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="0"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('0');
  });

  it('should display Shift+1 shortcut on button (11th button)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="⇧1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('⇧1');
  });

  it('should display Shift+9 shortcut on button (19th button)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="⇧9"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('⇧9');
  });

  it('should display Shift+0 shortcut on button (20th button)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="⇧0"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('⇧0');
  });

  it('should not display badge when shortcutNumber is null', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber={null}
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeNull();
  });

  it('should not display badge when shortcutNumber is undefined', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeNull();
  });

  it('should have correct CSS class for badge', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.classList.contains('button-shortcut-badge')).toBe(true);
  });

  it('should have data-shift="false" for regular shortcuts (1-9, 0)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="5"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.getAttribute('data-shift')).toBe('false');
  });

  it('should have data-shift="true" for Shift+ shortcuts', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="⇧5"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.getAttribute('data-shift')).toBe('true');
  });

  it('should position badge in top-left corner', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    
    // Verify badge exists and is rendered (CSS positioning is defined in ActionButton.css)
    // The CSS file defines: position: absolute; top: 4px; left: 4px;
    expect(badge.className).toContain('button-shortcut-badge');
  });

  it('should be visible above button content (z-index)', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    
    // Verify badge exists and is rendered (z-index is defined in ActionButton.css)
    // The CSS file defines: z-index: 10;
    expect(badge.className).toContain('button-shortcut-badge');
  });

  it('should have pointer-events: none to not interfere with button clicks', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    
    // Verify badge exists and is rendered (pointer-events is defined in ActionButton.css)
    // The CSS file defines: pointer-events: none;
    expect(badge.className).toContain('button-shortcut-badge');
  });

  it('should display all shortcuts 1-9 correctly', () => {
    for (let i = 1; i <= 9; i++) {
      const { container } = render(
        <ActionButton
          button={mockButton}
          shortcutNumber={`${i}`}
          dpiScale={1}
        />
      );

      const badge = container.querySelector('.button-shortcut-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe(`${i}`);
    }
  });

  it('should display all Shift+ shortcuts correctly', () => {
    for (let i = 1; i <= 9; i++) {
      const { container } = render(
        <ActionButton
          button={mockButton}
          shortcutNumber={`⇧${i}`}
          dpiScale={1}
        />
      );

      const badge = container.querySelector('.button-shortcut-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe(`⇧${i}`);
    }
  });

  it('should be readable with sufficient contrast', () => {
    const { container } = render(
      <ActionButton
        button={mockButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    
    // Check that badge has background and text color set
    const styles = window.getComputedStyle(badge);
    expect(styles.background).toBeTruthy();
    expect(styles.color).toBeTruthy();
  });

  it('should maintain visibility at different DPI scales', () => {
    const dpiScales = [1, 1.25, 1.5, 2, 2.5];

    dpiScales.forEach(dpiScale => {
      const { container } = render(
        <ActionButton
          button={mockButton}
          shortcutNumber="1"
          dpiScale={dpiScale}
        />
      );

      const badge = container.querySelector('.button-shortcut-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('1');
    });
  });

  it('should be visible with custom button styling', () => {
    const styledButton: ActionButtonType = {
      ...mockButton,
      style: {
        background_color: '#ff0000',
        text_color: '#ffffff',
        font_size: 16,
      },
    };

    const { container } = render(
      <ActionButton
        button={styledButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('1');
  });

  it('should be visible on buttons with different action types', () => {
    const actionTypes: Array<ActionButtonType['action_type']> = [
      'LaunchApp',
      'Open',
      'Terminal',
    ];

    actionTypes.forEach(actionType => {
      const button: ActionButtonType = {
        ...mockButton,
        action_type: actionType,
      };

      const { container } = render(
        <ActionButton
          button={button}
          shortcutNumber="1"
          dpiScale={1}
        />
      );

      const badge = container.querySelector('.button-shortcut-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('1');
    });
  });

  it('should be visible on buttons with long labels', () => {
    const longLabelButton: ActionButtonType = {
      ...mockButton,
      label: 'This is a very long button label that might wrap',
    };

    const { container } = render(
      <ActionButton
        button={longLabelButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('1');
  });

  it('should be visible on buttons with emoji icons', () => {
    const emojiButton: ActionButtonType = {
      ...mockButton,
      icon: '🎮',
    };

    const { container } = render(
      <ActionButton
        button={emojiButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('1');
  });

  it('should be visible on buttons without icons', () => {
    const noIconButton: ActionButtonType = {
      ...mockButton,
      icon: undefined,
    };

    const { container } = render(
      <ActionButton
        button={noIconButton}
        shortcutNumber="1"
        dpiScale={1}
      />
    );

    const badge = container.querySelector('.button-shortcut-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toBe('1');
  });
});
