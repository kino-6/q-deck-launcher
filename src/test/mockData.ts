import { QDeckConfig, ActionButton } from '../lib/tauri';

export const mockConfig: QDeckConfig = {
  version: '1.0',
  ui: {
    summon: {
      hotkeys: ['F11'],
      edge_trigger: {
        enabled: false,
        edges: ['top'],
        dwell_ms: 300,
        margin_px: 5,
      },
    },
    window: {
      placement: 'dropdown-top',
      width_px: 1000,
      height_px: 600,
      cell_size_px: 96,
      gap_px: 8,
      opacity: 0.92,
      theme: 'dark',
      animation: {
        enabled: true,
        duration_ms: 150,
      },
    },
  },
  profiles: [
    {
      name: 'Default',
      hotkey: null,
      pages: [
        {
          name: 'Main',
          rows: 3,
          cols: 6,
          buttons: [
            {
              position: { row: 1, col: 1 },
              action_type: 'LaunchApp',
              label: 'Test App',
              icon: '🚀',
              config: {},
              style: null,
              action: null,
            },
            {
              position: { row: 1, col: 2 },
              action_type: 'Open',
              label: 'Test Folder',
              icon: '📁',
              config: {},
              style: null,
              action: null,
            },
          ],
        },
      ],
    },
  ],
};

export const mockButton: ActionButton = {
  position: { row: 1, col: 1 },
  action_type: 'LaunchApp',
  label: 'Test Button',
  icon: '🚀',
  config: {},
  style: null,
  action: {
    action_type: 'system',
    system_action: 'config',
    app_config: null,
    command_config: null,
  },
};